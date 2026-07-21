---
title: "Ubuntu Server 初始化配置：拿到新服务器必做的 10 件事"
pubDatetime: 2026-07-21T01:30:00Z
slug: ubuntu-server-setup
featured: false
draft: false
tags: ["教程", "免费工具"]
description: 拿到新的 Ubuntu 服务器后必做的 10 件事：SSH 安全、防火墙、自动更新、时区、Docker、监控等，一键脚本搞定。
---

![Ubuntu Server 初始化](/images/pending/ubuntu-server-setup/cover.svg)

拿到新的 Ubuntu Server，第一件事该做什么？这份清单帮你避免常见坑。

## 一、SSH 安全配置

```bash
# 修改 SSH 端口
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# 禁用密码登录（使用密钥）
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 重启 SSH
sudo systemctl restart sshd
```

## 二、配置 SSH 密钥登录

```bash
# 本地生成密钥
ssh-keygen -t ed25519 -C "your@email.com"

# 上传公钥到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server -p 2222
```

## 三、配置防火墙

```bash
sudo ufw allow 2222/tcp  # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 四、配置自动更新

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 五、设置时区

```bash
sudo timedatectl set-timezone Asia/Shanghai
```

## 六、创建普通用户

```bash
adduser deploy
usermod -aG sudo deploy
```

## 七、安装 Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deploy
```

## 八、配置 Swap（内存不足时）

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 九、配置 Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## 十、安装监控

```bash
# netdata - 实时监控
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# 或 Uptime Kuma
docker run -d --restart=always -p 3001:3001 louislam/uptime-kuma:1
```

## 一键脚本

保存为 `setup.sh`：

```bash
#!/bin/bash
# 更新系统
apt update && apt upgrade -y

# 安装基础工具
apt install -y curl wget git vim htop ufw fail2ban unattended-upgrades

# 配置时区
timedatectl set-timezone Asia/Shanghai

# 配置防火墙
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 启用自动更新
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "✅ 初始化完成"
```
