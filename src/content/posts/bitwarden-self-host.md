---
title: "Vaultwarden 自托管密码管理器：告别 1Password 年费，数据自己掌控"
pubDatetime: 2026-07-21T06:45:00Z
slug: bitwarden-self-host
featured: false
draft: false
tags: ["免费工具", "开源", "教程"]
description: Vaultwarden 是 Bitwarden 的轻量自托管版，本文详解 Docker 部署、Cloudflare Tunnel 安全暴露、客户端配置，告别年费。
---

![Vaultwarden 自托管密码管理器](/images/pending/bitwarden-self-host/cover.svg)

1Password 一年要 $36？Vaultwarden 自托管完全免费，且数据自己掌控。

## 一、为什么选 Vaultwarden

- 完全免费开源
- 兼容 Bitwarden 客户端
- 资源占用低（10MB 内存）
- Docker 一键部署
- 密码完全自己掌控

## 二、Docker 部署

`docker-compose.yml`：

```yaml
version: '3.8'
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./data:/data
    environment:
      DOMAIN: "https://vault.example.com"
      SIGNUPS_ALLOWED: "true"
```

启动：

```bash
docker-compose up -d
```

## 三、Cloudflare Tunnel 暴露

```bash
cloudflared tunnel route dns vault vault.example.com
```

## 四、客户端配置

下载 Bitwarden 客户端，服务器地址填入你的域名，即可使用。

## 五、安全建议

1. 启用 2FA
2. 关闭公开注册（注册完成后设置 `SIGNUPS_ALLOWED=false`）
3. 定期备份 data 目录
4. 配置 fail2ban 防爆破

## 六、迁移自 1Password

1. 1Password 导出 CSV
2. Bitwarden 网页端导入
3. 验证无误后删除 1Password 数据
