---
title: "Cloudflare 优选 IP 方案：无需服务器，纯边缘计算实现自动优选"
pubDatetime: 2026-06-01T12:00:00Z
slug: cloudflare-ip-optimization
featured: true
draft: false
tags: ["Cloudflare", "CDN优化", "教程"]
description: 完全利用 Cloudflare 边缘计算资源实现自动优选 IP，无需任何自己的服务器，解决中国区访问缓慢问题。
---

## 前言

Cloudflare 作为全球最大的 CDN 服务商之一，提供了强大的边缘计算能力。但在中国大陆地区，由于网络环境复杂，直接访问 Cloudflare 的速度往往不尽如人意。

本文将介绍一种**完全基于 Cloudflare 资源**的自动优选 IP 方案，无需任何自己的服务器，通过 Workers + KV + Cron Triggers 实现自动测速和动态反代。

## 方案架构

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Cron Triggers (定时任务)                         │
│  每天自动触发 Workers 测速脚本                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers (测速脚本)                              │
│  扫描 Cloudflare IP → 实时测速 → 选出最优 IP                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare KV (键值存储)                                   │
│  存储最优 IP 列表和延迟数据                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers (反代服务)                              │
│  从 KV 读取最优 IP → 动态反代用户请求                        │
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

// Cloudflare IP 段列表
const IP_RANGES = [
  '104.16.0.0/12',
  '108.162.192.0/18',
  '172.67.0.0/16',
  '188.114.96.0/20'
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

// 测试单个 IP 的延迟
async function testLatency(ip) {
  const start = Date.now();
  try {
    const response = await fetch(`https://${ip}/cdn-cgi/trace`, {
      method: 'GET',
      cf: { cacheTtl: 0 },
      timeout: 3000
    });
    if (response.ok) {
      return Date.now() - start;
    }
  } catch (e) {
    console.log(`IP ${ip} 测试失败: ${e}`);
  }
  return 9999;
}

// 主测速逻辑
async function scanAndTest(count = 20) {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const ipRange = IP_RANGES[Math.floor(Math.random() * IP_RANGES.length)];
    const ip = generateRandomIp(ipRange);
    const latency = await testLatency(ip);
    
    if (latency < 9999) {
      results.push({ ip, latency });
      console.log(`IP ${ip}: ${latency}ms`);
    }
  }
  
  results.sort((a, b) => a.latency - b.latency);
  return results.slice(0, 5);
}

// 处理定时任务
async function handleScheduled(event) {
  console.log('开始定时测速...');
  const bestIps = await scanAndTest();
  
  if (bestIps.length > 0) {
    await CF_IP_OPTIMIZATION.put('best_ips', JSON.stringify(bestIps));
    await CF_IP_OPTIMIZATION.put('last_update', new Date().toISOString());
    console.log(`最优 IP 已更新: ${JSON.stringify(bestIps)}`);
  }
}

// 处理 HTTP 请求（手动触发）
async function handleRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/scan') {
    const bestIps = await scanAndTest();
    await CF_IP_OPTIMIZATION.put('best_ips', JSON.stringify(bestIps));
    await CF_IP_OPTIMIZATION.put('last_update', new Date().toISOString());
    
    return new Response(JSON.stringify(bestIps, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const currentIps = await CF_IP_OPTIMIZATION.get('best_ips');
  const lastUpdate = await CF_IP_OPTIMIZATION.get('last_update');
  
  return new Response(JSON.stringify({
    best_ips: currentIps ? JSON.parse(currentIps) : [],
    last_update: lastUpdate,
    status: 'ok'
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
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

// 目标域名（你的实际网站）
const TARGET_DOMAIN = 'xiaozha.org';

// 获取最优 IP
async function getBestIp() {
  const bestIpsStr = await CF_IP_OPTIMIZATION.get('best_ips');
  
  if (!bestIpsStr) {
    return '104.18.12.100'; // 默认 IP
  }
  
  const bestIps = JSON.parse(bestIpsStr);
  return bestIps.length > 0 ? bestIps[0].ip : '104.18.12.100';
}

// 处理请求
async function handleRequest(request) {
  const url = new URL(request.url);
  const targetIp = await getBestIp();
  const targetUrl = new URL(`https://${targetIp}${url.pathname}${url.search}`);
  
  const newRequest = new Request(targetUrl, {
    headers: new Headers({
      ...request.headers,
      'Host': TARGET_DOMAIN,
      'X-Forwarded-Host': TARGET_DOMAIN,
      'X-Real-IP': request.headers.get('CF-Connecting-IP') || ''
    }),
    method: request.method,
    body: request.body,
    redirect: 'follow'
  });
  
  const response = await fetch(newRequest);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('X-CF-Optimized-IP', targetIp);
  
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}
```

**注意**：将 `TARGET_DOMAIN` 修改为你的实际域名。

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
3. 选择 **A** 记录
4. **名称**：`cf`（或其他子域名，如 `optimize`）
5. **IPv4 地址**：`192.0.2.1`（占位 IP，实际由 Worker 处理）
6. 开启 **代理状态**（橙色云朵图标）
7. 点击 **保存**

### 5.2 配置 Worker 路由

1. 进入 `cf-ip-proxy` Worker → **概述**
2. 点击 **触发器** → **路由**
3. 点击 **添加路由**
4. **路由**：`cf.yourdomain.com/*`（如 `cf.xiaozha.org/*`）
5. 点击 **添加路由**

## 步骤六：测试验证

### 6.1 手动触发测速

访问以下 URL 手动触发一次测速：

```
https://cf-ip-scanner.你的账户.workers.dev/scan
```

### 6.2 查看测速结果

访问以下 URL 查看当前最优 IP：

```
https://cf-ip-scanner.你的账户.workers.dev/
```

返回示例：

```json
{
  "best_ips": [
    { "ip": "104.18.12.100", "latency": 50 },
    { "ip": "172.67.130.100", "latency": 60 },
    { "ip": "108.162.200.100", "latency": 70 }
  ],
  "last_update": "2026-06-01T02:00:00.000Z",
  "status": "ok"
}
```

### 6.3 测试反代服务

访问你配置的域名：

```
https://cf.xiaozha.org/
```

检查响应头中的 `X-CF-Optimized-IP`，确认使用了最优 IP。

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

## 总结

通过 Cloudflare Workers + KV + Cron Triggers，我们实现了一个完全无服务器的自动优选 IP 方案。这个方案不仅免费，而且维护成本低，配置完成后就能自动运行。

如果你的网站也部署在 Cloudflare 上，强烈推荐尝试这个方案来优化中国区用户的访问体验！

---

**参考资料**：

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare Cron Triggers 文档](https://developers.cloudflare.com/workers/runtime-apis/cron-triggers/)
