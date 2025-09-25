# Docker 部署指南

## 快速开始

### 1. 准备环境变量
```bash
cd deploy
cp .env.example ../.env.local
# 编辑 ../.env.local 设置你的数据库密码
```

### 2. 启动服务
```bash
# 构建并启动所有服务（仅两个容器：数据库 + 应用）
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

### 3. 验证部署
- 应用地址：http://localhost:23000
- 数据库端口：35432（可用于外部连接）

## 架构说明

### 容器结构
1. **postgres 容器**：PostgreSQL 16 数据库
2. **app 容器**：Next.js 应用（包含自动迁移）

### 自动迁移机制

**方案选择：**

#### 当前方案：代码集成（推荐）
- 在 `src/instrumentation.ts` 中实现
- Next.js 启动时自动执行
- 无需额外脚本文件
- 通过 `AUTO_MIGRATE=false` 可禁用

#### 备选方案：启动脚本
- 使用 `deploy/entrypoint.sh`
- 更传统的 Docker 方式
- 适合需要更多控制的场景

### 迁移流程

1. **应用启动时**：
   - 检查数据库连接（最多重试 30 次）
   - 自动运行 Drizzle 迁移
   - 迁移成功后启动 Next.js

2. **失败处理**：
   - 数据库不可用：容器退出，Docker 自动重启
   - 迁移失败：记录错误并退出

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 重新构建并启动
docker-compose up -d --build

# 停止所有服务
docker-compose down

# 清理所有数据（危险！）
docker-compose down -v

# 手动执行迁移（开发环境）
docker-compose exec app pnpm run db:migrate

# 进入应用容器
docker-compose exec app sh

# 查看数据库
docker-compose exec postgres psql -U postgres -d claude_code_hub
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DB_USER` | 数据库用户名 | postgres |
| `DB_PASSWORD` | 数据库密码 | postgres |
| `DB_NAME` | 数据库名称 | claude_code_hub |
| `DSN` | 数据库连接字符串 | 自动生成 |
| `AUTO_MIGRATE` | 是否自动迁移 | true |
| `PORT` | 应用端口 | 23000 |

## 故障排查

### 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps postgres
docker-compose logs postgres

# 测试数据库连接
docker-compose exec postgres pg_isready
```

### 迁移失败
```bash
# 查看迁移日志
docker-compose logs app | grep -i migration

# 手动运行迁移查看详细错误
docker-compose exec app pnpm run db:migrate
```

### 应用无法启动
```bash
# 查看完整日志
docker-compose logs -f app

# 检查环境变量
docker-compose exec app env | grep -E "(DSN|DB_|NODE_ENV)"
```

## 生产部署建议

1. **安全性**：
   - 使用强密码
   - 限制数据库端口访问
   - 使用 Docker secrets 管理敏感信息

2. **性能**：
   - 挂载 SSD 作为数据库存储
   - 适当调整 PostgreSQL 配置
   - 使用 Docker Swarm 或 K8s 实现高可用

3. **备份**：
   ```bash
   # 备份数据库
   docker-compose exec postgres pg_dump -U postgres claude_code_hub > backup.sql

   # 恢复数据库
   docker-compose exec -T postgres psql -U postgres claude_code_hub < backup.sql
   ```