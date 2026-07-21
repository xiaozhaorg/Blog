---
title: "Cloudflare R2 对象存储完全指南：10GB 免费存储，替代 S3 的最佳选择"
pubDatetime: 2026-07-20T00:00:00Z
slug: cloudflare-r2-storage
featured: false
draft: true
tags: ["Cloudflare", "教程", "免费工具"]
description: 详细教程教你在 Cloudflare R2 上使用免费对象存储，含 S3 兼容 API、CDN 加速、自定义域名配置，替代 AWS S3 节省成本。
---

![Cloudflare R2 对象存储指南](/images/pending/cloudflare-r2-storage/cover.svg)

Cloudflare R2 提供 **10GB 免费存储** + 零出口流量费，是 AWS S3 的最佳免费替代品。本文详解使用方法。

## 一、R2 核心优势

- **10GB 免费存储**永久免费
- **零出口流量费**（S3 这部分很贵）
- **S3 兼容 API**：现有工具无缝迁移
- **全球 CDN 加速**

## 二、快速开始

### 1. 创建 R2 存储桶

登录 Cloudflare Dashboard → R2 → Create Bucket

### 2. 获取 API 凭证

创建 API Token，配置 S3 客户端：

```bash
# AWS CLI 配置
aws configure set aws_access_key_id YOUR_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_SECRET_KEY
```

### 3. 上传文件

```bash
aws s3 cp myfile.png s3://my-bucket/ \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

## 三、绑定自定义域名

1. R2 Dashboard → 你的 Bucket → Settings
2. Public Access → Connect Domain
3. 输入你的子域名（如 `cdn.example.com`）
4. Cloudflare 自动配置 DNS

## 四、典型使用场景

- 博客图片存储
- 静态资源 CDN
- 备份文件存储
- 用户上传文件
