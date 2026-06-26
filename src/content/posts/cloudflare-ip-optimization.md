---
title: "Cloudflare 优选 IP 终极方案：零成本三网分线路解析，彻底解决国内访问慢"
pubDatetime: 2026-06-26T12:00:00Z
slug: cloudflare-ip-optimization
featured: true
draft: false
tags: ["Cloudflare", "CDN优化", "教程", "排错"]
description: 采用 GitHub Actions + CloudflareSpeedTest + DNSPod 实现三网分线路优选，彻底避开 Workers 测速失真的坑，电信/联通/移动用户自动命中最优节点。
---

## 前言

Cloudflare 作为全球最大的 CDN 服务商之一，提供了强大的边缘计算能力。但在中国大陆地区，由于网络环境复杂，直接访问 Cloudflare 的速度往往不尽如人意。

**重要更新**：之前基于 Cloudflare Workers 的自动优选方案存在致命缺陷——Workers 运行在海外边缘节点，从海外测出的延迟对国内访客毫无参考价值。本文已全面升级为**GitHub Actions + CloudflareSpeedTest + DNSPod**方案，彻底解决测速失真问题。

## 旧方案的致命缺陷

### 问题根源

```
┌─────────────────────────────────────────────────────────┐
│  旧方案：Cloudflare Workers 测速                          │
│  Workers 运行在海外节点（如美国、日本）                     │
│  从海外测试 CF IP 延迟 → 结果与国内实际延迟完全不符           │
└─────────────────────────────────────────────────────────┘
                              ↓
                    海外延迟低 ≠ 国内延迟低
                    例如：美国节点测出 20ms
                    国内实际访问可能 200ms+
```

### 具体表现

1. **测速失真**：Workers 海外节点到 CF IP 的延迟 ≠ 国内访客到同一 IP 的延迟
2. **1003 错误**：开启 CF 代理后使用优选 IP 直连会触发 Cloudflare 安全拦截
3. **单 IP 局限性**：无法区分运营商，电信用户可能命中移动优选 IP

## 新方案架构（推荐）

```
┌─────────────────────────────────────────────────────────────────────┐
│  GitHub Actions (定时任务)                                            │
│  运行环境为国内出口，测速结果匹配国内真实延迟                              │
│  定时：每天 4 次 (02:00, 08:00, 14:00, 20:00)                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CloudflareSpeedTest (测速工具)                                       │
│  国内公认最稳的 CF IP 测速程序，支持多线程并发测试                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DNSPod DNS (分线路解析)                                              │
│  电信用户 → 电信优选 IP                                               │
│  联通用户 → 联通优选 IP                                               │
│  移动用户 → 移动优选 IP                                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Cloudflare 节点 (IP 直连)                                            │
│  关闭 CF 代理（灰色云朵），直接访问优选 IP，避免 1003 拦截               │
└─────────────────────────────────────────────────────────────────────┘
```

## 方案优势对比

| 特性 | 旧方案 (Workers) | 新方案 (Actions + DNSPod) |
|------|------------------|--------------------------|
| 测速环境 | 海外节点 | 国内线路（匹配真实访客） |
| 准确率 | 低（失真严重） | 高（接近 100%） |
| 运营商区分 | 不支持 | 支持三网分线路 |
| 1003 错误 | 易触发 | 完全避免 |
| 成本 | 免费 | 免费 |
| 稳定性 | 中等 | 高 |

## 步骤一：DNS 迁移到 DNSPod

### 1.1 创建 DNSPod 账号

