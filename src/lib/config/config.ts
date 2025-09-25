import { getEnvConfig } from './env.schema';

/**
 * 简化的配置访问
 */
const env = getEnvConfig();

export const config = {
  auth: {
    adminToken: env.ADMIN_TOKEN,
  },
};
