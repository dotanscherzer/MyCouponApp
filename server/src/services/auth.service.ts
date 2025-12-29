import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtConfig } from '../config/jwt.config';
import { RefreshToken, IRefreshToken } from '../models/RefreshToken.model';
import { Types } from 'mongoose';
import { hashToken } from '../utils/token.utils';

export interface TokenPayload {
  userId: string;
  email: string;
  appRole: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function generateTokens(userId: string, email: string, appRole: string): Promise<TokenPair> {
  const payload: TokenPayload = { userId, email, appRole };

  const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  // Calculate expiry date for refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Save refresh token to database
  const tokenHash = await hashToken(refreshToken);
  await RefreshToken.create({
    userId: new Types.ObjectId(userId),
    tokenHash,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, jwtConfig.accessSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const payload = jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
    
    // Check if token exists in database and is not revoked
    const tokenHash = await hashToken(token);
    const storedToken = await RefreshToken.findOne({
      tokenHash,
      userId: payload.userId,
      expiresAt: { $gt: new Date() },
      revokedAt: { $exists: false },
    });

    if (!storedToken) {
      throw new Error('Refresh token not found or revoked');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = await hashToken(token);
  await RefreshToken.updateOne(
    { tokenHash },
    { revokedAt: new Date() }
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