1. 登录 [腾讯云 DNSPod](https://dnspod.cloud.tencent.com/)
2. 如果没有账号，使用微信/QQ 扫码注册
3. 进入 **域名管理**，点击 **添加域名**

### 1.2 获取 API 密钥

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. **访问管理** → **API 密钥管理**
3. 点击 **新建密钥**
4. 保存 `SecretId` 和 `SecretKey`（重要，后续需要）

### 1.3 添加 DNS 记录

在 DNSPod 为域名添加 3 条 A 记录（分运营商）：

| 主机记录 | 记录类型 | 线路类型 | 记录值 | TTL |
|---------|---------|---------|--------|-----|
| @ | A | 电信 | 1.1.1.1（临时值） | 600 |
| @ | A | 联通 | 1.1.1.1（临时值） | 600 |
| @ | A | 移动 | 1.1.1.1（临时值） | 600 |

> 注意：记录值先填临时 IP，后续 Actions 会自动更新。

### 1.4 修改域名 NS 记录

将域名的 DNS 服务器修改为 DNSPod 的 NS：

```
f1g1ns1.dnspod.net
f1g1ns2.dnspod.net
```

> 不同域名注册商修改位置不同，一般在"域名管理"→"DNS 服务器"中修改。

## 步骤二：部署 cf2dns 项目

### 2.1 Fork 仓库

访问 [tmmtoo/cf2dns](https://github.com/tmmtoo/cf2dns)，点击 **Fork** 到你自己的 GitHub 账号。

### 2.2 配置 Secrets

进入 Fork 后的仓库 → **Settings** → **Secrets and variables** → **Actions**：

点击 **New repository secret**，添加以下 4 个密钥：

| Secret 名称 | 填写内容 |
|------------|---------|
| SECRETID | 腾讯云 SecretId |
| SECRETKEY | 腾讯云 SecretKey |
| DOMAINS | 域名配置，示例：`{"xiaozha.org":{"@":["CM","CU","CT"]}}` |
| KEY | 留空或使用内置公共 IP 库 |

> 参数说明：
> - `CM` = 移动（China Mobile）
> - `CU` = 联通（China Unicom）
> - `CT` = 电信（China Telecom）

### 2.3 配置定时任务

编辑 `.github/workflows/main.yml`，修改 Cron 表达式：

```yaml
on:
  schedule:
    - cron: '0 2,8,14,20 * * *'  # 每天 4 次：02:00, 08:00, 14:00, 20:00
  workflow_dispatch:  # 手动触发
```

> 建议每天 4 次轮换，防止 IP 被封堵。

## 步骤三：Cloudflare 配置

### 3.1 关闭橙色代理

在 Cloudflare 控制台（如果你还保留了 CF 配置）：

1. **左侧菜单** → **域名** → 选择你的域名
2. 找到对应的 DNS 记录
3. 将代理状态改为 **仅 DNS**（灰色云朵图标）

> **关键**：关闭 CF 代理，优选 IP 直连，不会触发 1003 拦截。

### 3.2 SSL 设置

1. **左侧菜单** → **SSL/TLS** → **概述**
2. 设置为 **严格 (Strict)**
3. 确保站点已配置有效的 SSL 证书

## 步骤四：验证测试

### 4.1 手动触发一次

在 Fork 的仓库页面 → **Actions** → 选择工作流 → **Run workflow**：

等待工作流执行完成，查看日志确认：
- CloudflareSpeedTest 成功测速
- 选出了最优 IP
- DNSPod DNS 记录已更新

### 4.2 验证分线路解析

使用不同运营商的网络访问你的网站，检查响应头或使用 DNS 查询工具：

```bash
# 电信线路
nslookup xiaozha.org 202.96.128.86

# 联通线路
nslookup xiaozha.org 219.150.32.132

# 移动线路
nslookup xiaozha.org 211.136.112.200
```

应该返回不同的优选 IP。

### 4.3 验证访问速度

使用浏览器开发者工具（F12）→ **网络** 面板，查看页面加载时间：

- 首屏加载时间应低于 1 秒
- 静态资源加载时间应低于 200ms

## 避坑要点

### 坑 1：不要在 Workers 里测速

**原因**：Workers 运行在海外节点，测速结果失真。

**解决方案**：改用 GitHub Actions，其运行环境为国内出口。

### 坑 2：优选 IP 必须关闭 CF 代理

**原因**：开启 CF 橙色代理后，IP 直连会触发 1003 安全拦截。

**解决方案**：DNS 记录使用灰色云朵（仅 DNS）。

### 坑 3：不要单次扫描过多 IP

**原因**：频繁大量扫描可能触发 Cloudflare 风控。

**解决方案**：每 6 小时测速一次，单次 50 个 IP 即可。

### 坑 4：选择正确的 IP 段

**原因**：Cloudflare 有回源 IP 和访客任播 IP，选错会影响效果。

**解决方案**：只选择以下访客任播段：
```
104.16.0.0/12
172.64.0.0/13
```

## 备用方案：低配 VPS 定时任务

如果你有闲置小 VPS（国内轻量云，最低配置即可，月费 5 元以内），稳定性高于 Actions。

### 1. 安装 CloudflareSpeedTest

```bash
wget https://github.com/XIU2/CloudflareSpeedTest/releases/download/v2.2.5/CloudflareSpeedTest_linux_amd64.tar.gz
tar -zxvf CloudflareSpeedTest_linux_amd64.tar.gz
mv CloudflareSpeedTest /usr/local/bin/
```

### 2. 编写测速脚本

创建 `cf-speedtest.sh`：

```bash
#!/bin/bash

CLOUDFLAREST="/usr/local/bin/CloudflareSpeedTest"
RESULT_FILE="/tmp/cf-result.csv"
DOMAIN="xiaozha.org"

# 测速，输出延迟最低的 10 个 IP
$CLOUDFLAREST -o $RESULT_FILE -dn 10

# 提取最优 IP
BEST_IP=$(head -n 1 $RESULT_FILE | cut -d ',' -f 1)

echo "最优 IP: $BEST_IP"
```

### 3. 配置 DNSPod API 更新

使用 DNSPod API 自动更新 DNS 记录：

```bash
# 需要安装 jq
apt install -y jq

# 获取记录 ID
RECORD_ID=$(curl -s "https://dnsapi.cn/Record.List" \
  -d "login_token=SecretId,SecretKey" \
  -d "format=json" \
  -d "domain=$DOMAIN" \
  -d "sub_domain=@" \
  | jq -r '.records[0].id')

# 更新记录
curl -s "https://dnsapi.cn/Record.Modify" \
  -d "login_token=SecretId,SecretKey" \
  -d "format=json" \
  -d "domain=$DOMAIN" \
  -d "record_id=$RECORD_ID" \
  -d "sub_domain=@" \
  -d "record_type=A" \
  -d "record_line=电信" \
  -d "value=$BEST_IP"
```

### 4. 设置定时任务

```bash
crontab -e

# 添加以下内容（每 6 小时执行一次）
0 */6 * * * /root/cf-speedtest.sh >> /var/log/cf-speedtest.log 2>&1
```

## 终极稳速架构（推荐）

兼顾加速 + 防封，配置故障转移：

```
┌─────────────────────────────────────────────────────────┐
│  主解析：DNSPod 三线路优选 IP                            │
│  电信/联通/移动用户自动匹配对应最快节点                    │
│  关闭 CF 代理，IP 直连                                   │
└─────────────────────────────────────────────────────────┘
                              ↓
                    IP 失效时自动切换
                              ↓
┌─────────────────────────────────────────────────────────┐
│  备用解析：Cloudflare Workers 反代                       │
│  当所有优选 IP 失效时，自动回退到 Worker 兜底线路          │
└─────────────────────────────────────────────────────────┘
```

### Workers 兜底代码

创建一个 Worker 作为故障兜底：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const TARGET_DOMAIN = 'blog-ac5.pages.dev';

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    const targetUrl = new URL(`https://${TARGET_DOMAIN}${url.pathname}${url.search}`);
    
    const newRequest = new Request(targetUrl, {
      headers: new Headers({
        ...request.headers,
        'Host': TARGET_DOMAIN
      }),
      method: request.method,
      body: request.body,
      cf: { cacheTtl: 0 }
    });
    
    const response = await fetch(newRequest);
    const responseHeaders = new Headers(response.headers);
    
    responseHeaders.set('X-CF-Fallback', 'active');
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (e) {
    console.error('兜底请求失败:', e);
    return new Response('服务暂时不可用', { status: 503 });
  }
}
```

## 成本总结

| 资源 | 费用 | 说明 |
|------|------|------|
| GitHub Actions | 免费 | 每月 2000 分钟运行时长 |
| DNSPod DNS | 免费 | 免费版足够 |
| Cloudflare | 免费 | 免费版带宽和功能足够 |
| 国内 VPS（可选） | 约 5 元/月 | 仅备用方案需要 |

**全程免费方案可用**，对于个人博客完全足够。

## 常见问题

### Q: 为什么 GitHub Actions 测速更准确？

A: GitHub Actions 的运行环境虽然在海外，但使用的是国内出口线路（通过 CDN 加速），测速结果更接近国内真实延迟。

### Q: 如何查看测速日志？

A: 在 GitHub Actions 工作流页面，点击对应的运行记录即可查看详细日志。

### Q: 优选 IP 会被封禁吗？

A: Cloudflare 的访客任播 IP 段不会被封禁，但可能会出现网络波动。建议每天多次轮换优选 IP。

### Q: 需要保留 Cloudflare 配置吗？

A: 需要保留 Cloudflare 作为源站托管，但 DNS 解析必须在 DNSPod，CF 代理必须关闭（灰色云朵）。

### Q: 如何验证分线路解析是否生效？

A: 使用不同运营商的手机网络访问网站，或使用在线 DNS 查询工具分别查询电信/联通/移动线路的解析结果。

## 总结

通过 **GitHub Actions + CloudflareSpeedTest + DNSPod** 方案，我们实现了：

1. **精准测速**：国内线路测速，结果匹配真实访客延迟
2. **三网分线路**：电信/联通/移动用户自动匹配对应最优 IP
3. **零成本**：全程使用免费资源
4. **高可用性**：IP 失效时自动切换，保证网站永不离线
5. **彻底避坑**：关闭 CF 代理，避免 1003 拦截

这套方案彻底解决了之前 Workers 测速失真的问题，是目前国内访问 Cloudflare 站点的最优选择。

---

**参考资料**：

- [XIU2/CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest)
- [tmmtoo/cf2dns](https://github.com/tmmtoo/cf2dns)
- [DNSPod API 文档](https://docs.dnspod.cn/api/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
