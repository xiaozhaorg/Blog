---
title: "GitHub Actions 进阶：5 个实战技巧让你的 CI/CD 飞起来"
pubDatetime: 2026-07-20T00:00:00Z
slug: github-actions-advanced
featured: false
draft: true
tags: ["教程", "开发工具"]
description: GitHub Actions 进阶技巧，涵盖缓存优化、矩阵构建、定时任务、密钥管理、复合工作流，附实战 YAML 配置。
---

![GitHub Actions 进阶技巧](/images/pending/github-actions-advanced/cover.svg)

GitHub Actions 不只是简单的 CI/CD。掌握这 5 个进阶技巧，让你的 workflow 高效运行。

## 一、依赖缓存加速

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## 二、矩阵构建

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
runs-on: ${{ matrix.os }}
```

## 三、定时任务

```yaml
on:
  schedule:
    - cron: '0 8 * * *'  # 每天8点
  workflow_dispatch:  # 手动触发
```

## 四、密钥管理

```yaml
- name: Deploy
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
  run: ./deploy.sh
```

## 五、复合工作流

```yaml
# 通用 workflow
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
```

调用方：

```yaml
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
```

## 六、实战：完整部署 workflow

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: echo "Deploy..."
```
