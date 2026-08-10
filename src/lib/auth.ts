import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { supabase } from './supabase';
import { IAccount } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_shoes_store_key_2026';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hashed: string): boolean {
  return bcrypt.compareSync(password, hashed);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<IAccount | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const { data: user, error } = await supabase
      .from('accounts')
      .select('id, username, role, active, fullname, phone, email, address')
      .eq('id', payload.userId)
      .single();

    if (error || !user) return null;
    return user as IAccount;
  } catch (error) {
    return null;
  }
}
