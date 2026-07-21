---
title: "NAS 折腾指南：从硬件选购到系统搭建，打造你的家庭数据中心"
pubDatetime: 2026-07-20T00:00:00Z
slug: nas-diy-guide
featured: false
draft: true
tags: ["教程", "免费工具"]
description: 手把手教你 DIY 一台 NAS，涵盖硬件选购清单、TrueNAS/Unraid 系统安装、远程访问、影音库搭建，私有云存储完整方案。
---

![NAS 折腾指南](/images/pending/nas-diy-guide/cover.svg)

想要一个属于自己的家庭数据中心？这份 NAS 折腾指南帮你从零开始。

## 一、硬件选购

### 入门级（2000 元内）
- 主板：J4125 / N100 集成
- 内存：8GB DDR4
- 硬盘：2 × 4TB
- 机箱：4 盘位

### 进阶级（5000 元）
- CPU：i3-12100 / i5-12400
- 内存：16GB DDR4
- 硬盘：4 × 8TB
- 机箱：6-8 盘位

## 二、系统选择

| 系统 | 特点 | 难度 |
|------|------|------|
| TrueNAS Scale | ZFS 文件系统 | 中 |
| Unraid | 灵活扩展 | 中 |
| OpenMediaVault | 轻量 | 低 |
| 群晖 | 易用 | 低（需购买）|

## 三、TrueNAS 安装

1. 下载镜像写入 U 盘
2. 启动安装
3. 配置 ZFS 存储池
4. 创建数据集
5. 启用 SMB/NFS 共享

## 四、远程访问

推荐 Cloudflare Tunnel（免费且安全）：

```bash
cloudflared tunnel create nas
cloudflared tunnel route dns nas nas.example.com
```

## 五、影音库

- **Jellyfin** / **Plex** - 媒体服务器
- **qBittorrent** - 下载工具
- **Jellyseerr** - 追剧管理
- **Immich** - 照片备份（Google Photos 替代）

## 六、必备 Docker 应用

```yaml
version: '3.8'
services:
  jellyfin:
    image: jellyfin/jellyfin
    ports:
      - "8096:8096"
    volumes:
      - /mnt/data/media:/media
  qbittorrent:
    image: linuxserver/qbittorrent
    ports:
      - "8080:8080"
```
