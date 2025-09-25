import { updateMessageRequestDuration } from "@/repository/message";
import { ProxyLogger } from "./logger";
import { ProxyResponses } from "./responses";
import type { ProxySession } from "./session";

export class ProxyErrorHandler {
  static async handle(session: ProxySession, error: unknown): Promise<Response> {
    if (session.messageContext) {
      const duration = Date.now() - session.startTime;
      await updateMessageRequestDuration(session.messageContext.id, duration);
    }

    await ProxyLogger.logFailure(session, error);

    const fallbackMessage = error instanceof Error ? error.message : "代理请求发生未知错误";
    return ProxyResponses.buildError(500, fallbackMessage);
  }
}
