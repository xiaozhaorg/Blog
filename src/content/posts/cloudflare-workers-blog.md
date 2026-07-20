---
title: "零成本建站！用 Cloudflare Workers 免费搭建个人博客完整教程"
pubDatetime: 2026-07-20T06:47:00Z
slug: cloudflare-workers-blog
featured: false
draft: false
tags: ["Cloudflare", "教程", "免费工具"]
description: 手把手教你使用 Cloudflare Workers 免费搭建个人博客，无需服务器，全球CDN加速，支持自定义域名，零成本上线你的网站。
---

![Cloudflare Workers 免费建站](/images/cloudflare-workers-blog/cover.svg)

Cloudflare 被网友亲切地称为"赛博活佛"，因为它的 Free 账号提供了大量实用功能。今天我们就来用 Cloudflare Workers 搭建一个完全免费的个人博客，无需购买服务器，享受全球 CDN 加速。

## 一、为什么选择 Cloudflare Workers？

传统建站通常需要：购买服务器（年费几百到几千）+ 配置环境 + 维护安全。而 Cloudflare Workers 让你跳过所有这些步骤：

- **完全免费**：每天 10 万次请求额度，个人博客绰绰有余
- **全球 CDN**：Cloudflare 在全球 300+ 城市有节点，访问速度极快
- **无需服务器**：代码运行在边缘节点，不用管运维
- **自定义域名**：支持绑定自己的域名，还自动配 HTTPS
- **自动扩缩容**：流量暴增也不用担心

## 二、搭建前的准备

你需要准备以下内容：

1. 一个 **Cloudflare 账号**（免费注册）
2. 安装 **Node.js**（建议 18+ 版本）
3. 安装 **Wrangler CLI**（Cloudflare 的命令行工具）
4. （可选）一个自己的域名

### 安装 Wrangler

```bash
npm install -g wrangler
```

安装完成后，登录你的 Cloudflare 账号：

```bash
wrangler login
```

浏览器会自动打开授权页面，点击允许即可。

## 三、创建博客项目

### 1. 初始化项目

```bash
mkdir my-blog
cd my-blog
npm init -y
npm install hono @hono/zod-validator
```

我们使用 **Hono** 框架——一个专为边缘计算设计的轻量 Web 框架，速度极快。

### 2. 编写核心代码

创建 `src/index.ts` 文件：

```typescript
import { Hono } from "hono";
import { serveStatic } from "hono/serve-static";

const app = new Hono();

// 静态文件服务
app.use("/*", serveStatic({ root: "./public" }));

// 博客首页
app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>我的博客</title>
      <style>
        body { font-family: system-ui; max-width: 720px; margin: 0 auto; padding: 20px; }
        h1 { color: #f6821f; }
      </style>
    </head>
    <body>
      <h1>欢迎来到我的博客</h1>
      <p>这是一个运行在 Cloudflare Workers 上的博客。</p>
    </body>
    </html>
  `);
});

export default app;
```

### 3. 配置 wrangler.toml

在项目根目录创建 `wrangler.toml`：

```toml
name = "my-blog"
compatibility_date = "2026-07-20"

[assets]
directory = "./public"
```

## 四、部署上线

### 1. 本地预览

```bash
wrangler dev
```

浏览器打开 `http://localhost:8787` 即可预览效果。

### 2. 部署到 Cloudflare

```bash
wrangler deploy
```

部署成功后，你会得到一个 `https://my-blog.<你的子域>.workers.dev` 的地址，博客已经上线了！

### 3. 绑定自定义域名

如果你有自己的域名（且域名已托管在 Cloudflare）：

1. 进入 Cloudflare Dashboard → Workers & Pages
2. 选择你的 Worker 项目
3. 点击 "Settings" → "Triggers"
4. 在 "Custom Domains" 中添加你的域名
5. Cloudflare 会自动配置 DNS 和 SSL 证书

## 五、进阶：添加文章管理

为了真正像一个博客，我们可以用 Cloudflare KV 存储文章内容：

### 1. 创建 KV 命名空间

```bash
wrangler kv namespace create POSTS
```

### 2. 更新 wrangler.toml

```toml
[[kv_namespaces]]
binding = "POSTS"
id = "你的KV命名空间ID"
```

### 3. 读取文章列表

```typescript
app.get("/api/posts", async (c) => {
  const list = await c.env.POSTS.list();
  const posts = await Promise.all(
    list.keys.map(async (key) => {
      const content = await c.env.POSTS.get(key.name);
      return { slug: key.name, content };
    })
  );
  return c.json(posts);
});
```

## 六、成本分析

| 项目 | 传统建站 | Cloudflare Workers |
|------|----------|-------------------|
| 服务器 | ¥300-3000/年 | **免费** |
| CDN加速 | ¥100-500/年 | **免费** |
| SSL证书 | ¥0-800/年 | **免费** |
| 域名 | ¥50/年 | ¥50/年（可选） |
| **总成本** | **¥450-4350/年** | **¥0-50/年** |

## 七、注意事项

1. **请求限制**：免费版每天 10 万次请求，个人博客完全够用
2. **CPU 时间**：单次请求 CPU 时间限制 10ms，纯静态内容没问题
3. **KV 读写**：免费版每天 10 万次读、1000 次写，注意写入频率
4. **静态资源大小**：单个文件不超过 25MB

## 八、总结

使用 Cloudflare Workers 搭建博客是一个真正的零成本方案。你不需要购买服务器，不需要配置环境，不需要维护安全更新——只需要写代码，然后 `wrangler deploy`，一切就搞定了。

对于个人博客、文档站、小型展示站来说，这可能是 2026 年最划算的建站方案之一。如果你还没有试过，强烈建议动手实践一下。
