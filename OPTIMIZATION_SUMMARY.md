# 价格表优化总结

## 问题背景

原始需求是让价格表上传功能支持存储所有模型（不仅限于 Claude 模型）。在实现过程中发现，如果直接查询所有上传的模型价格，当用户上传完整的 LiteLLM 价格表（包含数百个模型）时，价格表页面会显示大量从未使用过的模型，造成信息过载。

## 解决方案

采用了两阶段优化：

### 第一阶段：移除 Claude 模型限制
- 移除价格上传时对 `claude-` 前缀的过滤
- 允许上传和存储所有供应商的模型价格

### 第二阶段：智能过滤显示
- 在查询价格表时，只返回在 `message_request` 表中实际使用过的模型
- 通过 SQL JOIN 实现高效过滤
- 避免在价格表页面显示大量未使用的模型

## 技术实现

### SQL 查询优化

使用三层 CTE（公共表表达式）实现智能过滤：

```sql
WITH used_models AS (
  -- 第一步：获取所有已使用的模型
  SELECT DISTINCT model
  FROM message_request
  WHERE model IS NOT NULL
    AND deleted_at IS NULL
),
latest_prices AS (
  -- 第二步：获取已使用模型的最新价格时间
  SELECT
    mp.model_name,
    MAX(mp.created_at) as max_created_at
  FROM model_prices mp
  INNER JOIN used_models um ON mp.model_name = um.model
  GROUP BY mp.model_name
),
latest_records AS (
  -- 第三步：获取最新价格记录（处理同一时间多条记录的情况）
  SELECT
    mp.id,
    mp.model_name,
    mp.price_data,
    mp.created_at,
    mp.updated_at,
    ROW_NUMBER() OVER (PARTITION BY mp.model_name ORDER BY mp.id DESC) as rn
  FROM model_prices mp
  INNER JOIN latest_prices lp
    ON mp.model_name = lp.model_name
    AND mp.created_at = lp.max_created_at
)
SELECT *
FROM latest_records
WHERE rn = 1
ORDER BY model_name
```

### 性能考虑

1. **索引利用**：
   - `message_request` 表已有 `model` 字段的索引
   - `model_prices` 表已有 `model_name` 和 `created_at` 的复合索引
   - JOIN 操作可以充分利用这些索引

2. **查询效率**：
   - `DISTINCT` 操作在 `used_models` CTE 中只执行一次
   - 通过 INNER JOIN 提前过滤，减少后续处理的数据量
   - 窗口函数确保每个模型只返回一条记录

## 用户体验提升

### 之前的问题
- 上传完整 LiteLLM 价格表后，页面可能显示 300+ 个模型
- 大部分模型从未使用，造成信息干扰
- 难以快速找到实际关心的模型

### 优化后的体验
- 价格表页面只显示实际使用过的模型（通常 < 20 个）
- 界面清晰，易于管理
- 新模型首次使用后，自动出现在价格表中

## 使用场景示例

### 场景 1：初始部署
1. 管理员上传完整的 LiteLLM 价格表（包含 300+ 个模型）
2. 此时价格表页面为空（因为还没有使用任何模型）
3. 用户通过代理发起第一个请求，使用 `claude-3-5-sonnet-20241022`
4. 刷新价格表页面，显示 `claude-3-5-sonnet-20241022` 的价格信息

### 场景 2：多模型使用
1. 系统已使用了以下模型：
   - `claude-3-5-sonnet-20241022`
   - `gpt-4-turbo`
   - `gemini-pro`
2. 价格表页面只显示这 3 个模型的价格
3. 虽然数据库存储了 300+ 个模型的价格，但页面保持简洁

### 场景 3：价格更新
1. LiteLLM 更新了价格表
2. 管理员重新上传新的价格表
3. 系统自动识别已使用模型的价格变化
4. 只有已使用的模型价格被标记为"更新"
5. 未使用的模型价格静默存储，不影响界面

## 技术优势

1. **数据完整性**：所有模型价格都被存储，成本计算始终准确
2. **界面简洁性**：只显示相关信息，避免信息过载
3. **自动发现**：新模型使用后自动出现在价格表中
4. **性能优化**：通过 SQL 过滤减少数据传输和渲染开销
5. **向后兼容**：不影响现有的成本计算和统计功能

## 未来扩展

如果需要查看所有已上传的模型价格（包括未使用的），可以考虑：

1. 添加一个"显示所有模型"的开关
2. 在设置页面添加"模型价格管理"功能
3. 提供搜索和过滤功能

但目前的实现已经满足了大多数使用场景，保持了界面的简洁性。

## 验证清单

✅ 上传价格表时，所有模型的价格都被存储
✅ 价格表页面只显示已使用的模型
✅ 新模型使用后自动出现在价格表中
✅ 成本计算功能不受影响
✅ TypeScript 类型检查通过
✅ ESLint 检查通过
✅ 项目构建成功
