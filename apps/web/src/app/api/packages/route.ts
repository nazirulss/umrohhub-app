import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_PACKAGES } from '@/data/mock-packages';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const departureCity = searchParams.get('city');
  const searchQuery = searchParams.get('q');
  const sortBy = searchParams.get('sort') || 'recommended';

  try {
    // Coba query dari database PostgreSQL jika terkoneksi
    const dbPackages = await prisma.package.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category ? { category } : {}),
        ...(departureCity ? { departureCity: { contains: departureCity } } : {}),
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        travel: true,
        departures: true,
      },
    });

    if (dbPackages && dbPackages.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: dbPackages,
      });
    }
  } catch (err) {
    // Fallback gracefully jika database belum di-connect ke PostgreSQL server
  }

  // Fallback to in-memory mock packages with filter and sort logic
  let results = [...MOCK_PACKAGES];

  if (category) {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (departureCity) {
    results = results.filter((p) => p.departureCity.toLowerCase().includes(departureCity.toLowerCase()));
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    results = results.filter((p) => p.title.toLowerCase().includes(q) || p.travelName.toLowerCase().includes(q));
  }

  if (sortBy === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'departure_asc') {
    results.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
  }

  return NextResponse.json({
    success: true,
    source: 'seed_cache',
    total: results.length,
    data: results,
  });
}
