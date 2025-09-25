# Claude Code Hub

Claude Code Hub 是一个 Claude Code API 代理中转服务平台，专为需要统一管理多个 CC 服务提供商的团队和企业设计。通过智能负载均衡、用户权限管理和详细的使用统计，帮助您更高效、更安全地使用各种 CC 服务。

![统计](/public/readme/统计.webp)

## 🎯 核心功能

- **🔄 智能代理** - 统一的 API 接口，代理多个 CC 服务提供商
- **⚖️ 负载均衡** - 智能分发请求，支持权重配置和故障转移
- **👥 用户管理** - 多用户支持，细粒度权限和配额控制
- **🔑 密钥管理** - 安全的 API 密钥生成和生命周期管理
- **📊 使用统计** - 实时监控、成本分析和数据可视化
- **🎨 现代界面** - 响应式管理面板，支持深色模式

## 🚀 快速部署

### 推荐：Docker Compose 部署

我们推荐使用 Docker Compose 进行一键部署，这种方式简单可靠，适合生产环境使用。

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/claude-code-hub.git
   cd claude-code-hub
   ```

2. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env

   # 编辑环境变量文件
   nano .env
   ```

   主要配置项：
   ```bash
   # 管理员令牌（请设置一个强密码）
   ADMIN_TOKEN=your-secure-admin-token-here

   # 数据库配置（可选，使用默认值即可）
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=claude_code_hub
   ```

3. **一键启动**
   ```bash
   cd deploy
   docker-compose up -d
   ```

4. **访问应用**
   - 应用地址：http://localhost:23000
   - 数据库端口：localhost:35432（如需直连）

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

1. 拉取最新代码：`git pull`
2. 重新构建：`docker-compose build --no-cache`
3. 重启服务：`docker-compose up -d`

</details>
