import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { generateTokens, verifyRefreshToken, revokeRefreshToken, hashPassword, comparePassword } from '../services/auth.service';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      res.status(400).json({ error: 'Email, password, and displayName are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      appRole: 'user',
    });

    // Generate tokens
    const tokens = await generateTokens(user._id.toString(), user.email, user.appRole);

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        appRole: user.appRole,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const tokens = await generateTokens(user._id.toString(), user.email, user.appRole);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        appRole: user.appRole,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const googleStart = (_req: Request, res: Response): void => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });
  
  res.json({ authUrl });
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code as string);
    googleClient.setCredentials(tokens);

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Failed to get user info from Google' });
      return;
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    
    if (!user) {
      user = await User.create({
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        displayName: payload.name || payload.email,
        photoUrl: payload.picture,
        appRole: 'user',
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = payload.sub;
      if (payload.picture) user.photoUrl = payload.picture;
      await user.save();
    }

    // Generate tokens
    const tokenPair = await generateTokens(user._id.toString(), user.email, user.appRole);

    // Redirect to frontend with tokens (or return JSON in development)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${tokenPair.accessToken}&refreshToken=${tokenPair.refreshToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const payload = await verifyRefreshToken(refreshToken);
    
    // Get user to ensure they still exist
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = await generateTokens(user._id.toString(), user.email, user.appRole);

    res.json(tokens);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
