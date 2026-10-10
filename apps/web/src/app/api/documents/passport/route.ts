import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePassportKemenag } from '@/lib/passport-validation';

// POST: Jamaah Upload/Simpan Data Paspor
export async function POST(request: Request) {
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
    } catch (dbErr) {
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
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses data paspor.' },
      { status: 500 }
    );
  }
}

// PATCH: Biro Travel Verifikasi / Minta Revisi
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { documentId, status, rejectionReason, verifiedBy = 'Biro Travel PPIU' } = body;

    if (!documentId || !status) {
      return NextResponse.json(
        { success: false, message: 'ID Dokumen dan status verifikasi wajib disertakan.' },
        { status: 400 }
      );
    }

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
    } catch (dbErr) {
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
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status verifikasi paspor.' },
      { status: 500 }
    );
  }
}
