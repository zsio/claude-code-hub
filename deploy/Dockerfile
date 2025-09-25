
# 使用 Node.js 22 slim 版本
FROM docker.m.daocloud.io/library/node:22-slim

# 启用 corepack 以使用 pnpm
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖（使用 --no-frozen-lockfile 避免锁文件不同步问题）
RUN pnpm install --no-frozen-lockfile

# 复制项目文件
COPY . .

# 构建 Next.js 应用
RUN pnpm run build

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# 创建非 root 用户运行应用
RUN chown -R node:node /app

# 切换到 node 用户
USER node

# 暴露端口
EXPOSE 3000

# 启动应用（迁移将在应用启动时自动执行）
CMD ["pnpm", "run", "start"]