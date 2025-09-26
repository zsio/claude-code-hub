# Claude Code Hub

Claude Code Hub 是一个 Claude Code API 代理中转服务平台，专为需要统一管理多个 CC 服务提供商的团队和企业设计。通过智能负载均衡、用户权限管理和详细的使用统计，帮助您更高效、更安全地使用各种 CC 服务。

![统计](/public/readme/统计.webp)
![供应商](/public/readme/供应商.webp)

## 🎯 核心功能

- **🔄 智能代理** - 统一的 API 接口，代理多个 CC 服务提供商
- **⚖️ 负载均衡** - 智能分发请求，支持权重配置和故障转移
- **👥 用户管理** - 多用户支持，细粒度权限和配额控制
- **🔑 密钥管理** - 安全的 API 密钥生成和生命周期管理
- **📊 使用统计** - 实时监控、成本分析和数据可视化
- **🎨 现代界面** - 响应式管理面板，支持深色模式

## 🚀 快速部署

### 推荐：官方 Docker 镜像 + Compose

生产环境建议直接使用已经发布到 Docker Hub 的镜像 `zsio/claude-code-hub:latest`，无需进行本地构建。

1. **准备环境变量**

   ```bash
   # 获取示例并保存为部署时使用的 .env
   curl -fsSL https://raw.githubusercontent.com/zsio/claude-code-hub/main/.env.example -o .env

   # 根据需求修改 .env（可使用任意编辑器）
   nano .env
   ```

   关键配置示例：

   ```bash
   # 管理员令牌（请设置强密码）
   ADMIN_TOKEN=your-secure-admin-token

   # PostgreSQL 连接信息
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=claude_code_hub
   ```

2. **创建 docker-compose.yaml**

   将下方示例保存到 `.env` 同级目录；如需自定义端口或数据库，请自行调整。

   <details>
   <summary>docker-compose.yaml 示例</summary>

   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       container_name: claude-code-hub-db
       restart: unless-stopped
       ports:
         - "35432:5432"
       environment:
         POSTGRES_USER: ${DB_USER:-postgres}
         POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
         POSTGRES_DB: ${DB_NAME:-claude_code_hub}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-claude_code_hub}"]
         interval: 5s
         timeout: 5s
         retries: 10
         start_period: 10s

     app:
       image: zsio/claude-code-hub:latest
       container_name: claude-code-hub-app
       depends_on:
         postgres:
           condition: service_healthy
       env_file:
         - ./.env
       environment:
         NODE_ENV: production
         PORT: 23000
         DSN: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-claude_code_hub}
       ports:
         - "23000:23000"
       restart: unless-stopped

   volumes:
     postgres_data:
       driver: local
   ```

   </details>

3. **启动服务**

   ```bash
   docker compose up -d
   ```

4. **访问应用**
   - Web 管理后台：<http://localhost:23000>
   - PostgreSQL：localhost:35432（需要直连时使用）

### 其他部署方式

如果您需要手动部署或开发环境，可参考以下步骤：

<details>
<summary>手动部署指南</summary>

**环境要求**

- Node.js ≥ 18
- PostgreSQL ≥ 12
- pnpm ≥ 9.15.0

**步骤**

1. 安装依赖：`pnpm install`
2. 配置环境变量：复制 `.env.example` 到 `.env.local`
3. 初始化数据库：`pnpm run db:migrate`
4. 构建应用：`pnpm run build`
5. 启动服务：`pnpm run start`

</details>

## 📖 使用指南

### 初始设置

首次访问应用后，使用您在环境变量中设置的 `ADMIN_TOKEN` 登录管理后台。

### 添加 AI 服务提供商

在"供应商管理"页面添加您的 AI 服务提供商：

- 支持 OpenAI、Claude、Gemini 等主流服务
- 配置 API 密钥和请求权重
- 设置负载均衡策略

### 创建用户和密钥

- 在"用户管理"创建新用户
- 为用户生成 API 密钥
- 设置使用配额和权限

### 监控和管理

- 查看实时使用统计
- 监控成本和性能
- 管理用户配额和权限

## 🛠️ 常见问题

<details>
<summary>如何重置管理员密码？</summary>

修改 `.env` 文件中的 `ADMIN_TOKEN`，然后重启应用。

</details>

<details>
<summary>如何备份数据？</summary>

数据存储在 PostgreSQL 中，您可以使用标准的数据库备份工具：

```bash
docker exec claude-code-hub-db pg_dump -U postgres claude_code_hub > backup.sql
```

</details>

<details>
<summary>如何升级应用？</summary>

1. 拉取最新镜像：`docker compose pull`
2. 重启服务：`docker compose up -d`

</details>
