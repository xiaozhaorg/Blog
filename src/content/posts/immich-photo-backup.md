---
title: "Immich 自建相册：Google Photos 的完美替代，AI 自动分类人脸识别"
pubDatetime: 2026-07-21T01:30:00Z
slug: immich-photo-backup
featured: false
draft: false
tags: ["免费工具", "开源", "教程"]
description: Immich 是开源的自托管相册应用，AI 自动分类、人脸识别、地图视图，是 Google Photos 的最佳替代品，本文详解部署使用。
---

![Immich 自建相册](/images/pending/immich-photo-backup/cover.svg)

Immich 是 GitHub 上最火的自托管相册项目，AI 能力媲美 Google Photos。

## 一、核心功能

- 自动备份手机照片
- AI 人脸识别
- 智能搜索（按时间、地点、人物）
- 地图视图
- RAW/HEIC 支持
- 共享相册

## 二、Docker 部署

`docker-compose.yml`：

```yaml
version: '3.8'
services:
  immich-server:
    image: ghcr.io/immich-app/immich-server:release
    ports:
      - "2283:2283"
    volumes:
      - ./upload:/usr/src/app/upload
    env_file:
      - .env

  immich-machine-learning:
    image: ghcr.io/immich-app/immich-machine-learning:release
    volumes:
      - model-cache:/cache
    restart: unless-stopped

  redis:
    image: redis:7
    restart: unless-stopped

  database:
    image: tensorchord/pgvecto-rs:pg14-v0.2.0
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: immich
    volumes:
      - ./database:/var/lib/postgresql/data

volumes:
  model-cache:
```

## 三、首次配置

1. 访问 `http://your-server:2283`
2. 创建管理员账户
3. 关闭注册（`IMMICH_PUBLIC_REGISTER=false`）
4. 下载手机 APP，配置服务器地址

## 四、性能优化

- 使用 SSD 存储照片
- GPU 加速 AI 识别（可选）
- 定期清理缩略图缓存

## 五、备份策略

- 3-2-1 备份原则
- 定期 rsync 到外部硬盘
- 上传到 Backblaze B2 / 阿里云 OSS
