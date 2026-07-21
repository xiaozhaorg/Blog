#!/usr/bin/env python3
"""
自动发布待发布文章到主目录
- 从 src/content/posts/pending/ 读取 draft: true 的文章
- 修改 draft 为 false，设置发布日期为今天
- 每篇文章发布时间错开（上午/下午/晚上）
- 每天发布指定数量（默认3篇）
- 没有待发布文章则跳过
"""
import os
import re
import shutil
import sys
from datetime import datetime, timezone, timedelta

# 路径
PENDING_DIR = "src/content/posts/pending"
POSTS_DIR = "src/content/posts"
IMAGES_PENDING_DIR = "public/images/pending"

# 北京时间
BEIJING_TZ = timezone(timedelta(hours=8))

def parse_frontmatter(content):
    """解析 frontmatter"""
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not match:
        return None, None
    return match.group(1), match.group(2)

def update_frontmatter(fm, pub_datetime):
    """更新 frontmatter：draft=false，pubDatetime"""
    lines = fm.split('\n')
    new_lines = []
    has_draft = False
    has_pub = False
    for line in lines:
        if line.startswith('draft:'):
            new_lines.append('draft: false')
            has_draft = True
        elif line.startswith('pubDatetime:'):
            new_lines.append(f'pubDatetime: {pub_datetime.isoformat().replace("+00:00", "Z")}')
            has_pub = True
        else:
            new_lines.append(line)

    if not has_draft:
        new_lines.insert(0, 'draft: false')
    if not has_pub:
        new_lines.insert(1, f'pubDatetime: {pub_datetime.isoformat().replace("+00:00", "Z")}')

    return '\n'.join(new_lines)

def get_pending_posts():
    """获取所有待发布文章，按文件名字典序排列"""
    if not os.path.isdir(PENDING_DIR):
        return []
    files = [f for f in os.listdir(PENDING_DIR) if f.endswith('.md')]
    # 按文件名字母顺序排序，确保发布顺序稳定
    files.sort()
    return files

def publish_one(filename, pub_datetime):
    """发布一篇文章"""
    src = os.path.join(PENDING_DIR, filename)
    dst = os.path.join(POSTS_DIR, filename)

    # 读取并处理
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()

    fm, body = parse_frontmatter(content)
    if fm is None:
        print(f"  ⚠️ 跳过 {filename}: 无 frontmatter")
        return False

    # 检查是否已经是 draft: false
    if re.search(r'draft:\s*false', fm):
        print(f"  ⏭️ 跳过 {filename}: 已发布")
        return False

    new_fm = update_frontmatter(fm, pub_datetime)
    new_content = f'---\n{new_fm}\n---\n{body}'

    # 写入主目录
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # 删除 pending 中的文件
    os.remove(src)

    # 移动配图目录
    slug = filename[:-3]  # 去掉 .md
    img_src = os.path.join(IMAGES_PENDING_DIR, slug)
    img_dst = os.path.join("public/images", slug)
    if os.path.isdir(img_src):
        if os.path.exists(img_dst):
            shutil.rmtree(img_dst)
        shutil.move(img_src, img_dst)
        print(f"  📁 移动配图: {slug}/")

    return True

def main():
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 3

    pending = get_pending_posts()
    available = len(pending)

    print(f"📚 待发布文章: {available} 篇")
    print(f"🎯 计划发布: {count} 篇")
    print()

    if available == 0:
        print("✅ 暂无待发布文章")
        return 0

    # 发布时间错开
    today = datetime.now(BEIJING_TZ).replace(hour=0, minute=0, second=0, microsecond=0)
    # 错峰时间（北京时间）：9-11点、14-16点、19-21点
    times = [
        today.replace(hour=9, minute=30),   # 上午
        today.replace(hour=14, minute=45),  # 下午
        today.replace(hour=20, minute=15),  # 晚上
        today.replace(hour=10, minute=15),
        today.replace(hour=15, minute=30),
    ]

    published = 0
    for i, filename in enumerate(pending[:count]):
        pub_time = times[i] if i < len(times) else times[0]
        # 转 UTC（北京时间 - 8h = UTC）
        pub_utc = pub_time.astimezone(timezone.utc)
        print(f"📝 发布: {filename}")
        print(f"   时间: {pub_time.strftime('%Y-%m-%d %H:%M')} (北京时间)")
        if publish_one(filename, pub_utc):
            published += 1
        print()

    print(f"✅ 完成: 成功发布 {published} 篇")
    if available > count:
        print(f"📦 剩余待发布: {available - count} 篇")
    return published

if __name__ == "__main__":
    sys.exit(0 if main() > 0 else 0)
