import type { Provider } from "@/types/provider";
import { findProviderList, findProviderById } from "@/repository/provider";
import { findLatestMessageRequestByKey } from "@/repository/message";
import { ProxyLogger } from "./logger";
import { ProxyResponses } from "./responses";
import type { ProxySession } from "./session";

export class ProxyProviderResolver {
  static async ensure(session: ProxySession): Promise<Response | null> {
    session.setProvider(await ProxyProviderResolver.findReusable(session));

    if (!session.provider) {
      session.setProvider(await ProxyProviderResolver.pickRandomProvider());
    }

    if (session.provider) {
      return null;
    }

    const status = 503;
    const message = "暂无可用的上游服务";
    console.error("No available providers");
    await ProxyLogger.logFailure(session, new Error(message));
    return ProxyResponses.buildError(status, message);
  }

  private static async findReusable(session: ProxySession): Promise<Provider | null> {
    if (!session.shouldReuseProvider()) {
      return null;
    }

    const apiKey = session.authState?.apiKey;
    if (!apiKey) {
      return null;
    }

    const latestRequest = await findLatestMessageRequestByKey(apiKey);
    if (!latestRequest?.providerId) {
      return null;
    }

    const provider = await findProviderById(latestRequest.providerId);
    if (!provider || !provider.isEnabled) {
      return null;
    }

    return provider;
  }

  private static async pickRandomProvider(): Promise<Provider | null> {
    const providers = await findProviderList();
    const enabledProviders = providers.filter((provider) => provider.isEnabled);

    if (enabledProviders.length === 0) {
      return null;
    }

    if (enabledProviders.length === 1) {
      return enabledProviders[0];
    }

    const totalWeight = enabledProviders.reduce((sum, provider) => sum + provider.weight, 0);

    if (totalWeight === 0) {
      const randomIndex = Math.floor(Math.random() * enabledProviders.length);
      return enabledProviders[randomIndex];
    }

    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const provider of enabledProviders) {
      cumulativeWeight += provider.weight;
      if (random < cumulativeWeight) {
        return provider;
      }
    }

    return enabledProviders[enabledProviders.length - 1];
  }
}
