---
title: "Ollama 本地部署大模型完全指南：5分钟跑起 Llama 3 / Qwen 3 / DeepSeek"
pubDatetime: 2026-07-20T00:00:00Z
slug: ollama-local-llm
featured: false
draft: true
tags: ["AI", "大模型", "教程", "免费工具"]
description: Ollama 是最简单的本地大模型运行工具，本文详解安装、模型下载、API调用、Web UI 集成，让你5分钟跑起本地大模型。
---

![Ollama 本地部署指南](/images/pending/ollama-local-llm/cover.svg)

Ollama 让本地运行大模型变得极其简单。本文带你 5 分钟跑起本地大模型。

## 一、安装 Ollama

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
从官网下载安装包：https://ollama.com/download

## 二、下载并运行模型

```bash
# 启动 Ollama 服务
ollama serve

# 拉取模型
ollama pull llama3
ollama pull qwen3:8b
ollama pull deepseek-v3

# 运行模型
ollama run qwen3:8b
```

## 三、API 调用

Ollama 自动提供 OpenAI 兼容 API：

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # 任意值
)

response = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "你好"}]
)
print(response.choices[0].message.content)
```

## 四、推荐模型（按显存）

| 显存 | 推荐模型 |
|------|---------|
| 4GB | qwen2.5:3b, llama3.2:3b |
| 8GB | qwen3:8b, llama3.1:8b |
| 12GB | qwen3:14b, deepseek-coder-v2:16b |
| 24GB+ | qwen3:32b, llama3.1:70b |

## 五、Web UI 集成

推荐使用 [Open WebUI](https://github.com/open-webui/open-webui)：

```bash
docker run -d -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

访问 `http://localhost:3000` 即可使用类似 ChatGPT 的界面。
