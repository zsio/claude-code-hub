import { validateApiKeyAndGetUser } from "@/repository/key";
import { ProxyLogger } from "./logger";
import { ProxyResponses } from "./responses";
import type { ProxySession, AuthState } from "./session";

export class ProxyAuthenticator {
  static async ensure(session: ProxySession): Promise<Response | null> {
    const authHeader = session.headers.get("authorization") ?? undefined;
    const apiKeyHeader = session.headers.get("x-api-key") ?? undefined;
    const authState = await ProxyAuthenticator.validate({ authHeader, apiKeyHeader });
    session.setAuthState(authState);

    if (authState.success) {
      return null;
    }

    await ProxyLogger.logFailure(session, new Error("Authorization failed"));
    return ProxyResponses.buildError(401, "令牌已过期或验证不正确");
  }

  private static async validate(headers: {
    authHeader?: string;
    apiKeyHeader?: string;
  }): Promise<AuthState> {
    const bearerKey = ProxyAuthenticator.extractKeyFromAuthorization(headers.authHeader);
    const apiKeyHeader = ProxyAuthenticator.normalizeKey(headers.apiKeyHeader);

    const providedKeys = [bearerKey, apiKeyHeader].filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );

    if (providedKeys.length === 0) {
      return { user: null, apiKey: null, success: false };
    }

    const [firstKey] = providedKeys;
    const hasMismatch = providedKeys.some((key) => key !== firstKey);

    if (hasMismatch) {
      return { user: null, apiKey: null, success: false };
    }

    const apiKey = firstKey;
    const authResult = await validateApiKeyAndGetUser(apiKey);

    if (!authResult) {
      return { user: null, apiKey, success: false };
    }

    return { user: authResult.user, apiKey, success: true };
  }

  private static extractKeyFromAuthorization(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const trimmed = authHeader.trim();
    if (!trimmed) {
      return null;
    }

    const match = /^Bearer\s+(.+)$/i.exec(trimmed);
    if (!match) {
      return null;
    }

    return match[1]?.trim() ?? null;
  }

  private static normalizeKey(value?: string): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
