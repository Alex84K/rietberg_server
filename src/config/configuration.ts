export interface Config {
  port: number;
  dev: boolean;
  mongodb: {
    uri: string;
    name: string;
  };
  jwt: {
    accessSecret: string;
    accessExpires: string;
    refreshSecret: string;
    refreshExpires: string;
  };
  superadmin: {
    email: string;
    password: string;
  };
}

export function configuration(): Config {
  return {
    port: parseInt(process.env.PORT || '5015', 10),
    dev: process.env.DEV === 'true',
    mongodb: {
      uri: process.env.MONGODB_URI || '',
      name: process.env.MONGODB_NAME || '',
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-dev',
      accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev',
      refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    superadmin: {
      email: process.env.SUPERADMIN_EMAIL || '',
      password: process.env.SUPERADMIN_PASSWORD || '',
    },
  };
}
