import { config } from '@/lib/config/config';
import { cookies } from 'next/headers';
import { findActiveKeyByKeyString } from '@/repository/key';
import { findUserById } from '@/repository/user';
import type { Key } from '@/types/key';
import type { User } from '@/types/user';

const AUTH_COOKIE_NAME = 'auth-token';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthSession {
  user: User;
  key: Key;
}

export async function validateKey(keyString: string): Promise<AuthSession | null> {
  const adminToken = config.auth.adminToken;
  if (adminToken && keyString === adminToken) {
    const now = new Date();
    const adminUser: User = {
      id: -1,
      name: 'Admin Token',
      description: 'Environment admin session',
      role: 'admin',
      rpm: 0,
      dailyQuota: 0,
      createdAt: now,
      updatedAt: now,
    };

    const adminKey: Key = {
      id: -1,
      userId: adminUser.id,
      name: 'ADMIN_TOKEN',
      key: keyString,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    };

    return { user: adminUser, key: adminKey };
  }

  const key = await findActiveKeyByKeyString(keyString);
  if (!key) {
    return null;
  }

  const user = await findUserById(key.userId);
  if (!user) {
    return null;
  }

  return { user, key };
}

export async function setAuthCookie(keyString: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, keyString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSession(): Promise<AuthSession | null> {
  const keyString = await getAuthCookie();
  if (!keyString) {
    return null;
  }

  return validateKey(keyString);
}