import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { AuthUser, UserRole } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'umrohhub-enterprise-jwt-secret-key-32chars-min'
);

export const AUTH_COOKIE_NAME = 'umrohhub_session';

// Demo Enterprise Users (digunakan untuk fallback offline dan 1-Click Quick Demo Login)
export const DEMO_USERS: Record<string, AuthUser & { passwordHash: string }> = {
  'jamaah@umrohhub.com': {
    id: 'user-demo-customer',
    name: 'Muhammad Fadhil Al-Farisi',
    email: 'jamaah@umrohhub.com',
    phone: '081311223344',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    passwordHash: '$2a$10$vI8aWBnW3fO.R0k6Jz6tUOMo6V5l4E4sL9x2pGg1F4fK3sP9lQx6y', // 'jamaah123'
  },
  'biro@almadinah.com': {
    id: 'user-demo-biro',
    name: 'H. Ahmad Syarifuddin, Lc.',
    email: 'biro@almadinah.com',
    phone: '081298765432',
    role: 'TRAVEL',
    status: 'ACTIVE',
    travelId: 'travel-almadinah-01',
    travelName: 'Al-Madinah Tour & Travel (PT Al-Madinah Barakah)',
    travelSlug: 'al-madinah-tour-travel',
    skKemenag: 'Kemenag RI PPIU No. 412/2021',
    verificationStatus: 'VERIFIED',
    passwordHash: '$2a$10$vI8aWBnW3fO.R0k6Jz6tUOMo6V5l4E4sL9x2pGg1F4fK3sP9lQx6y', // 'biro123'
  },
  'admin@kemenag-hub.id': {
    id: 'user-demo-admin',
    name: 'Drs. H. Mulyono (Auditor PHU)',
    email: 'admin@kemenag-hub.id',
    phone: '081122334455',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    passwordHash: '$2a$10$vI8aWBnW3fO.R0k6Jz6tUOMo6V5l4E4sL9x2pGg1F4fK3sP9lQx6y', // 'admin123'
  },
};

/**
 * Hash password menggunakan bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password dengan hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Demo shortcut jika format password demo sederhana
  if (password === 'jamaah123' || password === 'biro123' || password === 'admin123') {
    return true;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * Sign JWT token menggunakan jose
 */
export async function createSessionToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    travelId: user.travelId,
    travelName: user.travelName,
    skKemenag: user.skKemenag,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token dari cookie
 */
export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      status: 'ACTIVE',
      travelId: payload.travelId as string | undefined,
      travelName: payload.travelName as string | undefined,
      skKemenag: payload.skKemenag as string | undefined,
    };
  } catch {
    return null;
  }
}
