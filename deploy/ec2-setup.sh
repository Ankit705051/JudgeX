#!/usr/bin/env bash
# JudgeX EC2 setup: installs Docker + Node 20, pulls runner images,
# installs the backend, and enables systemd services for worker + consumer.
# Run as root (or with sudo) on a fresh Ubuntu 22.04/24.04 EC2 instance.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/judgex/backend}"
REPO_URL="${REPO_URL:-https://github.com/Ankit705051/JudgeX}"
BRANCH="${BRANCH:-main}"

echo "=== [1/6] System packages ==="
apt-get update
apt-get install -y ca-certificates curl git ufw

if ! command -v docker >/dev/null 2>&1; then
  echo "=== Installing Docker ==="
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
else
  echo "Docker already installed: $(docker --version)"
fi

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20* ]]; then
  echo "=== Installing Node 20 ==="
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "Node already installed: $(node -v)"
fi

echo "=== [2/6] Application code ==="
mkdir -p "$(dirname "$APP_DIR")"
if [[ -n "$REPO_URL" ]]; then
  if [[ -d "$APP_DIR/.git" ]]; then
    git -C "$APP_DIR" pull --ff-only
  else
    git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$APP_DIR"
  fi
else
  echo "REPO_URL not set — copy your backend/ folder to $APP_DIR manually, then re-run with SKIP_CODE=1"
  [[ "${SKIP_CODE:-0}" == "1" ]] || exit 1
fi

echo "=== [3/6] npm install ==="
cd "$APP_DIR"
npm ci --omit=dev || npm install --omit=dev

echo "=== [4/6] Language runner images ==="
# Pre-pull so first submissions aren't blocked on multi-hundred-MB pulls.
docker pull gcc:13
docker pull eclipse-temurin:17-jdk-jammy
docker pull python:3.9-slim
docker pull node:18-slim

echo "=== [5/6] Environment file ==="
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo ">>> Edit $APP_DIR/.env with production values before starting services:"
  echo "    MONGO_URI, REDIS_URL (same Redis your Render API uses), JWT_SECRET, WORKER_CONCURRENCY"
else
  echo ".env already exists — leaving it untouched"
fi

echo "=== [6/6] systemd services ==="
for svc in judgex-worker judgex-consumer; do
  sed "s|__APP_DIR__|$APP_DIR|g" "$APP_DIR/deploy/$svc.service" > "/etc/systemd/system/$svc.service"
done
systemctl daemon-reload
systemctl enable --now judgex-worker judgex-consumer || true

echo ""
echo "=== Done ==="
echo "Check status:   systemctl status judgex-worker judgex-consumer"
echo "Worker logs:    journalctl -u judgex-worker -f"
echo "Consumer logs:  journalctl -u judgex-consumer -f"
