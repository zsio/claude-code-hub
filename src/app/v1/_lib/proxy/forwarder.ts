import { HeaderProcessor } from "../headers";
import { buildProxyUrl } from "../url";
import type { ProxySession } from "./session";

export class ProxyForwarder {
  static async send(session: ProxySession): Promise<Response> {
    if (!session.provider || !session.authState) {
      throw new Error("代理上下文缺少供应商或鉴权信息");
    }

    const processedHeaders = ProxyForwarder.buildHeaders(session);
    const proxyUrl = buildProxyUrl(session.provider.url, session.requestUrl);

    const hasBody = session.method !== "GET" && session.method !== "HEAD";
    const init: RequestInit = {
      method: session.method,
      headers: processedHeaders,
      ...(hasBody && session.request.buffer ? { body: session.request.buffer } : {})
    };

    (init as Record<string, unknown>).verbose = true;

    return await fetch(proxyUrl, init);
  }

  private static buildHeaders(session: ProxySession): Headers {
    const authState = session.authState;
    const provider = session.provider;

    if (!authState || !provider) {
      return new Headers(session.headers);
    }

    const outboundKey = authState.success ? provider.key : "000";
    const headerProcessor = HeaderProcessor.createForProxy({
      blacklist: [],
      overrides: {
        "host": HeaderProcessor.extractHost(provider.url),
        "authorization": `Bearer ${outboundKey}`,
        "x-api-key": outboundKey
      }
    });

    return headerProcessor.process(session.headers);
  }
}
