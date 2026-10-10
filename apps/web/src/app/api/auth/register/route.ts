import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createSessionToken,
  hashPassword,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';
import { AuthUser } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role, travelName, skKemenag, city, province } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    const assignedRole = role === 'TRAVEL' ? 'TRAVEL' : 'CUSTOMER';
    const passwordHash = await hashPassword(password);

    let authUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      role: assignedRole,
      status: 'ACTIVE',
      ...(assignedRole === 'TRAVEL' && {
        travelName: travelName || 'Biro Travel PPIU',
        skKemenag: skKemenag || 'Dalam Proses Verifikasi',
        verificationStatus: 'UNDER_REVIEW',
      }),
    };

    // Coba simpan ke PostgreSQL via Prisma
    try {
      const createdUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          phone: phone || null,
          role: assignedRole as any,
          status: 'ACTIVE',
          ...(assignedRole === 'TRAVEL' && travelName && {
            travel: {
              create: {
                name: travelName,
                slug: travelName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                legalName: travelName,
                skKemenag: skKemenag || 'Dalam Proses',
                city: city || 'Jakarta',
                province: province || 'DKI Jakarta',
                phone: phone || '021-000000',
                email: email.toLowerCase(),
                verificationStatus: 'PENDING',
              },
            },
          }),
        },
        include: { travel: true },
      });

      authUser = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role as any,
        status: createdUser.status as any,
        travelId: createdUser.travel?.id,
        travelName: createdUser.travel?.name,
        skKemenag: createdUser.travel?.skKemenag,
        verificationStatus: createdUser.travel?.verificationStatus as any,
      };
    } catch {
      // Database offline/unreachable fallback
    }

    // Buat session token
    const token = await createSessionToken(authUser);

    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      user: authUser,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Error saat register:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal melakukan pendaftaran akun' },
      { status: 500 }
    );
  }
}
