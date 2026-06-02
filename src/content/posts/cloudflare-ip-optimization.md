---
title: "Cloudflare 优选 IP 方案：无需服务器，纯边缘计算实现自动优选"
pubDatetime: 2026-06-02T12:00:00Z
slug: cloudflare-ip-optimization
featured: true
draft: false
tags: ["Cloudflare", "CDN优化", "教程", "排错"]
description: 完全利用 Cloudflare 边缘计算资源实现自动优选 IP，无需任何自己的服务器，解决中国区访问缓慢问题。包含详细的错误排查和解决方案。
---

## 前言

Cloudflare 作为全球最大的 CDN 服务商之一，提供了强大的边缘计算能力。但在中国大陆地区，由于网络环境复杂，直接访问 Cloudflare 的速度往往不尽如人意。

本文将介绍一种**完全基于 Cloudflare 资源**的自动优选 IP 方案，无需任何自己的服务器，通过 Workers + KV + Cron Triggers 实现自动测速和动态反代。同时，本文还包含了实际部署过程中遇到的错误及解决方案。

## 方案架构

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Cron Triggers (定时任务)                          │
│  每天自动触发 Workers 测速脚本                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers (测速脚本)                                │
│  扫描 Cloudflare IP → 实时测速 → 选出最优 IP                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare KV (键值存储)                                     │
│  存储最优 IP 列表和延迟数据                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers (反代服务)                              │
│  从 KV 读取最优 IP → 动态反代用户请求                            │
└─────────────────────────────────────────────────────────────┘
```

## 步骤一：创建 KV 命名空间

KV 用于存储测速结果和最优 IP 列表。

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. **左侧菜单** → **Workers 和 Pages**
3. 点击顶部标签 **KV**
4. 点击 **创建命名空间**
5. **名称**：`cf-ip-optimization`
6. 点击 **创建**

## 步骤二：创建测速 Worker

这个 Worker 负责扫描 Cloudflare IP 段并测试延迟，选出最优 IP。

### 2.1 创建 Worker

1. **左侧菜单** → **Workers 和 Pages**
2. 点击 **创建 Worker**
3. **Worker 名称**：`cf-ip-scanner`
4. 点击 **部署**

### 2.2 编辑代码

点击 **编辑代码**，替换为以下代码：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled(event));
});

// Cloudflare IP 段列表（扩大范围以提高成功率）
const IP_RANGES = [
  '104.16.0.0/12',
  '104.24.0.0/14',
  '108.162.192.0/18',
  '172.64.0.0/13',
  '172.67.0.0/16',
  '188.114.96.0/20',
  '190.93.240.0/20',
  '198.41.128.0/17',
  '199.27.128.0/21'
];

// 从 IP 段生成随机 IP
function generateRandomIp(ipRange) {
  const [base, bits] = ipRange.split('/');
  const ipParts = base.split('.').map(Number);
  
  let ipInt = 0;
  for (let i = 0; i < 4; i++) {
    ipInt = (ipInt << 8) | ipParts[i];
  }
  
  const mask = (1 << (32 - parseInt(bits))) - 1;
  const randomOffset = Math.floor(Math.random() * mask);
  ipInt = (ipInt & ~mask) | randomOffset;
  
  return [
    (ipInt >> 24) & 0xFF,
    (ipInt >> 16) & 0xFF,
    (ipInt >> 8) & 0xFF,
    ipInt & 0xFF
  ].join('.');
}

// 测试单个 IP 的延迟（使用 HTTP 避免证书问题）
async function testLatency(ip) {
  const start = Date.now();
  
  // 方法1：尝试 HTTP
  try {
    const response = await fetch(`http://${ip}/cdn-cgi/trace`, {
      method: 'GET',
      cf: { cacheTtl: 0 },
      redirect: 'manual'
    });
    
    if (response.status >= 200 && response.status < 400) {
      return Date.now() - start;
    }
  } catch (e) {
    console.log(`HTTP 测试失败 - ${ip}: ${e.message}`);
  }
  
  // 方法2：尝试 HEAD 请求
  try {
    const response = await fetch(`http://${ip}/`, {
      method: 'HEAD',
      cf: { cacheTtl: 0 },
      redirect: 'manual'
    });
    
    if (response.status >= 200 && response.status < 500) {
      return Date.now() - start;
    }
  } catch (e) {
    console.log(`HEAD 测试失败 - ${ip}: ${e.message}`);
  }
  
  return 9999;
}

