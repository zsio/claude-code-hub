import type { ParsedSSEEvent } from "@/types/message";

/**
 * 解析 SSE 流数据为结构化事件数组
 */
export function parseSSEData(sseText: string): ParsedSSEEvent[] {
  const events: ParsedSSEEvent[] = [];

  let eventName = "";
  let dataLines: string[] = [];

  const flushEvent = () => {
    if (!eventName || dataLines.length === 0) {
      eventName = "";
      dataLines = [];
      return;
    }

    const dataStr = dataLines.join("\n");

    try {
      const data = JSON.parse(dataStr);
      events.push({ event: eventName, data });
    } catch {
      events.push({ event: eventName, data: dataStr });
    }

    eventName = "";
    dataLines = [];
  };

  const lines = sseText.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line) {
      flushEvent();
      continue;
    }

    if (line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      eventName = line.substring(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      let value = line.substring(5);
      if (value.startsWith(" ")) {
        value = value.slice(1);
      }
      dataLines.push(value);
    }
  }

  flushEvent();

  return events;
}
