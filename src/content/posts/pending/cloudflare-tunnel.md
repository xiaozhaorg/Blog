---
title: "Cloudflare Tunnel 免费内网穿透：把家里的NAS、树莓派暴露到公网"
pubDatetime: 2026-07-20T00:00:00Z
slug: cloudflare-tunnel
featured: false
draft: true
tags: ["Cloudflare", "教程", "免费工具"]
description: Cloudflare Tunnel 免费将内网服务暴露到公网，无需公网IP、无需端口映射，5分钟搭建安全的内网穿透。
---

![Cloudflare Tunnel 内网穿透](/images/pending/cloudflare-tunnel/cover.svg)

Cloudflare Tunnel（以前叫 Argo Tunnel）是免费内网穿透的最佳方案，无需公网 IP，无需端口映射，5 分钟即可用上。

## 一、什么是 Cloudflare Tunnel

通过在本地运行 `cloudflared` 守护进程，与 Cloudflare 边缘节点建立加密隧道，让公网用户可以通过你的域名访问内网服务。

## 二、安装 cloudflared

### Windows
从 https://github.com/cloudflare/cloudflared/releases 下载安装包

### macOS
```bash
brew install cloudflared
```

### Linux
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

## 三、登录并创建隧道

```bash
# 登录
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create my-tunnel

# 创建配置文件 ~/.cloudflared/config.yml
```

`config.yml` 示例：

```yaml
tunnel: my-tunnel
credentials-file: /path/to/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: nas.example.com
    service: http://localhost:5000
  - hostname: ssh.example.com
    service: ssh://localhost:22
  - service: http_status:404
```

## 四、配置 DNS

```bash
cloudflared tunnel route dns my-tunnel nas.example.com
```

## 五、启动隧道

```bash
cloudflared tunnel run my-tunnel
```

## 六、典型应用

- NAS 远程访问（群晖、威联通）
- 树莓派服务
- HomeAssistant 智能家居
- 游戏服务器
- 开发环境调试
