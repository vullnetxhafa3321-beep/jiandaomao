#!/bin/bash
# 在 GitHub 创建远程仓库并推送（需先登录 GitHub）
#
# 用法：
#   chmod +x scripts/setup-github.sh
#   ./scripts/setup-github.sh
#
# 或带 token（在 https://github.com/settings/tokens 创建，勾选 repo 权限）：
#   GITHUB_TOKEN=ghp_xxx ./scripts/setup-github.sh

set -e
cd "$(dirname "$0")/.."

REPO_NAME="${REPO_NAME:-jiandaomao}"
GITHUB_USER="${GITHUB_USER:-}"

if [ -z "$GITHUB_USER" ]; then
  echo "请输入你的 GitHub 用户名："
  read -r GITHUB_USER
fi

if [ -n "$GITHUB_TOKEN" ]; then
  echo "→ 通过 API 创建仓库 $GITHUB_USER/$REPO_NAME ..."
  curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"捡到猫 - 城市流浪猫救助 H5\",\"private\":false}" \
    | grep -E '"html_url"|"message"' || true
else
  echo ""
  echo "未设置 GITHUB_TOKEN，请手动创建仓库："
  echo "  1. 打开 https://github.com/new"
  echo "  2. Repository name: $REPO_NAME"
  echo "  3. 选 Public，不要勾选 README（本地已有）"
  echo "  4. 点 Create repository"
  echo ""
  read -p "创建完成后按回车继续..."
fi

REMOTE="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

echo "→ 推送到 $REMOTE"
git branch -M main
git push -u origin main

echo ""
echo "✅ 完成！仓库地址："
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "邀请队友：Settings → Collaborators → Add people"
