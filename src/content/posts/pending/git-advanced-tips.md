---
title: "Git 进阶技巧：10 个让同事对你刮目相看的高级命令"
pubDatetime: 2026-07-20T00:00:00Z
slug: git-advanced-tips
featured: false
draft: true
tags: ["开发工具", "教程"]
description: 10 个 Git 高级技巧，涵盖交互式 rebase、cherry-pick、worktree、bisect 等，让你的版本控制水平提升一个档次。
---

![Git 进阶技巧](/images/pending/git-advanced-tips/cover.svg)

Git 远不止 commit 和 push。掌握这 10 个高级命令，让你成为团队里的 Git 高手。

## 一、git rebase -i 交互式变基

整理提交历史，保持线性：

```bash
git rebase -i HEAD~3
```

弹出编辑器后：

```
pick a1b2c3 第一次提交
squash d4e5f6 第二次提交
reword g7h8i9 第三次提交
```

## 二、git cherry-pick 精选提交

把某个分支的特定提交应用到当前分支：

```bash
git cherry-pick <commit-hash>
```

## 三、git worktree 多工作目录

同时在多个分支工作：

```bash
git worktree add ../project-hotfix hotfix-branch
```

## 四、git bisect 二分查找

定位引入 bug 的提交：

```bash
git bisect start
git bisect bad
git bisect good v1.0
# 测试每个提交，标记 good/bad
git bisect reset
```

## 五、git stash 临时存储

```bash
git stash
git stash pop
git stash list
git stash apply stash@{0}
```

## 六、git reflog 找回丢失的提交

```bash
git reflog
git reset --hard HEAD@{2}
```

## 七、git log 美化输出

```bash
git log --graph --oneline --all
```

## 八、git blame 追责

```bash
git blame -L 10,20 file.js
```

## 九、git diff 高级用法

```bash
# 只看文件名
git diff --name-only

# 字符级对比
git diff --word-diff

# 两个分支对比
git diff main feature
```

## 十、git submodule 子模块

```bash
git submodule add https://github.com/user/lib.git
git submodule update --init --recursive
```
