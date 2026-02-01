export const envConfig = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh',
  jwtAccessTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
  jwtRefreshTtl: Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 7),
  databaseUrl: process.env.DATABASE_URL ?? '',
};
