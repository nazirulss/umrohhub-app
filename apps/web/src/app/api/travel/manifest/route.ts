import { NextResponse } from 'next/server';
import { MOCK_BIRO_PASSPORTS, MOCK_DEPARTURES } from '@/data/mock-travel-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightCode = searchParams.get('flight') || '';
  const departureDate = searchParams.get('date') || '2026-10-15';
  const format = searchParams.get('format');

  let passengers = MOCK_BIRO_PASSPORTS.filter((p) => {
    if (departureDate && p.departureDate !== departureDate) return false;
    return true;
  });

  if (format === 'csv') {
    const headers = ['NO', 'TITLE', 'FULL_NAME', 'PASSPORT_NO', 'GENDER', 'DOB', 'EXPIRY_DATE', 'NATIONALITY', 'STATUS'];
    const rows = passengers.map((p, idx) => [
      idx + 1,
      p.gender === 'M' ? 'MR' : 'MRS',
      `"${p.fullName}"`,
      p.passportNumber,
      p.gender,
      p.birthDate,
      p.expiryDate,
      'IDN',
      p.status,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="FLIGHT_MANIFEST_${departureDate}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    flightCode,
    departureDate,
    totalPax: passengers.length,
    verifiedPax: passengers.filter((p) => p.status === 'TERVERIFIKASI').length,
    data: passengers,
  });
}
