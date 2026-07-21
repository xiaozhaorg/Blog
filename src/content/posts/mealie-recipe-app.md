---
title: "Mealie 自建菜谱应用：告别下厨房广告，掌控你的私人厨房"
pubDatetime: 2026-07-21T01:30:00Z
slug: mealie-recipe-app
featured: false
draft: false
tags: ["免费工具", "开源", "教程"]
description: Mealie 是开源的自托管菜谱管理应用，支持网页爬取菜谱、膳食计划、购物清单，是下厨房/豆果美食的完美替代。
---

![Mealie 自建菜谱应用](/images/pending/mealie-recipe-app/cover.svg)

Mealie 是一款开源的自托管菜谱应用，帮你管理所有喜欢的菜谱。

## 一、核心功能

- 网页爬取菜谱（自动解析）
- 手动创建菜谱（Markdown 编辑器）
- 食材自动归类
- 膳食计划
- 购物清单
- 多用户支持
- 移动端友好

## 二、Docker 部署

```yaml
version: '3.8'
services:
  mealie:
    image: ghcr.io/mealie-recipes/mealie:latest
    container_name: mealie
    ports:
      - "9925:9000"
    volumes:
      - mealie-data:/app/data
    environment:
      ALLOW_SIGNUP: "false"
      TZ: Asia/Shanghai
    restart: unless-stopped

volumes:
  mealie-data:
```

## 三、初始化配置

1. 访问 `http://localhost:9925`
2. 创建管理员账户
3. 设置 `ALLOW_SIGNUP=false` 关闭公开注册

## 四、添加菜谱

### 方式一：网页爬取
- 复制下厨房 URL
- 粘贴到 Mealie
- 自动解析食材、步骤、烹饪时间

### 方式二：手动创建
- Markdown 编辑器
- 支持食材自动补全
- 步骤编号

## 五、实用功能

- **膳食计划**：周计划/日计划
- **购物清单**：根据膳食计划自动生成
- **标签分类**：中餐、西餐、川菜等
- **打印优化**：每页一个菜谱

## 六、推荐实践

1. 收藏所有常用菜谱
2. 创建家庭共享账号
3. 周日规划下周膳食
4. 食材按保质期管理
