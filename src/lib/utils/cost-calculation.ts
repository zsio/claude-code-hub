import type { ModelPriceData } from "@/types/model-price";

/**
 * 计算单次请求的费用
 * @param usage - token使用量
 * @param priceData - 模型价格数据
 * @returns 费用（美元）
 */
export function calculateRequestCost(
  usage: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  },
  priceData: ModelPriceData
): number {
  let cost = 0;

  // 计算输入token费用
  if (usage.input_tokens && priceData.input_cost_per_token) {
    cost += usage.input_tokens * priceData.input_cost_per_token;
  }

  // 计算输出token费用
  if (usage.output_tokens && priceData.output_cost_per_token) {
    cost += usage.output_tokens * priceData.output_cost_per_token;
  }

  // 计算缓存创建token费用
  if (usage.cache_creation_input_tokens && priceData.cache_creation_input_token_cost) {
    cost += usage.cache_creation_input_tokens * priceData.cache_creation_input_token_cost;
  }

  // 计算缓存读取token费用
  if (usage.cache_read_input_tokens && priceData.cache_read_input_token_cost) {
    cost += usage.cache_read_input_tokens * priceData.cache_read_input_token_cost;
  }

  return cost;
}