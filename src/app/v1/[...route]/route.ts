import { Hono } from "hono";
import { handle } from "hono/vercel";
import { handleProxyRequest } from "@/app/v1/_lib/proxy-handler";

export const runtime = "nodejs";

const app = new Hono().basePath("/v1");

// 所有请求都通过代理处理器处理
app.all("*", handleProxyRequest);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
