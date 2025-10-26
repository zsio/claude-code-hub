# 价格表上传功能修改

## 修改内容

修改了价格表上传功能，使其能够存储所有模型的价格数据，而不再仅限于 Claude 模型。

## 修改的文件

### 1. `src/actions/model-prices.ts`

**修改点：**
- 第 56-58 行：移除了对 `claude-` 前缀的过滤逻辑
- 修改前：只处理模型名以 `claude-` 开头的条目
- 修改后：处理所有非空的模型名条目

**代码变更：**
```typescript
// 修改前
const entries = Object.entries(priceTable).filter(([modelName]) =>
  typeof modelName === "string" && modelName.toLowerCase().startsWith("claude-")
);

// 修改后
const entries = Object.entries(priceTable).filter(([modelName]) =>
  typeof modelName === "string" && modelName.trim().length > 0
);
```

**注释更新：**
- 第 111 行：更新了 `getModelPrices()` 函数的注释，移除了"仅包含 claude 系列"的说明

### 2. `src/repository/model-price.ts`

**修改点：**
- 移除了 SQL 查询中的 `WHERE model_name ILIKE 'claude-%'` 条件
- 添加了对已使用模型的过滤，只查询在 `message_request` 表中实际使用过的模型
- 修改前：只查询 `claude-` 开头的模型
- 修改后：查询所有已在系统中使用过的模型（通过 JOIN message_request 表实现）

**代码变更：**
```sql
-- 修改前
WITH latest_prices AS (
  SELECT
    model_name,
    MAX(created_at) as max_created_at
  FROM model_prices
  WHERE model_name ILIKE 'claude-%'
  GROUP BY model_name
),
...

-- 修改后（第一版）
WITH latest_prices AS (
  SELECT
    model_name,
    MAX(created_at) as max_created_at
  FROM model_prices
  GROUP BY model_name
),
...

-- 修改后（最终版：仅显示已使用的模型）
WITH used_models AS (
  SELECT DISTINCT model
  FROM message_request
  WHERE model IS NOT NULL
    AND deleted_at IS NULL
),
latest_prices AS (
  SELECT
    mp.model_name,
    MAX(mp.created_at) as max_created_at
  FROM model_prices mp
  INNER JOIN used_models um ON mp.model_name = um.model
  GROUP BY mp.model_name
),
...
```

**优化说明：**
- 添加了 `used_models` CTE（公共表表达式），从 `message_request` 表中获取所有已使用的模型名称
- 在 `latest_prices` CTE 中通过 INNER JOIN 过滤，只保留已使用的模型
- 这样价格表页面只会显示实际在系统中被使用过的模型，避免显示大量从未使用的模型

## 验证结果

### 数据库 Schema 兼容性
✅ `modelPrices` 表使用 `varchar` 存储模型名和 `jsonb` 存储价格数据，原生支持各种供应商的模型

### 成本计算功能
✅ `cost-calculation.ts` 中的计算逻辑基于通用的 `ModelPriceData` 接口，不依赖特定模型前缀

### 数据验证
✅ 保留了价格数据的有效性验证：
- JSON 格式验证
- 对象类型验证
- 模型名非空验证
- 价格数据对象验证

### 类型检查和 Lint
✅ 所有修改通过 TypeScript 类型检查
✅ 所有修改通过 ESLint 检查

## 影响范围

### 受益功能
1. **价格表上传**：现在可以上传包含所有供应商（如 OpenAI、Anthropic、Google 等）的模型价格
2. **价格管理**：管理员可以查看和管理所有模型的价格（仅显示已使用的模型，避免信息过载）
3. **成本计算**：代理请求可以准确计算各种模型的成本
4. **界面优化**：价格表页面只显示实际使用过的模型，提供更清晰的视图

### 无影响功能
1. **现有成本计算逻辑**：不受影响，仍然使用相同的计算方法
2. **请求日志和统计**：不受影响
3. **UI 界面**：不需要修改（行为优化但 UI 保持不变）

## 使用说明

### 上传价格表
1. 访问"设置 → 价格表"页面
2. 点击"上传价格表"按钮
3. 选择包含模型价格的 JSON 文件（推荐使用 [LiteLLM 价格表](https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json)）
4. 系统将自动处理所有模型的价格数据

### 价格表 JSON 格式
```json
{
  "gpt-4": {
    "input_cost_per_token": 0.00003,
    "output_cost_per_token": 0.00006,
    "max_tokens": 8192,
    "litellm_provider": "openai"
  },
  "claude-3-5-sonnet-20241022": {
    "input_cost_per_token": 0.000003,
    "output_cost_per_token": 0.000015,
    "max_tokens": 8192,
    "litellm_provider": "anthropic"
  },
  "gemini-pro": {
    "input_cost_per_token": 0.00000125,
    "output_cost_per_token": 0.00000375,
    "max_tokens": 32768,
    "litellm_provider": "gemini"
  }
}
```

## 测试建议

### 功能测试
1. **测试上传包含多个供应商模型的价格表**
   - 准备包含 OpenAI、Anthropic、Google 等多个供应商模型的 JSON 文件
   - 上传并验证所有模型都被正确存储

2. **测试价格更新**
   - 上传相同模型但价格不同的数据
   - 验证系统正确识别为"更新"而不是"新增"

3. **测试价格查询**
   - 在价格表页面验证只显示已使用的模型
   - 验证不同供应商的模型都能正确显示
   - 使用某个新模型后，刷新价格表页面应该能看到该模型的价格

4. **测试成本计算**
   - 使用不同供应商的模型发起代理请求
   - 验证成本计算正确

### 边界测试
1. 空模型名过滤：验证空字符串或只有空格的模型名会被忽略
2. 无效价格数据：验证非对象类型的价格数据会被标记为失败
3. 大文件上传：验证 10MB 限制正常工作

## 验收标准

✅ 上传价格表时，所有模型的价格都被正确存储到数据库
✅ 不再有针对 Claude 模型的特殊过滤逻辑
✅ 现有的成本计算和统计功能不受影响
✅ 价格数据的验证逻辑仍然有效
✅ TypeScript 类型检查通过
✅ ESLint 检查通过
