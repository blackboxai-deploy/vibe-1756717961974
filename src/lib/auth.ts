import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import type { User } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  (typeof process !== 'undefined' ? process.env.JWT_SECRET : '') || 'default-secret-key'
);

const ENCRYPTION_KEY = (typeof process !== 'undefined' ? process.env.ENCRYPTION_KEY : '') || 'default-encryption-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  exp?: number;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export async function signToken(payload: TokenPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new Error('Failed to sign token');
  }
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}

// Encryption utilities for sensitive data
export function encrypt(text: string): string {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Session management
export function extractTokenFromRequest(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies.token || null;
  }
  
  return null;
}

// User session utilities
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// In-memory user storage (replace with database in production)
const users: Map<string, User & { password: string }> = new Map();
const sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

// Initialize with demo admin user
async function initializeUsers() {
  if (users.size === 0) {
    const adminPassword = await hashPassword('admin123!');
    const adminUser: User & { password: string } = {
      id: '1',
      email: 'admin@cloudpro.dev',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: adminPassword,
      profile: {
        company: 'CloudPro Demo',
        timezone: 'UTC',
        notificationPreferences: {
          email: true,
          sms: false,
          billing: true,
          maintenance: true,
          security: true
        }
      }
    };
    users.set(adminUser.id, adminUser);
    
    // Add demo user
    const userPassword = await hashPassword('user123!');
    const demoUser: User & { password: string } = {
      id: '2',
      email: 'user@demo.com',
      name: 'Demo User',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: userPassword,
      profile: {
        company: 'Demo Company',
        timezone: 'UTC',
        notificationPreferences: {
          email: true,
          sms: false,
          billing: true,
          maintenance: false,
          security: true
        }
      }
    };
    users.set(demoUser.id, demoUser);
  }
}

// Initialize users on module load
initializeUsers();

// Authentication functions
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    // Find user by email
    const foundUser = Array.from(users.values()).find(u => u.email === email);
    
    if (!foundUser) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, foundUser.password);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Generate token
    const tokenPayload: TokenPayload = {
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    };
    
    const token = await signToken(tokenPayload);
    
    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    sessions.set(sessionId, { userId: foundUser.id, expiresAt });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = foundUser;
    
    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    // Validate input
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors.join(', ') };
    }
    
    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }
    
    // Create new user
    const hashedPassword = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: User & { password: string } = {
      id: userId,
      email,
      name,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword,
      profile: {
        notificationPreferences: {
          email: true,
          sms: false,
          billing: true,
          maintenance: false,
          security: true
        }
      }
    };
    
    users.set(userId, newUser);
    
    // Generate token
    const tokenPayload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    };
    
    const token = await signToken(tokenPayload);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = users.get(userId);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserByToken(token: string): Promise<User | null> {
  try {
    const payload = await verifyToken(token);
    if (!payload) return null;
    
    return await getUserById(payload.userId);
  } catch (error) {
    console.error('Error getting user by token:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const updatedUser = {
      ...user,
      ...updates,
      id: userId, // Ensure ID cannot be changed
      updatedAt: new Date()
    };
    
    users.set(userId, updatedUser);
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

// Session cleanup (run periodically)
export function cleanupExpiredSessions(): void {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

// Run session cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}