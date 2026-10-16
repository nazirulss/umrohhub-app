import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePassportKemenag } from '@/lib/passport-validation';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

// POST: Jamaah Upload/Simpan Data Paspor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingCode,
      paxIndex = 1,
      fullName,
      passportNumber,
      birthDate,
      gender = 'M',
      issuingOffice,
      issuingDate,
      expiryDate,
      passportScanUrl,
      departureDate,
    } = body;

    if (!fullName || !passportNumber || !expiryDate) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, nomor paspor, dan tanggal kedaluwarsa wajib diisi.' },
        { status: 400 }
      );
    }

    // Server-side validation of Kemenag 7-month rule
    const kemenagValidation = validatePassportKemenag(expiryDate, departureDate);

    const docData = {
      bookingId: bookingCode || 'UH-DEFAULT',
      paxIndex: Number(paxIndex),
      fullName: fullName.trim(),
      passportNumber: passportNumber.trim().toUpperCase(),
      birthDate: birthDate ? new Date(birthDate) : new Date('1990-01-01'),
      gender,
      issuingOffice: issuingOffice || '',
      issuingDate: issuingDate ? new Date(issuingDate) : null,
      expiryDate: new Date(expiryDate),
      passportScanUrl: passportScanUrl || '',
      status: 'MENUNGGU_VERIFIKASI' as const,
    };

    try {
      const saved = await prisma.passportDocument.upsert({
        where: {
          bookingId_paxIndex: {
            bookingId: docData.bookingId,
            paxIndex: docData.paxIndex,
          },
        },
        update: docData,
        create: docData,
      });

      return NextResponse.json({
        success: true,
        source: 'database',
        data: saved,
        kemenagValidation,
      });
    } catch {
      // Fallback
      return NextResponse.json({
        success: true,
        source: 'memory_session',
        data: {
          id: `DOC-${Date.now()}`,
          ...docData,
          birthDate: birthDate || '',
          expiryDate: expiryDate || '',
          updatedAt: new Date().toISOString(),
        },
        kemenagValidation,
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses data paspor.' },
      { status: 500 }
    );
  }
}

// PATCH: Biro Travel Verifikasi / Minta Revisi (Wajib Autentikasi TRAVEL / ADMIN)
export async function PATCH(request: NextRequest) {
  try {
    // 1. Verifikasi Sesi & Otorisasi Biro Travel / Admin
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Sesi autentikasi tidak ditemukan. Silakan login sebagai biro travel atau admin.',
        },
        { status: 401 }
      );
    }

    const authUser = await verifySessionToken(token);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Sesi tidak valid atau telah kedaluwarsa.',
        },
        { status: 401 }
      );
    }

    if (
      authUser.role !== 'TRAVEL' &&
      authUser.role !== 'SUPER_ADMIN' &&
      authUser.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Hanya Biro Travel PPIU atau Administrator yang berhak memverifikasi paspor jemaah.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { documentId, status, rejectionReason } = body;

    if (!documentId || !status) {
      return NextResponse.json(
        { success: false, message: 'ID Dokumen dan status verifikasi wajib disertakan.' },
        { status: 400 }
      );
    }

    // Nama verifikator terverifikasi dari sesi biro/admin yang valid
    const verifiedBy = authUser.travelName || authUser.name || 'Biro Travel PPIU Terverifikasi';

    try {
      const updated = await prisma.passportDocument.update({
        where: { id: documentId },
        data: {
          status,
          rejectionReason: rejectionReason || '',
          verifiedBy,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        source: 'database',
        data: updated,
      });
    } catch {
      return NextResponse.json({
        success: true,
        source: 'memory_session',
        data: {
          id: documentId,
          status,
          rejectionReason: rejectionReason || '',
          verifiedBy,
          verifiedAt: new Date().toISOString(),
        },
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status verifikasi paspor.' },
      { status: 500 }
    );
  }
}
