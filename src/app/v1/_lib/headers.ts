/**
 * Header 处理器配置
 */
export interface HeaderProcessorConfig {
  /** 需要删除的 header 黑名单 */
  blacklist?: string[];
  /** 需要设置/替换的 headers */
  overrides?: Record<string, string>;
  /** 是否保留原始 authorization（默认 false） */
  preserveAuthorization?: boolean;
}

/**
 * 代理请求 Header 处理器
 */
export class HeaderProcessor {
  private blacklist: Set<string>;
  private overrides: Map<string, string>;

  constructor(config: HeaderProcessorConfig = {}) {
    // 初始化黑名单（默认包含代理相关的 headers）
    const defaultBlacklist = [
      'x-forwarded-for',
      'x-forwarded-host', 
      'x-forwarded-port',
      'x-forwarded-proto',
    ];
    
    // 如果不保留 authorization，添加到黑名单
    if (!config.preserveAuthorization) {
      defaultBlacklist.push('authorization');
    }
    
    this.blacklist = new Set(
      [...defaultBlacklist, ...(config.blacklist || [])].map(h => h.toLowerCase())
    );

    // 初始化覆盖规则
    this.overrides = new Map(
      Object.entries(config.overrides || {}).map(([k, v]) => [k.toLowerCase(), v])
    );
  }

  /**
   * 处理 Headers 对象
   */
  process(headers: Headers): Headers {
    const processed = new Headers();

    // 第一步：根据黑名单过滤，默认全部透传
    headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      
      // 检查黑名单
      if (this.blacklist.has(lowerKey)) {
        return; // 跳过黑名单 header
      }
      
      // 保留这个 header
      processed.set(key, value);
    });

    // 第二步：应用覆盖规则
    this.overrides.forEach((value, key) => {
      processed.set(key, value);
    });

    return processed;
  }

  /**
   * 从 baseUrl 提取 host
   */
  static extractHost(baseUrl: string): string {
    try {
      const url = new URL(baseUrl);
      return url.host;
    } catch (error) {
      console.error("提取 host 失败:", error);
      const match = baseUrl.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : 'localhost';
    }
  }

  /**
   * 创建预配置的代理处理器
   */
  static createForProxy(config?: HeaderProcessorConfig): HeaderProcessor {
    // 默认的代理配置：删除常见的转发相关 headers
    return new HeaderProcessor({
      preserveAuthorization: false,
      ...config
    });
  }
}

