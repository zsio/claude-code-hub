import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { isDevelopment } from "@/lib/config/env.schema";
import type { Provider } from "@/types/provider";
import type { ProxySession } from "./session";

export class ProxyLogger {
  static async logNonStream(session: ProxySession, provider: Provider, responseBody: string): Promise<void> {
    if (!isDevelopment()) {
      return;
    }

    const timestamp = new Date();
    const fileName = ProxyLogger.buildFileName(timestamp, "nonstream");
    const outDir = join(process.cwd(), "out", "api");
    const filePath = join(outDir, fileName);

    const requestLogHeader = session.request.note ? `${session.request.note}\n` : "";
    const requestLogBody = session.request.log || "(empty)";
    const logContent = `=== Non-Stream API Call ${fileName} ===\n` +
      `User: ${session.userName}\n` +
      `Provider: ${provider.name} (${provider.url})\n` +
      `Timestamp: ${timestamp.toISOString()}\n\n` +
      "=== Request Headers ===\n" +
      `${session.headerLog}\n\n` +
      "=== Request Body ===\n" +
      `${requestLogHeader}${requestLogBody}\n\n` +
      "=== Response Body ===\n" +
      `${responseBody}\n\n` +
      "=== End ===\n";

    try {
      await mkdir(outDir, { recursive: true });
      await writeFile(filePath, logContent, "utf-8");
      console.log(`[${session.userName}] Non-stream API response saved to: out/api/${fileName}`);
    } catch (error) {
      console.error("Failed to save non-stream log file:", error);
    }
  }

  static async logFailure(session: ProxySession, error: unknown): Promise<void> {
    if (!isDevelopment()) {
      return;
    }

    const timestamp = new Date();
    const fileName = ProxyLogger.buildFileName(timestamp, "failure");
    const outDir = join(process.cwd(), "out", "failures");
    const filePath = join(outDir, fileName);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error && error.stack ? error.stack : "(no stack available)";
    const providerDisplay = session.provider
      ? `${session.provider.name}${session.provider.url ? ` (${session.provider.url})` : ""}`
      : "unavailable";
    const requestLogHeader = session.request.note ? `${session.request.note}\n` : "";
    const logContent = `=== Proxy Failure ${fileName} ===\n` +
      `Timestamp: ${timestamp.toISOString()}\n` +
      `Request: ${session.method} ${session.requestUrl.toString()}\n` +
      `User: ${session.userName}\n` +
      `Provider: ${providerDisplay}\n\n` +
      `Error Message: ${errorMessage}\n` +
      `Error Stack:\n${errorStack}\n\n` +
      "=== Request Headers ===\n" +
      `${session.headerLog}\n\n` +
      "=== Request Body ===\n" +
      `${requestLogHeader}${session.request.log || "(empty)"}\n\n` +
      "=== End ===\n";

    try {
      await mkdir(outDir, { recursive: true });
      await writeFile(filePath, logContent, "utf-8");
      console.log(`[${session.userName}] Proxy failure saved to: out/failures/${fileName}`);
    } catch (loggingError) {
      console.error("Failed to save failure log file:", loggingError);
    }
  }

  private static buildFileName(timestamp: Date, suffix: "nonstream" | "failure"): string {
    const dateStr = String(timestamp.getMonth() + 1).padStart(2, "0") + "-" + String(timestamp.getDate()).padStart(2, "0");
    const timeStr = [timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds()]
      .map((value) => String(value).padStart(2, "0"))
      .join("-");
    return `${dateStr}_${timeStr}_${suffix}.txt`;
  }
}
