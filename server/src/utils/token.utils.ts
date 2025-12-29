import bcrypt from 'bcrypt';

export async function hashToken(token: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(token, saltRounds);
}
