# MomentSwap Docker 部署文档

## 1. 本机构建项目

```bash
# 安装依赖
bun install

# 构建项目
bun run build
```

## 2. 本地编译镜像

```bash
# 构建 x86 镜像
docker build --platform linux/amd64 -t moment-swap .
```

## 3. 打包镜像

```bash
# 保存镜像
docker save moment-swap | gzip > moment-swap.tar.gz
```

## 3. 上传服务器

```bash
# 传输到服务器
scp moment-swap.tar.gz user@server:/path/to/deploy/
```

## 4. 服务器部署

```bash
# 加载镜像
docker load < moment-swap.tar.gz

# 启动应用
docker run -d -p 3000:3000 --name moment-swap-app moment-swap
```

## 5. 环境变量配置

```bash
# 带环境变量启动
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e WALLET_PRIVATE_KEY=your_private_key \
  --name moment-swap-app \
  moment-swap
```

## 常用命令

```bash
# 查看日志
docker logs moment-swap-app

# 停止应用
docker stop moment-swap-app

# 重启应用
docker restart moment-swap-app

# 删除容器
docker rm moment-swap-app
```