// 主测速逻辑（增加测试数量）
async function scanAndTest(count = 50) {
  const results = [];
  const testedIps = new Set();
  
  for (let i = 0; i < count; i++) {
    let ip;
    // 确保不重复测试同一个 IP
    do {
      const ipRange = IP_RANGES[Math.floor(Math.random() * IP_RANGES.length)];
      ip = generateRandomIp(ipRange);
    } while (testedIps.has(ip));
    
    testedIps.add(ip);
    const latency = await testLatency(ip);
    
    if (latency < 9999) {
      results.push({ ip, latency });
      console.log(`有效 IP: ${ip} - ${latency}ms`);
    }
  }
  
  results.sort((a, b) => a.latency - b.latency);
  return results.slice(0, 10);
}

// 处理定时任务
async function handleScheduled(event) {
  console.log('开始定时测速...');
  const bestIps = await scanAndTest();
  
  if (bestIps.length > 0) {
    await CF_IP_OPTIMIZATION.put('best_ips', JSON.stringify(bestIps));
    await CF_IP_OPTIMIZATION.put('last_update', new Date().toISOString());
    console.log(`最优 IP 已更新: ${bestIps.length} 个`);
  } else {
    console.log('未找到有效 IP');
  }
}

// 处理 HTTP 请求（手动触发）
async function handleRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/scan') {
    console.log('手动触发扫描...');
    const bestIps = await scanAndTest();
    
    if (bestIps.length > 0) {
      await CF_IP_OPTIMIZATION.put('best_ips', JSON.stringify(bestIps));
      await CF_IP_OPTIMIZATION.put('last_update', new Date().toISOString());
    }
    
    return new Response(JSON.stringify({
      best_ips: bestIps,
      count: bestIps.length,
      scanned: 50,
      message: bestIps.length > 0 ? '扫描成功' : '未找到有效 IP'
    }, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  const currentIps = await CF_IP_OPTIMIZATION.get('best_ips');
  const lastUpdate = await CF_IP_OPTIMIZATION.get('last_update');
  
  return new Response(JSON.stringify({
    best_ips: currentIps ? JSON.parse(currentIps) : [],
    last_update: lastUpdate,
    status: currentIps && JSON.parse(currentIps).length > 0 ? 'ok' : 'no_data'
  }, null, 2), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
```

点击 **保存并部署**。

### 2.3 配置 Cron 触发器

1. 在 Worker 页面 → **触发器**
2. 点击 **添加 Cron 触发器**
3. **计划**：`0 2 * * *`（每天凌晨 2 点自动执行）
4. 点击 **添加触发器**

## 步骤三：创建反代 Worker

这个 Worker 负责从 KV 读取最优 IP 并反代用户请求。

### 3.1 创建 Worker

1. 点击 **创建 Worker**
2. **Worker 名称**：`cf-ip-proxy`
3. 点击 **部署**

### 3.2 编辑代码

点击 **编辑代码**，替换为以下代码：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 目标域名（使用 Cloudflare Pages 默认域名，避免 DNS 循环）
const TARGET_DOMAIN = 'blog-ac5.pages.dev';

// 获取最优 IP
async function getBestIp() {
  try {
    const bestIpsStr = await CF_IP_OPTIMIZATION.get('best_ips');
    
    if (!bestIpsStr) {
      console.log('KV 中没有最优 IP');
      return null;
    }
    
    const bestIps = JSON.parse(bestIpsStr);
    return bestIps.length > 0 ? bestIps[0].ip : null;
  } catch (e) {
    console.error('获取最优 IP 失败:', e);
    return null;
  }
}

// 处理请求
async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const targetIp = await getBestIp();
    
    let targetUrl;
    
    if (targetIp) {
      // 使用优选 IP 访问
      targetUrl = new URL(`https://${targetIp}${url.pathname}${url.search}`);
    } else {
      // 没有优选 IP，直接访问目标域名
      targetUrl = new URL(`https://${TARGET_DOMAIN}${url.pathname}${url.search}`);
    }
    
    const newRequest = new Request(targetUrl, {
      headers: new Headers({
        ...request.headers,
        'Host': TARGET_DOMAIN,
        'X-Forwarded-Host': TARGET_DOMAIN,
        'X-Real-IP': request.headers.get('CF-Connecting-IP') || ''
      }),
      method: request.method,
      body: request.body,
      redirect: 'manual',
      cf: {
        cacheTtl: 0
      }
    });
    
    const response = await fetch(newRequest);
    const responseHeaders = new Headers(response.headers);
    
    // 添加自定义响应头
    responseHeaders.set('X-CF-Optimized-IP', targetIp || 'direct');
    responseHeaders.set('X-CF-Worker', 'cf-ip-proxy');
    
    // 允许跨域
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (e) {
    console.error('反代请求失败:', e);
    
    // 降级处理：直接访问目标域名
    try {
      const url = new URL(request.url);
      const targetUrl = new URL(`https://${TARGET_DOMAIN}${url.pathname}${url.search}`);
      const response = await fetch(targetUrl, {
        cf: { cacheTtl: 0 }
      });
      
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('X-CF-Optimized-IP', 'fallback');
      
      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });
    } catch (fallbackError) {
      console.error('降级请求也失败:', fallbackError);
      return new Response('服务暂时不可用', { status: 503 });
    }
  }
}
```

**注意**：将 `TARGET_DOMAIN` 修改为你的 Cloudflare Pages 默认域名（如 `xxx.pages.dev`）。

点击 **保存并部署**。

## 步骤四：绑定 KV 到 Workers

两个 Worker 都需要绑定 KV 才能读写数据。

### 4.1 为测速 Worker 绑定 KV

1. 进入 `cf-ip-scanner` Worker → **设置** → **变量**
2. 点击 **KV 命名空间绑定** → **添加绑定**
3. **变量名称**：`CF_IP_OPTIMIZATION`（必须完全一致）
4. **KV 命名空间**：选择 `cf-ip-optimization`
5. 点击 **保存**

### 4.2 为反代 Worker 绑定 KV

1. 进入 `cf-ip-proxy` Worker → **设置** → **变量**
2. 点击 **KV 命名空间绑定** → **添加绑定**
3. **变量名称**：`CF_IP_OPTIMIZATION`
4. **KV 命名空间**：选择 `cf-ip-optimization`
5. 点击 **保存**

## 步骤五：配置 DNS 和路由

### 5.1 配置 DNS 记录

1. **左侧菜单** → **域名** → 选择你的域名
2. 点击 **添加记录**
3. 选择 **CNAME** 记录（推荐）
4. **名称**：`cf`（或其他子域名，如 `optimize`）
5. **目标**：`cf-ip-proxy.ss-svip.workers.dev`（你的反代 Worker 域名）
6. 开启 **代理状态**（橙色云朵图标）
7. 点击 **保存**

### 5.2 配置 Worker 路由

1. 进入 `cf-ip-proxy` Worker → **触发器**
2. 点击 **添加路由**
3. **路由**：`cf.yourdomain.com/*`（如 `cf.xiaozha.org/*`）
4. **Worker**：选择 `cf-ip-proxy`
5. 点击 **添加路由**

## 步骤六：测试验证

### 6.1 手动触发测速

访问以下 URL 手动触发一次测速：

```
https://cf-ip-scanner.ss-svip.workers.dev/scan
```

### 6.2 查看测速结果

访问以下 URL 查看当前最优 IP：

```
https://cf-ip-scanner.ss-svip.workers.dev/
```

返回示例：

```json
{
  "best_ips": [
    { "ip": "104.18.12.100", "latency": 45 },
    { "ip": "172.67.130.150", "latency": 52 },
    { "ip": "108.162.200.50", "latency": 68 }
  ],
  "last_update": "2026-06-02T02:00:00.000Z",
  "status": "ok"
}
```

### 6.3 测试反代服务

访问你配置的域名：

```
https://cf.xiaozha.org/
```

检查响应头中的 `X-CF-Optimized-IP`，确认使用了最优 IP。

## 常见错误及解决方案

### 错误 1：测速返回空数组

**现象**：访问 `/scan` 返回空数组 `[]`

**原因**：使用 HTTPS 直接访问 IP 会导致证书验证失败

**解决方案**：
- 使用 HTTP 协议测试 IP（如代码中所示）
- 扩大 IP 段范围
- 增加测试数量

### 错误 2：访问反代域名返回错误 1003

**现象**：访问 `https://cf.xiaozha.org/` 返回错误代码 1003

**原因**：DNS 解析循环或路由配置问题

**解决方案**：
- 使用 Pages 默认域名作为目标（如 `xxx.pages.dev`）
- 确保 DNS 记录使用 CNAME 指向 Worker 域名
- 检查 Worker 路由配置是否正确

### 错误 3：访问反代域名返回错误 1016

**现象**：访问 `https://cf.xiaozha.org/` 返回错误代码 1016

**原因**：源服务器 DNS 解析失败

**解决方案**：
- 确保 `TARGET_DOMAIN` 使用正确的 Pages 默认域名
- 验证 Pages 项目是否正常运行
- 检查 DNS 配置是否正确

### 错误 4：Worker 代码报错 "CF_IP_OPTIMIZATION is not defined"

**现象**：Worker 日志显示 KV 绑定未定义

**原因**：KV 命名空间未正确绑定

**解决方案**：
- 进入 Worker → **设置** → **变量**
- 添加 KV 绑定，变量名称必须为 `CF_IP_OPTIMIZATION`
- 选择正确的 KV 命名空间

### 错误 5：Astro 构建失败 "Missing field `tsconfigPaths`"

**现象**：Cloudflare Pages 构建失败，提示 Tailwind CSS 相关错误

**原因**：`@tailwindcss/vite` 4.x 与 Astro 6.x 兼容性问题

**解决方案**：
- 降级 `@tailwindcss/vite` 到 4.0.0
- 或改用 PostCSS 方式处理 Tailwind CSS
- 修改 `astro.config.ts` 配置

### 错误 6：pnpm 安装失败 "ERR_PNPM_OUTDATED_LOCKFILE"

**现象**：构建时提示 lockfile 不匹配

**解决方案**：
- 删除 `pnpm-lock.yaml` 文件
- 将其添加到 `.gitignore`
- 使用 npm 进行依赖管理

## Cloudflare 免费额度

本方案完全使用 Cloudflare 免费资源：

| 资源 | 免费额度 |
|-----|---------|
| Workers 请求 | 每天 100,000 次 |
| KV 存储 | 1 GB |
| Cron Triggers | 每天 1,000 次 |
| Pages 带宽 | 每月 100 GB |

对于个人博客或小型网站，免费额度完全足够。

## 方案优势

| 特性 | 说明 |
|-----|-----|
| **零服务器成本** | 完全使用 Cloudflare 免费资源 |
| **自动测速更新** | 每天自动扫描并更新最优 IP |
| **全球边缘部署** | Workers 在全球 300+ 节点运行 |
| **高可用性** | Cloudflare 提供 99.99% SLA |
| **无需维护** | 配置完成后自动运行 |
| **降级机制** | 优选 IP 失效时自动降级 |

## 常见问题

### Q: 为什么访问速度还是慢？

A: 可能的原因：
1. KV 中还没有最优 IP 数据，请先手动触发一次测速
2. 当前最优 IP 不适合你的网络，可以增加测速样本数量
3. 目标网站本身响应慢

### Q: 如何增加测速样本？

A: 修改 `scanAndTest` 函数的参数：

```javascript
const bestIps = await scanAndTest(50); // 测试 50 个 IP
```

### Q: 如何查看日志？

A: 在 Worker 页面 → **Observability** → **日志** 中查看实时日志。

### Q: 如何禁用优选功能？

A: 直接访问原域名即可，或删除 Worker 路由配置。

### Q: 为什么必须使用 Pages 默认域名？

A: 使用自定义域名会导致 DNS 解析循环，因为自定义域名本身也通过 Cloudflare 代理。

## 总结

通过 Cloudflare Workers + KV + Cron Triggers，我们实现了一个完全无服务器的自动优选 IP 方案。这个方案不仅免费，而且维护成本低，配置完成后就能自动运行。

在部署过程中，我们遇到了多个问题，包括证书验证、DNS 循环、构建兼容性等，但通过正确的配置和代码调整都得到了解决。

如果你的网站也部署在 Cloudflare 上，强烈推荐尝试这个方案来优化中国区用户的访问体验！

---

**参考资料**：

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare Cron Triggers 文档](https://developers.cloudflare.com/workers/runtime-apis/cron-triggers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
