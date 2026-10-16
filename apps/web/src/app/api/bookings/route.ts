import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageId,
      departureId,
      customerName,
      customerPhone,
      customerEmail,
      pilgrimCount = 1,
      roomType = 'Quad',
      unitPrice = 28500000,
      affiliateCode: _affiliateCode,
    } = body;
    void _affiliateCode;

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, message: 'Nama pemesan dan nomor telepon wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah user sedang login untuk menautkan userId
    let authenticatedUserId: string | undefined = undefined;
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const authUser = await verifySessionToken(token);
      if (authUser) {
        authenticatedUserId = authUser.id;
      }
    }

    // Generate unique human-readable booking code: UH-YYYYMMDD-RANDOM
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingCode = `UH-${dateStr}-${randStr}`;

    const totalAmount = unitPrice * pilgrimCount;

    try {
      // Create transactional booking in database if available
      const booking = await prisma.$transaction(async (tx) => {
        // 1. Ambil data departure dan package untuk validasi relasi & kuota
        let dep = null;
        if (departureId) {
          dep = await tx.departure.findUnique({
            where: { id: departureId },
            include: { package: true },
          });
        }

        let pkg = null;
        if (packageId) {
          pkg = await tx.package.findUnique({
            where: { id: packageId },
          });
        }

        // Concurrency check on departure seats quota
        if (dep && dep.quotaTotal - dep.quotaTaken < pilgrimCount) {
          throw new Error('Sisa kuota penerbangan tidak mencukupi untuk jumlah jamaah yang dipesan.');
        }

        // Hubungkan travelId secara dinamis dari relasi package atau departure
        const resolvedTravelId = dep?.package?.travelId || pkg?.travelId;
        if (!resolvedTravelId && process.env.NODE_ENV === 'production') {
          throw new Error('Paket umroh atau biro travel tidak ditemukan dalam sistem.');
        }

        const finalTravelId = resolvedTravelId || 'TRV_001';
        const resolvedPackageId = packageId || dep?.packageId || 'PKG_001';
        const resolvedDepartureId = departureId || (dep ? dep.id : 'DEP_101');

        // 2. Create Booking
        const b = await tx.booking.create({
          data: {
            bookingCode,
            travelId: finalTravelId,
            packageId: resolvedPackageId,
            departureId: resolvedDepartureId,
            ...(authenticatedUserId ? { userId: authenticatedUserId } : {}),
            customerName,
            customerPhone,
            customerEmail: customerEmail || '',
            pilgrimCount,
            roomType,
            unitPrice,
            totalAmount,
            status: 'CONFIRMED',
            paymentStatus: 'UNPAID',
          },
        });

        // 3. Decrement quota
        if (dep) {
          await tx.departure.update({
            where: { id: departureId },
            data: { quotaTaken: { increment: pilgrimCount } },
          });
        }

        return b;
      });

      return NextResponse.json({
        success: true,
        source: 'database',
        data: booking,
      });
    } catch (dbErr: unknown) {
      const errMsg = dbErr instanceof Error ? dbErr.message : '';
      if (errMsg.includes('kuota') || errMsg.includes('tidak ditemukan')) {
        return NextResponse.json({ success: false, message: errMsg }, { status: 400 });
      }

      // Matikan fallback memory_session di production agar sistem tidak menghasilkan transaksi palsu saat DB offline
      if (process.env.NODE_ENV === 'production') {
        console.error('Database connection error during booking in production:', dbErr);
        return NextResponse.json(
          {
            success: false,
            message: 'Sistem basis data sedang tidak dapat diakses. Transaksi pemesanan belum tercatat. Silakan coba kembali beberapa saat lagi.',
          },
          { status: 503 }
        );
      }

      // Mode development offline fallback untuk demonstrasi lokal
      return NextResponse.json({
        success: true,
        source: 'memory_session',
        data: {
          id: `BKG-${Date.now()}`,
          bookingCode,
          customerName,
          customerPhone,
          customerEmail,
          pilgrimCount,
          roomType,
          unitPrice,
          totalAmount,
          status: 'CONFIRMED',
          paymentStatus: 'UNPAID',
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pemesanan tiket umroh.' },
      { status: 500 }
    );
  }
}
