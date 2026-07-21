---
title: "Uptime Kuma 自建监控：免费替代 UptimeRobot，漂亮又强大"
pubDatetime: 2026-07-21T01:30:00Z
slug: uptime-kuma-monitor
featured: false
draft: false
tags: ["免费工具", "开源", "教程"]
description: Uptime Kuma 自托管监控工具，支持 HTTP、TCP、Ping、DNS 等多种监控类型，漂亮 UI + 告警通知，免费替代 UptimeRobot。
---

![Uptime Kuma 自建监控](/images/pending/uptime-kuma-monitor/cover.svg)

Uptime Kuma 是一款漂亮的自托管监控工具，GitHub 60k+ Stars。

## 一、核心功能

- 多种监控类型（HTTP、TCP、Ping、DNS、推送等）
- 漂亮的实时状态页
- 多渠道告警（邮件、微信、Telegram、Slack、Discord 等 90+ 渠道）
- SSL 证书过期提醒
- 状态码、响应时间监控
- 多语言支持

## 二、Docker 部署

```yaml
version: '3.8'
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    ports:
      - "3001:3001"
    volumes:
      - uptime-kuma:/app/data
    restart: unless-stopped

volumes:
  uptime-kuma:
```

启动：

```bash
docker-compose up -d
```

访问 `http://localhost:3001`，创建管理员账户。

## 三、添加监控项

1. 点击 "Add New Monitor"
2. 选择类型（HTTP(s)、TCP、Ping 等）
3. 填写目标 URL
4. 配置心跳间隔（建议 60s）
5. 配置告警通知

## 四、配置通知

支持 90+ 通知渠道，常用：

- **Email** - 邮件
- **Telegram** - TG 机器人
- **Discord** - Discord Webhook
- **Slack** - Slack Webhook
- **Bark** - iOS 推送
- **Server Chan** - 微信推送
- **企业微信** - 群机器人
- **钉钉** - 群机器人

## 五、状态页

可以创建公开状态页：

1. 点击 "Status Pages"
2. 添加页面
3. 选择要展示的监控项
4. 公开链接可分享

## 六、高级技巧

- 使用 Cloudflare Tunnel 暴露
- 配置反向代理 + HTTPS
- 多实例 + 数据库备份
- API 集成（Prometheus、Grafana）
