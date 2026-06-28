---
title: "Cloudflare 网站加速实战：本地测速 + DNS 优选 IP 方案"
pubDatetime: 2026-06-26T14:00:00Z
slug: cloudflare-ip-optimization
featured: true
draft: false
tags: ["Cloudflare", "CDN优化", "教程"]
description: 一套真正可用的 Cloudflare 优选 IP 加速方案，在自己电脑上测速获取真实延迟，通过 DNS 解析让所有访客受益。
---

## 前言

Cloudflare 是全球最大的免费 CDN 服务商，但在中国大陆访问时经常遇到高延迟、丢包的问题。网上流传的很多"优选 IP"方案要么测速不准（海外测速），要么配置复杂难以实施。

本文分享一套**真正可用、简单易行**的加速方案：在自己电脑上测速获取真实延迟，然后通过 DNS 解析让所有访客受益。

## 为什么需要优选 IP

Cloudflare 使用 Anycast 技术，理论上会自动连接最近的节点。但实际情况是：

| 现象 | 原因 |
|------|------|
| 延迟 200ms+ | 路绕美国西海岸或欧洲 |
| 连接不稳定 | 部分 IP 段网络拥堵 |
| 频繁丢包 | 国际线路质量差 |

**核心问题**：默认分配的 IP 可能不是你网络环境中最快的那个。

## 方案对比

| 方案 | 测速准确性 | 实施难度 | 适用人群 |
|------|-----------|---------|---------|
| GitHub Actions 测速 | ❌ 海外环境，失真 | 中等 | 技术用户 |
| Workers 测速 | ❌ 海外节点，失真 | 高 | 技术用户 |
| **本地测速 + DNS** | ✅ 国内真实延迟 | 低 | 所有用户 |
| VPS 中转 | ✅ 准确 | 高 | 有服务器用户 |

**推荐方案**：本地测速 + DNS 解析，简单且准确。

## 步骤一：下载测速工具

使用开源工具 [XIU2/CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest)，这是国内公认最稳定的 CF IP 测速工具。

### Windows 用户

