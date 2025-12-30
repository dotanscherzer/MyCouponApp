export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production',
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as string,
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
};

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn('Warning: JWT secrets are using default values. This is insecure for production!');
}
