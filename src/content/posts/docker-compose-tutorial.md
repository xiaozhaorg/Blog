---
title: "Docker Compose 入门到实战：5 分钟学会容器编排"
pubDatetime: 2026-07-21T01:30:00Z
slug: docker-compose-tutorial
featured: false
draft: false
tags: ["教程", "开发工具", "免费工具"]
description: Docker Compose 入门教程，从安装到实战，涵盖常用命令、YAML 配置、多容器编排、自建开发环境。
---

![Docker Compose 入门教程](/images/pending/docker-compose-tutorial/cover.svg)

Docker Compose 是管理多容器应用的最佳工具。本文带你 5 分钟从入门到实战。

## 一、安装

```bash
# macOS
brew install docker docker-compose

# Linux
sudo apt install docker.io docker-compose

# 验证
docker-compose --version
```

## 二、Hello World

`docker-compose.yml`：

```yaml
version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
```

启动：

```bash
docker-compose up -d
```

## 三、常用命令

```bash
# 启动服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down

# 重启服务
docker-compose restart web

# 进入容器
docker-compose exec web bash
```

## 四、实战：搭建 WordPress

```yaml
version: '3.8'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: admin
      WORDPRESS_DB_PASSWORD: secret
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: wordpress
      MYSQL_USER: admin
      MYSQL_PASSWORD: secret
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:
```

## 五、最佳实践

1. 使用 `.env` 文件管理环境变量
2. 健康检查 + depends_on
3. 数据卷持久化
4. 资源限制
5. 网络隔离