1. 访问 [Releases 页面](https://github.com/XIU2/CloudflareSpeedTest/releases)
2. 下载 `CloudflareSpeedTest_windows_amd64.zip`
3. 解压到任意目录

### macOS/Linux 用户

```bash
# 下载最新版本
wget https://github.com/XIU2/CloudflareSpeedTest/releases/download/v2.2.5/CloudflareSpeedTest_linux_amd64.tar.gz

# 解压
tar -zxvf CloudflareSpeedTest_linux_amd64.tar.gz
```

## 步骤二：运行测速

### Windows

双击 `CloudflareST.exe` 或在 PowerShell 中运行：

```powershell
.\CloudflareST.exe
```

### macOS/Linux

```bash
./CloudflareST
```

### 测速参数说明

工具会自动测试 Cloudflare 的 IPv4 IP 段（104.16.0.0/12、172.64.0.0/13），默认参数：

- 测试 IP 数量：约 2000 个
- 并发线程：200
- 测速次数：10 次/延迟、1 次/下载速度
- 延迟上限：200ms
- 下载速度下限：5MB/s

### 自定义参数示例

```bash
# 只测电信线路的 IP
./CloudflareST -url https://cf.xiu2.xyz/url -t 10 -n 100 -tl 100 -dd

# 参数说明：
# -t 10     延迟测试次数
# -n 100    测试 IP 数量
# -tl 100   延迟上限（毫秒）
# -dd       禁用下载速度测试（仅测延迟）
```

## 步骤三：查看测速结果

测速完成后，结果保存在 `result.csv` 文件中：

```csv
104.16.132.22,延迟:45ms,下载速度:25MB/s
172.64.155.88,延迟:52ms,下载速度:18MB/s
104.18.42.166,延迟:68ms,下载速度:12MB/s
```

### 选择标准

| 指标 | 推荐值 | 说明 |
|------|--------|------|
| 延迟 | ≤ 100ms | 越低越好，50ms 内最佳 |
| 下载速度 | ≥ 5MB/s | 越高越好 |
| 丢包率 | 0% | 必须为 0 |

选择延迟最低、速度最高的前 3-5 个 IP 作为备用。

## 步骤四：应用优选 IP

有三种应用方式，按推荐度排序：

### 方案 A：修改域名 DNS 解析（推荐）

**适用场景**：你有域名管理权限，想让所有访客受益

#### 操作步骤

1. 登录域名 DNS 管理面板（如 Cloudflare、阿里云 DNS、DNSPod）
2. 找到你的域名 A 记录
3. 将记录值改为优选 IP

**示例**：

| 主机记录 | 类型 | 记录值 | 代理状态 |
|---------|------|--------|---------|
| @ | A | 104.16.132.22 | 仅 DNS（灰云） |
| www | A | 104.16.132.22 | 仅 DNS（灰云） |

#### ⚠️ 重要提醒

如果你的域名托管在 Cloudflare：

1. **必须关闭橙色代理**（改为灰云/DNS only）
2. 否则直接使用 IP 会触发 1003 错误
3. SSL/TLS 设置改为"完全（严格）"

### 方案 B：修改本地 hosts 文件

**适用场景**：只加速自己的访问，不影响其他人

#### Windows

编辑文件 `C:\Windows\System32\drivers\etc\hosts`：

```text
104.16.132.22  xiaozha.org
104.16.132.22  www.xiaozha.org
```

#### macOS/Linux

编辑文件 `/etc/hosts`：

```text
104.16.132.22  xiaozha.org
104.16.132.22  www.xiaozha.org
```

保存后刷新 DNS 缓存：

```bash
# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemctl restart nscd
```

### 方案 C：使用 CNAME 优选服务

**适用场景**：不想自己测速，使用他人维护的优选 IP

一些服务商提供动态优选 IP CNAME：

| 服务 | CNAME 地址 | 说明 |
|------|-----------|------|
| CloudflareOptimized | cf-optimized.com | 自动优选 |
| IP优选 | bestcf.onecf.eu.org | 社区维护 |

#### 配置方法

将域名 CNAME 指向优选服务：

| 主机记录 | 类型 | 记录值 |
|---------|------|--------|
| @ | CNAME | cf-optimized.com |

> 注意：使用第三方服务存在稳定性风险，建议定期检查。

## 步骤五：验证效果

### 检查 DNS 解析

```bash
nslookup xiaozha.org

# 应返回你设置的优选 IP
# 例如：104.16.132.22
```

### 测试访问速度

```bash
# Windows PowerShell
Measure-Command { Invoke-WebRequest https://xiaozha.org }

# macOS/Linux
curl -w "Time: %{time_total}s\n" -o /dev/null -s https://xiaozha.org
```

### 浏览器测试

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 面板
3. 刷新页面
4. 查看 TTFB（Time to First Byte）

**优化目标**：

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| TTFB | 200-500ms | 50-100ms |
| 页面加载 | 3-5s | 1-2s |

## 高级方案：三网分线路解析

如果你希望电信、联通、移动用户分别使用不同的优选 IP，可以使用 DNSPod 的分线路解析功能。

### 前提条件

- 域名 DNS 迁移到 DNSPod
- 分别测出三网的优选 IP

### 配置方法

在 DNSPod 添加多条 A 记录：

| 主机记录 | 类型 | 线路类型 | 记录值 |
|---------|------|---------|--------|
| @ | A | 电信 | 104.16.132.22 |
| @ | A | 联通 | 172.64.155.88 |
| @ | A | 移动 | 104.18.42.166 |

### 如何分别测速

CloudflareSpeedTest 支持指定运营商 IP 段：

```bash
# 电信线路（下载电信 IP 段文件）
./CloudflareST -f ip_ct.txt

# 联通线路
./CloudflareST -f ip_cu.txt

# 移动线路
./CloudflareST -f ip_cm.txt
```

IP 段文件需要从社区获取或自己整理。

## 常见问题

### Q1：为什么关闭 Cloudflare 代理后还能访问？

A：Cloudflare 的任播 IP 段（104.16.0.0/12、172.64.0.0/13）是公开的访客入口 IP。关闭代理只是不再经过 CF 的安全过滤和加速层，但 IP 仍然指向 CF 节点。

### Q2：优选 IP 会失效吗？

A：会。Cloudflare IP 的网络状况会变化，建议：
- 每 1-2 周重新测速
- 保留 3-5 个备用 IP
- 监控网站访问速度

### Q3：如何自动更新优选 IP？

A：可以使用定时脚本：

```bash
# 创建自动更新脚本 auto-update-cf.sh
#!/bin/bash

# 测速
./CloudflareST -o result.csv -dd

# 获取最优 IP
BEST_IP=$(head -n 1 result.csv | cut -d ',' -f 1)

# 更新 DNS（需配置 DNSPod API）
curl -s "https://dnsapi.cn/Record.Modify" \
  -d "login_token=$SECRET_ID,$SECRET_KEY" \
  -d "format=json" \
  -d "domain=xiaozha.org" \
  -d "record_id=$RECORD_ID" \
  -d "sub_domain=@" \
  -d "record_type=A" \
  -d "record_line=默认" \
  -d "value=$BEST_IP"

echo "DNS 已更新为: $BEST_IP"
```

配合 crontab 定时执行：

```bash
# 每 6 小时更新一次
0 */6 * * * /path/to/auto-update-cf.sh
```

### Q4：SSL 证书会失效吗？

A：不会。只要你的域名在 Cloudflare 托管过，CF 会自动签发证书。即使改为灰云解析，证书仍然有效。

但需要注意：
- SSL/TLS 模式设置为"完全（严格）"
- 源站必须有有效证书（CF Pages/Vercel 等托管平台自动提供）

### Q5：为什么有些 IP 测速快但访问慢？

A：测速只反映到 CF 节点的延迟，访问速度还取决于：
- CF 到源站的连接
- 源站响应速度
- 页面资源大小

建议同时测试下载速度，选择延迟和速度都好的 IP。

## 避坑总结

| 错误做法 | 问题 | 正确做法 |
|---------|------|---------|
| 海外测速 | 结果失真 | 本地测速 |
| 开启橙云 + 直连 IP | 1003 错误 | 关闭代理（灰云） |
| 单一 IP 无备用 | IP 失效后无法访问 | 保留多个备用 IP |
| 频繁测速大量 IP | 触发风控 | 每周 1 次，每次 100-200 IP |

## 方案总结

本文推荐的**本地测速 + DNS 解析**方案：

| 优势 | 说明 |
|------|------|
| 测速准确 | 在自己电脑测速，反映真实延迟 |
| 简单易行 | 无需服务器、无需编程 |
| 全站受益 | 所有访客都能加速 |
| 零成本 | 工具和 DNS 服务全部免费 |

**核心步骤**：

1. 下载 CloudflareSpeedTest 工具
2. 在本地运行测速
3. 选择延迟最低的 IP
4. 更新域名 DNS 解析（关闭 CF 代理）
5. 定期重新测速并更新

这套方案经实测有效，是目前最简单、最可靠的 Cloudflare 加速方案。

---

**参考资料**：

- [XIU2/CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest) - 测速工具
- [CloudflareSpeedTest使用教程](https://github.com/XIU2/CloudflareSpeedTest/blob/master/README.md) - 官方文档
- [DNSPod 分线路解析](https://docs.dnspod.cn/api/) - API 文档