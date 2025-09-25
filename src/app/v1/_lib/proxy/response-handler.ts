import { updateMessageRequestDuration, updateMessageRequestCost } from "@/repository/message";
import { findLatestPriceByModel } from "@/repository/model-price";
import { parseSSEData } from "@/lib/utils/sse";
import { calculateRequestCost } from "@/lib/utils/cost-calculation";
import type { ProxySession } from "./session";
import { ProxyLogger } from "./logger";

export type UsageMetrics = {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

export class ProxyResponseHandler {
  static async dispatch(session: ProxySession, response: Response): Promise<Response> {
    const contentType = response.headers.get("content-type") || "";
    const isSSE = contentType.includes("text/event-stream");

    if (!isSSE) {
      return ProxyResponseHandler.handleNonStream(session, response);
    }

    return await ProxyResponseHandler.handleStream(session, response);
  }

  private static handleNonStream(session: ProxySession, response: Response): Response {
    const provider = session.provider;
    if (!provider) {
      return response;
    }

    const responseForLog = response.clone();

    void (async () => {
      try {
        const responseText = await responseForLog.text();
        let responseLogContent = responseText;
        let usageRecord: Record<string, unknown> | null = null;
        let usageMetrics: UsageMetrics | null = null;

        try {
          const parsed = JSON.parse(responseText) as Record<string, unknown>;
          responseLogContent = JSON.stringify(parsed, null, 2);
          const usageValue = parsed.usage;
          if (usageValue && typeof usageValue === "object") {
            usageRecord = usageValue as Record<string, unknown>;
            usageMetrics = extractUsageMetrics(usageValue);
          }
        } catch {
          // 非 JSON 响应时保持原始日志
        }

        const messageContext = session.messageContext;
        if (usageRecord && usageMetrics && messageContext) {
          await updateRequestCostFromUsage(messageContext.id, session.request.model, usageMetrics);
        }

        if (messageContext) {
          const duration = Date.now() - session.startTime;
          await updateMessageRequestDuration(messageContext.id, duration);
        }

        await ProxyLogger.logNonStream(session, provider, responseLogContent);
      } catch (error) {
        console.error("Failed to handle non-stream log:", error);
      }
    })();

    return response;
  }

  private static async handleStream(session: ProxySession, response: Response): Promise<Response> {
    const messageContext = session.messageContext;
    const provider = session.provider;

    if (!messageContext || !provider || !response.body) {
      return response;
    }

    const [clientStream, internalStream] = response.body.tee();

    void (async () => {
      const reader = internalStream.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];
      let usageForCost: UsageMetrics | null = null;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            chunks.push(decoder.decode(value, { stream: true }));
          }
        }

        const flushed = decoder.decode();
        if (flushed) {
          chunks.push(flushed);
        }

        const allContent = chunks.join("");
        const parsedEvents = parseSSEData(allContent);

        const duration = Date.now() - session.startTime;
        await updateMessageRequestDuration(messageContext.id, duration);

        for (const event of parsedEvents) {
          if (event.event === "message_delta" && typeof event.data === "object" && event.data !== null) {
            const usageMetrics = extractUsageMetrics((event.data as Record<string, unknown>).usage);
            if (usageMetrics) {
              usageForCost = usageMetrics;
            }
          }
        }

        await updateRequestCostFromUsage(messageContext.id, session.request.model, usageForCost);
      } catch (error) {
        console.error("Failed to save SSE content:", error);
      } finally {
        reader.releaseLock();
      }
    })();

    return new Response(clientStream, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });
  }
}

function extractUsageMetrics(value: unknown): UsageMetrics | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const usage = value as Record<string, unknown>;
  const result: UsageMetrics = {};
  let hasAny = false;

  if (typeof usage.input_tokens === "number") {
    result.input_tokens = usage.input_tokens;
    hasAny = true;
  }

  if (typeof usage.output_tokens === "number") {
    result.output_tokens = usage.output_tokens;
    hasAny = true;
  }

  if (typeof usage.cache_creation_input_tokens === "number") {
    result.cache_creation_input_tokens = usage.cache_creation_input_tokens;
    hasAny = true;
  }

  if (typeof usage.cache_read_input_tokens === "number") {
    result.cache_read_input_tokens = usage.cache_read_input_tokens;
    hasAny = true;
  }

  return hasAny ? result : null;
}

async function updateRequestCostFromUsage(
  messageId: number,
  modelName: string | null,
  usage: UsageMetrics | null
): Promise<void> {
  if (!modelName || !usage) {
    return;
  }

  const priceData = await findLatestPriceByModel(modelName);
  if (priceData?.priceData) {
    const cost = calculateRequestCost(usage, priceData.priceData);
    if (cost > 0) {
      await updateMessageRequestCost(messageId, cost);
    }
  }
}
