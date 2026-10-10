import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_PACKAGES } from '@/data/mock-packages';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const pkg = await prisma.package.findUnique({
      where: { slug },
      include: {
        travel: true,
        departures: true,
        reviews: true,
      },
    });

    if (pkg) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: pkg,
      });
    }
  } catch (err) {
    // Database connection fallback
  }

  const mockPkg = MOCK_PACKAGES.find((p) => p.slug === slug || p.id === slug);
  if (!mockPkg) {
    return NextResponse.json(
      { success: false, message: 'Paket umroh tidak ditemukan.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    source: 'seed_cache',
    data: mockPkg,
  });
}
