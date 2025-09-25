import type { Context } from "hono";
import type { Provider } from "@/types/provider";
import type { User } from "@/types/user";

export interface AuthState {
  user: User | null;
  apiKey: string | null;
  success: boolean;
}

export interface MessageContext {
  id: number;
  user: User;
  apiKey: string;
}

export interface ProxyRequestPayload {
  message: Record<string, unknown>;
  buffer?: ArrayBuffer;
  log: string;
  note?: string;
  model: string | null;
}

interface RequestBodyResult {
  requestMessage: Record<string, unknown>;
  requestBodyLog: string;
  requestBodyLogNote?: string;
  requestBodyBuffer?: ArrayBuffer;
}

export class ProxySession {
  readonly startTime: number;
  readonly method: string;
  readonly requestUrl: URL;
  readonly headers: Headers;
  readonly headerLog: string;
  readonly request: ProxyRequestPayload;
  userName: string;
  authState: AuthState | null;
  provider: Provider | null;
  messageContext: MessageContext | null;

  private constructor(init: {
    startTime: number;
    method: string;
    requestUrl: URL;
    headers: Headers;
    headerLog: string;
    request: ProxyRequestPayload;
  }) {
    this.startTime = init.startTime;
    this.method = init.method;
    this.requestUrl = init.requestUrl;
    this.headers = init.headers;
    this.headerLog = init.headerLog;
    this.request = init.request;
    this.userName = "unknown";
    this.authState = null;
    this.provider = null;
    this.messageContext = null;
  }

  static async fromContext(c: Context): Promise<ProxySession> {
    const startTime = Date.now();
    const method = c.req.method.toUpperCase();
    const requestUrl = new URL(c.req.url);
    const headers = new Headers(c.req.header());
    const headerLog = formatHeadersForLog(headers);
    const bodyResult = await parseRequestBody(c);

    const request: ProxyRequestPayload = {
      message: bodyResult.requestMessage,
      buffer: bodyResult.requestBodyBuffer,
      log: bodyResult.requestBodyLog,
      note: bodyResult.requestBodyLogNote,
      model: typeof bodyResult.requestMessage.model === "string" ? bodyResult.requestMessage.model : null
    };

    return new ProxySession({ startTime, method, requestUrl, headers, headerLog, request });
  }

  setAuthState(state: AuthState): void {
    this.authState = state;
    if (state.user) {
      this.userName = state.user.name;
    }
  }

  setProvider(provider: Provider | null): void {
    this.provider = provider;
  }

  setMessageContext(context: MessageContext | null): void {
    this.messageContext = context;
    if (context?.user) {
      this.userName = context.user.name;
    }
  }

  shouldReuseProvider(): boolean {
    const messages = (this.request.message as Record<string, unknown>).messages;
    return Array.isArray(messages) && messages.length > 1;
  }
}

function formatHeadersForLog(headers: Headers): string {
  const collected: string[] = [];
  headers.forEach((value, key) => {
    collected.push(`${key}: ${value}`);
  });

  return collected.length > 0 ? collected.join("\n") : "(empty)";
}

function optimizeRequestMessage(message: Record<string, unknown>): Record<string, unknown> {
  const optimized = { ...message };

  if (Array.isArray(optimized.system)) {
    optimized.system = new Array(optimized.system.length).fill(0);
  }
  if (Array.isArray(optimized.messages)) {
    optimized.messages = new Array(optimized.messages.length).fill(0);
  }
  if (Array.isArray(optimized.tools)) {
    optimized.tools = new Array(optimized.tools.length).fill(0);
  }

  return optimized;
}

async function parseRequestBody(c: Context): Promise<RequestBodyResult> {
  const method = c.req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  if (!hasBody) {
    return { requestMessage: {}, requestBodyLog: "(empty)" };
  }

  const requestBodyBuffer = await c.req.raw.clone().arrayBuffer();
  const requestBodyText = new TextDecoder().decode(requestBodyBuffer);

  let requestMessage: Record<string, unknown> = {};
  let requestBodyLog: string;
  let requestBodyLogNote: string | undefined;

  try {
    const parsedMessage = JSON.parse(requestBodyText) as Record<string, unknown>;
    requestMessage = optimizeRequestMessage(parsedMessage);
    requestBodyLog = JSON.stringify(parsedMessage, null, 2);
  } catch {
    requestMessage = { raw: requestBodyText };
    requestBodyLog = requestBodyText;
    requestBodyLogNote = "请求体不是合法 JSON，已记录原始文本。";
  }

  return {
    requestMessage,
    requestBodyLog,
    requestBodyLogNote,
    requestBodyBuffer
  };
}
