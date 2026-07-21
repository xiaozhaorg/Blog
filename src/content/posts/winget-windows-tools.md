---
title: "Windows 包管理器 winget 完全指南：告别手动下载安装软件"
pubDatetime: 2026-07-21T01:30:00Z
slug: winget-windows-tools
featured: false
draft: false
tags: ["免费工具", "开发工具", "教程"]
description: Windows 包管理器 winget 命令行安装软件教程，比 scoop 更快更稳定，含常用命令、脚本自动化、批量安装。
---

![winget 包管理器指南](/images/pending/winget-windows-tools/cover.svg)

macOS 有 Homebrew，Linux 有 apt，Windows 现在有 winget。

## 一、安装 winget

Windows 11 自带，Windows 10 需手动安装：
- 从 Microsoft Store 安装 "App Installer"
- 或从 GitHub 下载：https://github.com/microsoft/winget-cli/releases

## 二、常用命令

```powershell
# 搜索软件
winget search vscode

# 安装软件
winget install Microsoft.VisualStudioCode

# 升级所有软件
winget upgrade --all

# 列出已安装
winget list

# 卸载软件
winget uninstall vscode

# 导出已安装列表
winget export -o packages.json

# 从列表安装
winget import -i packages.json
```

## 三、批量安装开发环境

```powershell
winget install Git.Git
winget install Microsoft.VisualStudioCode
winget install Microsoft.PowerToys
winget install WezTerm.Terminal
winget install JanDeDobbeleer.OhMyPosh
winget install Microsoft.WindowsTerminal
```

## 四、与 PowerShell 脚本结合

```powershell
# 一键安装开发环境
$apps = @(
    "Git.Git",
    "Microsoft.VisualStudioCode",
    "Docker.DockerDesktop",
    "Node.js.Node.js"
)

foreach ($app in $apps) {
    winget install --id $app --accept-package-agreements --accept-source-agreements
}
```

## 五、推荐软件包

| 软件 | 包名 |
|------|------|
| VS Code | Microsoft.VisualStudioCode |
| Chrome | Google.Chrome |
| 7-Zip | 7zip.7zip |
| Notion | Notion.Notion |
| Figma | Figma.Figma |
| Obsidian | Obsidian.Obsidian |
| Postman | Postman.Postman |

## 六、与 Scoop 对比

| 维度 | winget | Scoop |
|------|--------|-------|
| 软件源 | 微软官方 | 社区 |
| 安装位置 | C:\Program Files | 用户目录 |
| 权限 | 需要管理员 | 不需要 |
| 速度 | 中等 | 快 |
