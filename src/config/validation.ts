export function validateConfig(config: Record<string, any>) {
  const required = [
    'MONGODB_URI',
    'MONGODB_NAME',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USERNAME',
    'MAIL_PWD',
  ];

  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return config;
}
