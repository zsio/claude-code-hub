<div align="center">

# Claude Code Hub

**🚀 智能 AI API 代理中转服务平台**

专为需要统一管理多个 AI 服务提供商的团队和企业设计

[![Docker Image](https://img.shields.io/docker/v/zsio/claude-code-hub?label=Docker&logo=docker)](https://hub.docker.com/r/zsio/claude-code-hub)
[![License](https://img.shields.io/github/license/zsio/claude-code-hub)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/zsio/claude-code-hub)](https://github.com/zsio/claude-code-hub/stargazers)

[功能特性](#-功能特性) •
[快速部署](#-快速部署) •
[使用指南](#-使用指南) •
[路线图](#️-路线图) •
[常见问题](#-常见问题)

</div>

---

## ✨ 功能特性

### 核心能力

- **🔄 统一代理** - 一个 API 接口管理所有 AI 服务提供商（OpenAI、Claude、Gemini 等）
- **⚖️ 智能负载** - 基于权重的智能分发 + 自动故障转移 + 会话保持
- **👥 多租户** - 完整的用户体系，细粒度权限控制和配额管理
- **🔑 密钥管理** - API Key 生成、轮换、过期管理
- **📊 实时监控** - 请求统计、成本追踪、性能分析、可视化报表
- **🎨 现代 UI** - 基于 Shadcn UI 的响应式管理面板，深色模式
- **🚀 生产就绪** - Docker 一键部署、自动数据库迁移、健康检查

### 界面预览

<div align="center">

![统计面板](/public/readme/统计.webp)

*实时统计面板 - 请求量、成本、用户活跃度一目了然*

![供应商管理](/public/readme/供应商.webp)

*供应商管理 - 配置上游服务、权重分配、流量限制*

</div>

## 🚀 快速部署

### 前置要求

- Docker 和 Docker Compose
- ⏱️ 仅需 **2 分钟**即可启动完整服务

### 一键部署

使用 `docker-compose.yaml` 启动

<details>
<summary><b>📄 点击展开 docker-compose.yaml 配置文件</b></summary>

```yaml
services:
  postgres:
    image: postgres:18
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

### 启动服务

```bash
# 启动所有服务（后台运行）
docker compose up -d

# 查看启动日志
docker compose logs -f
```

### 验证部署

**检查服务状态**
   ```bash
   docker compose ps
   ```
   确保两个容器都是 `healthy` 或 `running` 状态


### 环境变量说明

<details>
<summary><b>📝 完整环境变量配置说明</b></summary>

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `ADMIN_TOKEN` | ✅ | `change-me` | 管理员登录令牌，**必须修改为强密码** |
| `DB_USER` | ❌ | `postgres` | 数据库用户名 |
| `DB_PASSWORD` | ❌ | `postgres` | 数据库密码（生产环境建议修改） |
| `DB_NAME` | ❌ | `claude_code_hub` | 数据库名称 |
| `AUTO_MIGRATE` | ❌ | `true` | 启动时自动执行数据库迁移 |

**生产环境安全建议**：
- ⚠️ 必须修改 `ADMIN_TOKEN` 为强密码（≥20 字符，包含大小写字母、数字、特殊符号）
- ⚠️ 建议修改 `DB_PASSWORD` 为强密码
- 🔒 如果暴露到公网，建议配置反向代理（Nginx）+ HTTPS
- 🔒 限制数据库端口 `35432` 的外部访问

</details>

### 管理命令

```bash
# 查看日志
docker compose logs -f          # 所有服务
docker compose logs -f app      # 仅应用
docker compose logs -f postgres # 仅数据库

# 重启服务
docker compose restart          # 重启所有
docker compose restart app      # 仅重启应用

# 停止服务
docker compose stop             # 停止但保留容器
docker compose down             # 停止并删除容器

# 升级到最新版本
docker compose pull             # 拉取最新镜像
docker compose up -d            # 重新创建容器（自动迁移）

# 备份数据
docker exec claude-code-hub-db pg_dump -U postgres claude_code_hub > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据
docker exec -i claude-code-hub-db psql -U postgres claude_code_hub < backup.sql

# 完全清理（⚠️ 会删除所有数据）
docker compose down -v
```

## 📖 使用指南

### 1️⃣ 初始设置

首次访问 http://localhost:23000，使用 `ADMIN_TOKEN` 登录管理后台。

### 2️⃣ 添加 AI 服务提供商

进入 **设置 → 供应商管理**，点击"添加供应商"：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| 名称 | 供应商标识名称 | `OpenAI-US-1` |
| 描述 | 备注信息 | `OpenAI 美国节点` |
| URL | API Endpoint | `https://api.openai.com` |
| API Key | 上游服务密钥 | `sk-proj-xxx...` |
| 权重 | 负载均衡权重（1-100） | `10`（权重越高，分配请求越多） |
| TPM | 每分钟 Token 限制 | `1000000` |
| RPM | 每分钟请求限制 | `3500` |
| RPD | 每天请求限制 | `10000` |
| 并发数 | 最大并发连接数 | `100` |

> **📌 重要说明：API 格式兼容性**
>
> 本服务**仅支持 Claude Code 格式**的 API 接口。如果您需要使用其他格式的 AI 服务（如智谱 GLM、Kimi、Packy 等），请先使用 `claude-code-router` 进行格式转换，然后将转换后的服务地址添加到本系统。
>
> **支持的接入方式**：
> - ✅ 直接支持：原生 Claude Code 格式的服务
> - ✅ 通过 Router 支持：智谱 GLM、Kimi、Packy、通义千问、文心一言等（需先部署 `claude-code-router` 进行协议转换）

### 3️⃣ 创建用户和密钥

**添加用户**：
1. 进入 **设置 → 用户管理**
2. 点击"添加用户"
3. 配置：
   - 用户名称
   - 描述信息
   - RPM 限制（每分钟请求数）
   - 每日额度（USD）

**生成 API 密钥**：
1. 选择用户，点击"生成密钥"
2. 设置密钥名称
3. 设置过期时间（可选）
4. **⚠️ 复制并保存密钥**（仅显示一次）

### 4️⃣ 使用代理 API

用户使用生成的密钥调用服务：

```bash
curl http://localhost:23000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxx" \
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": true
  }'
```

**兼容性**：完全兼容 OpenAI API 格式，可直接替换现有应用中的 API Base URL。

### 5️⃣ 监控和统计

**仪表盘**页面提供：
- 📈 实时请求量趋势
- 💰 成本统计和分析
- 👤 用户活跃度排行
- 🔧 供应商性能对比
- ⚠️ 异常请求监控

### 6️⃣ 配置模型价格

进入 **设置 → 价格管理**，配置各模型的计费单价：

- 支持按模型配置输入/输出 Token 单价
- 自动计算请求成本
- 导出成本报表

## 🗺️ 路线图

查看项目的开发路线图和进度：

<div align="center">

**[📋 查看完整路线图](https://github.com/users/zsio/projects/3)**

</div>

### 近期计划

我们在 [GitHub Projects](https://github.com/users/zsio/projects/3) 上维护详细的开发路线图，包括：

欢迎在 [Issues](https://github.com/zsio/claude-code-hub/issues) 中提出您的功能建议！

## 🛠️ 常见问题

<details>
<summary><b>❓ 如何重置管理员密码？</b></summary>

编辑 `.env` 文件，修改 `ADMIN_TOKEN`，然后重启应用：
```bash
docker compose restart app
```

</details>

<details>
<summary><b>❓ 端口已被占用怎么办？</b></summary>

编辑 `docker-compose.yaml`，修改端口映射：
```yaml
services:
  app:
    ports:
      - "8080:23000"  # 将 23000 改为任意可用端口

  postgres:
    ports:
      - "15432:5432"  # 修改数据库端口
```

</details>

<details>
<summary><b>❓ 如何查看详细错误日志？</b></summary>

```bash
# 实时查看应用日志
docker compose logs -f app

# 查看最近 200 行日志
docker compose logs --tail=200 app

# 查看数据库日志
docker compose logs -f postgres
```

</details>

<details>
<summary><b>❓ 数据库迁移失败怎么办？</b></summary>

1. 检查数据库连接：
   ```bash
   docker compose exec app sh -c 'echo "SELECT version();" | psql $DSN'
   ```

2. 查看应用日志：
   ```bash
   docker compose logs app | grep -i migration
   ```

3. 手动执行迁移：
   ```bash
   docker compose exec app pnpm db:migrate
   ```

4. 如果持续失败，可以重置数据库（⚠️ 会丢失数据）：
   ```bash
   docker compose down -v
   docker compose up -d
   ```

</details>

<details>
<summary><b>❓ 如何配置反向代理（Nginx + HTTPS）？</b></summary>

Nginx 配置示例：
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:23000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

</details>

<details>
<summary><b>❓ 如何备份和恢复数据？</b></summary>

**自动备份**（推荐）：
```bash
# 添加到 crontab（每天凌晨 2 点备份）
0 2 * * * docker exec claude-code-hub-db pg_dump -U postgres claude_code_hub | gzip > /backup/claude_$(date +\%Y\%m\%d).sql.gz
```

**手动备份**：
```bash
docker exec claude-code-hub-db pg_dump -U postgres claude_code_hub > backup.sql
```

**恢复数据**：
```bash
docker exec -i claude-code-hub-db psql -U postgres claude_code_hub < backup.sql
```

</details>

<details>
<summary><b>❓ 支持哪些 AI 服务提供商？</b></summary>

**本服务仅支持 Claude Code 格式的 API 接口。**

**直接支持**：
- ✅ 原生提供 Claude Code 格式接口的服务商

**间接支持**（需要先部署 [claude-code-router](https://github.com/zsio/claude-code-router) 进行协议转换）：
- 🔄 智谱 AI (GLM)
- 🔄 Moonshot AI (Kimi)
- 🔄 Packy
- 🔄 阿里通义千问
- 🔄 百度文心一言
- 🔄 其他非 Claude Code 格式的 AI 服务

**接入流程**：
1. 部署 [claude-code-router](https://github.com/zsio/claude-code-router) 服务
2. 在 router 中配置需要接入的上游 AI 服务
3. 将 router 的地址作为供应商添加到本系统

</details>

<details>
<summary><b>❓ 如何监控服务健康状态？</b></summary>

**使用 Docker 健康检查**：
```bash
docker compose ps
```

**查看容器资源使用**：
```bash
docker stats claude-code-hub-app claude-code-hub-db
```

**集成监控工具**（可选）：
- Prometheus + Grafana
- Uptime Kuma
- Zabbix

</details>

<details>
<summary><b>❓ 性能调优建议？</b></summary>

1. **数据库优化**：
   - 定期执行 `VACUUM ANALYZE`
   - 根据实际负载调整连接池大小
   - 为高频查询字段添加索引

2. **应用层优化**：
   - 启用 Redis 缓存（可选）
   - 调整 Node.js 内存限制
   - 使用 CDN 缓存静态资源

3. **基础设施**：
   - 使用 SSD 存储
   - 增加服务器内存
   - 配置负载均衡（多实例部署）

</details>

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

## 🌟 Star History

如果这个项目对你有帮助，请给它一个 ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=zsio/claude-code-hub&type=Date)](https://star-history.com/#zsio/claude-code-hub&Date)

## 📞 支持与反馈

<div align="center">

**[🐛 报告问题](https://github.com/zsio/claude-code-hub/issues)** •
**[💡 功能建议](https://github.com/zsio/claude-code-hub/issues/new)** •
**[📖 查看文档](https://github.com/zsio/claude-code-hub/wiki)**

Made with ❤️ by [zsio](https://github.com/zsio)

</div>
