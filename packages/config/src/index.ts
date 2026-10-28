export interface AppConfig {
  nodeEnv: string;
  port: number;
}

export function getBaseConfig(): AppConfig {
  return {
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: Number(process.env['PORT']) || 3000,
  };
}

