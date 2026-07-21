---
title: "Raycast 效率神器完全指南：彻底取代 Spotlight，Mac 用户必装"
pubDatetime: 2026-07-20T00:00:00Z
slug: raycast-productivity
featured: false
draft: true
tags: ["开发工具", "免费工具"]
description: Raycast 是 Mac 上最强效率工具，本文详解安装、扩展推荐、快捷键配置、自定义脚本，让你彻底告别 Spotlight。
---

![Raycast 效率工具指南](/images/pending/raycast-productivity/cover.svg)

Raycast 是 Mac 上的效率神器，启动器 + 工具集 + 脚本平台三位一体。本文带你玩转 Raycast。

## 一、为什么选 Raycast

- 启动速度极快
- 扩展生态丰富
- 窗口管理、剪贴板、翻译等内置
- 支持自定义脚本
- 免费版功能已足够强

## 二、安装

从 https://www.raycast.com 下载安装，设置快捷键 `⌥ Space` 替代默认的 `⌘ Space`。

## 三、必备扩展推荐

### 效率类
- **Clipboard History** - 剪贴板历史
- **Window Management** - 窗口管理
- **Emoji Search** - Emoji 搜索
- **Quicklinks** - 自定义快捷链接

### 开发类
- **Git** - Git 快捷操作
- **GitHub** - GitHub 集成
- **Kill Process** - 杀进程
- **Port Manager** - 端口管理

### 日常类
- **System Monitoring** - 系统监控
- **Timer** - 番茄钟
- **Calendar** - 日历集成
- **Translate** - 翻译

## 四、自定义脚本

Raycast 支持 JavaScript / Bash / Python 脚本。例如查询天气：

```javascript
// 查询 IP
import { Clipboard } from "@raycast/api";

export default async function command() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  await Clipboard.copy(data.ip);
}
```

## 五、进阶玩法

- **AI 集成**：ChatGPT / Claude 一键调用
- **Snippets**：代码片段快捷输入
- **Quicklinks**：自定义 URL Scheme
- **Aliases**：自定义命令别名
