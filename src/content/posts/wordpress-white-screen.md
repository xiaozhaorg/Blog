---
title: "WordPress网站白屏怎么处理？"
pubDatetime: 2026-04-17T00:00:00Z
slug: wordpress-white-screen
featured: false
draft: false
tags: ["日常记录"]
description: WordPress网站突然白屏的原因分析及解决方案，混合内容问题导致的浏览器阻止加载。
---

## 现象

突然打开网站就什么都不显示，只是一片白

![](/images/img_61b04a94.webp)

## 解决方案

1. 通过修改wp-config.php中的`define( 'WP_DEBUG', false );` 为true，找BUG；没发现什么问题

2. 切换主题、停用插件、可以正常访问，但是切换回RiPro-v5主题后又不正常

3. 通过求助AI后终于确认原因：

**白屏根因**：ripro-v5 主题在生成页面时输出了 `http://` 的资源链接（主题硬编码了域名 URL），但 WordPress 后台和数据库都设置为 `https://`，导致混合内容（Mixed Content），现代浏览器阻止了非 HTTPS 资源加载 → 白屏

**修复方案**：通过 WordPress mu-plugin（必须使用插件）注册 `init` 钩子，用输出缓冲捕获整个 HTML 输出并全局替换 `http://XX.com` → `https://XX.com`。

最后**Ctrl+Shift+R**（强制刷新），然后就正常了