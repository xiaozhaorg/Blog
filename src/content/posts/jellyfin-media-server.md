---
title: "Jellyfin 影音库搭建指南：Plex 免费替代，4K 硬解全平台"
pubDatetime: 2026-07-21T01:30:00Z
slug: jellyfin-media-server
featured: false
draft: false
tags: ["免费工具", "开源", "教程"]
description: Jellyfin 是开源免费的媒体服务器，本文详解 Docker 部署、元数据刮削、硬件转码、客户端配置，打造私人影音库。
---

![Jellyfin 影音库搭建](/images/pending/jellyfin-media-server/cover.svg)

Jellyfin 是完全免费开源的媒体服务器，是 Plex 和 Emby 的最佳替代品。

## 一、核心优势

- 完全免费，无功能限制
- 无追踪无广告
- 硬件转码支持
- 多平台客户端
- 实时转码
- 用户管理

## 二、Docker 部署

```yaml
version: '3.8'
services:
  jellyfin:
    image: jellyfin/jellyfin
    container_name: jellyfin
    ports:
      - "8096:8096"
    volumes:
      - ./config:/config
      - ./cache:/cache
      - /mnt/media:/media
    devices:
      - /dev/dri:/dev/dri  # Intel 硬解
    restart: unless-stopped
```

## 三、目录结构

```
/mnt/media/
├── Movies/
│   ├── Inception (2010)/
│   │   └── Inception.mkv
│   └── The Matrix (1999)/
│       └── The Matrix.mkv
└── TV Shows/
    └── Breaking Bad/
        ├── Season 01/
        └── Season 02/
```

## 四、硬件转码

### Intel/AMD GPU
```yaml
devices:
  - /dev/dri:/dev/dri
```

### NVIDIA GPU
```yaml
runtime: nvidia
environment:
  - NVIDIA_VISIBLE_DEVICES=all
```

## 五、元数据刮削

推荐使用 **TMDB** 刮削器：
1. Dashboard → Libraries → Manage Library
2. 配置元数据下载器为 TMDB
3. 添加 API Key（免费申请）
4. 启用 "Save artwork into media folders"

## 六、客户端

- **Web**：浏览器直接访问
- **Android**：Jellyfin Android
- **iOS**：Jellyfin Mobile
- **Apple TV**：Jellyfin for TV
- **Android TV**：Jellyfin for Android TV
- **桌面**：Jellyfin Media Player

## 七、硬解效果

| 设备 | 4K HEVC | 8K AV1 |
|------|---------|--------|
| Intel N100 | ✅ | ❌ |
| GTX 1060+ | ✅ | 部分 |
| RTX 3060+ | ✅ | ✅ |
