#!/bin/sh
set -e

echo "🚀 Starting Claude Code Hub..."
echo ""

# 等待数据库就绪（可选，因为 docker-compose 已有健康检查）
echo "⏳ Checking database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if pnpm run db:migrate 2>&1 | grep -q "Error"; then
        echo "   Database not ready, waiting... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
        sleep 2
        RETRY_COUNT=$((RETRY_COUNT + 1))
    else
        echo "✅ Database is ready!"
        break
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Database connection timeout after $MAX_RETRIES attempts"
    exit 1
fi

# 执行数据库迁移
echo ""
echo "🔄 Running database migrations..."
pnpm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully!"
else
    echo "❌ Database migration failed!"
    exit 1
fi

# 启动应用
echo ""
echo "🎯 Starting Next.js application on port ${PORT:-3000}..."
echo "================================"
echo ""

# 使用 exec 替换当前进程，确保信号正确传递
exec pnpm run start