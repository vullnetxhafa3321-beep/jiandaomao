#!/bin/bash
# 在 GitHub 创建远程仓库并推送
#
# 用法：./scripts/setup-github.sh

GH="${GH:-$(command -v gh || echo "$HOME/.local/bin/gh")}"
REPO_NAME="${REPO_NAME:-jiandaomao}"

cd "$(dirname "$0")/.."

# 优先用 gh CLI（已登录时一键完成）
if [ -x "$GH" ] && "$GH" auth status &>/dev/null; then
  echo "→ 通过 gh CLI 创建并推送 $REPO_NAME ..."
  if git remote get-url origin &>/dev/null; then
    git push -u origin main
  else
    "$GH" repo create "$REPO_NAME" --public \
      --description "捡到猫 - 城市流浪猫救助 H5" \
      --source=. --remote=origin --push
  fi
  echo ""
  echo "✅ 完成！"
  "$GH" repo view --json url -q .url
  exit 0
fi

# 降级：手动流程
GITHUB_USER="${GITHUB_USER:-}"
if [ -z "$GITHUB_USER" ]; then
  echo "请输入你的 GitHub 用户名："
  read -r GITHUB_USER
fi

if [ -n "$GITHUB_TOKEN" ]; then
  curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"捡到猫 - 城市流浪猫救助 H5\",\"private\":false}"
else
  echo "请先在 https://github.com/new 创建仓库：$REPO_NAME"
  read -p "创建完成后按回车继续..."
fi

REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

git branch -M main
git push -u origin main
echo "✅ https://github.com/${GITHUB_USER}/${REPO_NAME}"
