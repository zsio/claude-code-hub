/**
 * 构建代理目标URL
 * @param baseUrl - 基础URL（如 https://open.bigmodel.cn/api/anthropic）
 * @param requestUrl - 原始请求URL对象
 * @returns 拼接后的完整URL字符串
 */
export function buildProxyUrl(baseUrl: string, requestUrl: URL): string {
  try {
    // 解析baseUrl
    const baseUrlObj = new URL(baseUrl);
    
    // 合并路径：baseUrl的路径 + 请求的路径
    // 确保路径拼接正确（处理斜杠）
    const basePath = baseUrlObj.pathname.replace(/\/$/, ''); // 移除末尾斜杠
    const requestPath = requestUrl.pathname; // 这已经包含 /v1/...
    
    // 构建最终URL
    baseUrlObj.pathname = basePath + requestPath;
    // 保留原始请求的查询参数
    baseUrlObj.search = requestUrl.search;
    
    return baseUrlObj.toString();
  } catch (error) {
    console.error("URL构建失败:", error);
    // 降级到字符串拼接
    const normalizedBaseUrl = baseUrl.replace(/\/$/, ''); 
    return `${normalizedBaseUrl}${requestUrl.pathname}${requestUrl.search}`;
  }
}

