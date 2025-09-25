import type { Context } from "hono";
import { ProxySession } from "./proxy/session";
import { ProxyAuthenticator } from "./proxy/auth-guard";
import { ProxyProviderResolver } from "./proxy/provider-selector";
import { ProxyMessageService } from "./proxy/message-service";
import { ProxyForwarder } from "./proxy/forwarder";
import { ProxyResponseHandler } from "./proxy/response-handler";
import { ProxyErrorHandler } from "./proxy/error-handler";

export async function handleProxyRequest(c: Context): Promise<Response> {
  const session = await ProxySession.fromContext(c);

  try {
    const unauthorized = await ProxyAuthenticator.ensure(session);
    if (unauthorized) {
      return unauthorized;
    }

    const providerUnavailable = await ProxyProviderResolver.ensure(session);
    if (providerUnavailable) {
      return providerUnavailable;
    }

    await ProxyMessageService.ensureContext(session);

    const response = await ProxyForwarder.send(session);
    return await ProxyResponseHandler.dispatch(session, response);
  } catch (error) {
    console.error("Proxy handler error:", error);
    return await ProxyErrorHandler.handle(session, error);
  }
}
