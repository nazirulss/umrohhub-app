import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createSessionToken,
  verifyPassword,
  AUTH_COOKIE_NAME,
  DEMO_USERS,
} from '@/lib/auth';
import { AuthUser, UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, roleHint } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    let authUser: AuthUser | null = null;

    // 1. Coba verifikasi via database PostgreSQL
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { travel: true },
      });

      if (dbUser) {
        const isPasswordValid = await verifyPassword(password, dbUser.passwordHash);

        if (isPasswordValid) {
          authUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            role: dbUser.role as UserRole,
            status: dbUser.status as AuthUser['status'],
            travelId: dbUser.travel?.id,
            travelName: dbUser.travel?.name,
            travelSlug: dbUser.travel?.slug,
            skKemenag: dbUser.travel?.skKemenag,
            verificationStatus: (dbUser.travel?.verificationStatus ?? undefined) as AuthUser['verificationStatus'],
          };
        }
      }
    } catch {
      // Database offline/unreachable fallback
    }

    // 2. Fallback ke DEMO_USERS jika belum ditemukan di DB (HANYA AKTIF DI NON-PRODUCTION)
    if (!authUser && process.env.NODE_ENV !== 'production') {
      const demoUser = DEMO_USERS[email.toLowerCase()];
      if (demoUser) {
        const isDemoPasswordValid = await verifyPassword(password, demoUser.passwordHash);
        if (isDemoPasswordValid) {
          authUser = {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            phone: demoUser.phone,
            role: demoUser.role,
            status: demoUser.status,
            travelId: demoUser.travelId,
            travelName: demoUser.travelName,
            travelSlug: demoUser.travelSlug,
            skKemenag: demoUser.skKemenag,
            verificationStatus: demoUser.verificationStatus,
          };
        }
      } else if (roleHint) {
        // Fallback dinamis lokal untuk testing cepat dengan roleHint di dev
        authUser = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email: email.toLowerCase(),
          role: roleHint,
          status: 'ACTIVE',
          ...(roleHint === 'TRAVEL' && {
            travelName: 'Biro Travel PPIU',
            skKemenag: 'Kemenag RI PPIU No. 412/2021',
            verificationStatus: 'VERIFIED',
          }),
        };
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Email atau password tidak sesuai' },
        { status: 401 }
      );
    }

    // 3. Buat signed JWT session token
    const token = await createSessionToken(authUser);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: authUser,
    });

    // 4. Set HTTP-Only Cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error: unknown) {
    console.error('Error saat login:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat login' },
      { status: 500 }
    );
  }
}
