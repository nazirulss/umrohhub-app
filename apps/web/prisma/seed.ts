import { prisma } from '../src/lib/prisma';
import { Role, TravelVerificationStatus, FlightType, PackageStatus, DepartureStatus, BookingStatus, PaymentStatus, DocumentStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Memulai seeding data enterprise UmrohHub...');

  // 1. Seed Biro Owner & Admin
  const biroOwner = await prisma.user.upsert({
    where: { email: 'direktur@almadinah.com' },
    update: {},
    create: {
      name: 'H. Ahmad Syarifuddin, Lc.',
      email: 'direktur@almadinah.com',
      passwordHash: '$2a$12$e8wF4y8w9eF9x8w.example.hashedpassword',
      phone: '081298765432',
      role: Role.TRAVEL,
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@umrohhub.com' },
    update: {},
    create: {
      name: 'Muhammad Fadhil',
      email: 'customer@umrohhub.com',
      passwordHash: '$2a$12$e8wF4y8w9eF9x8w.example.hashedpassword',
      phone: '081311223344',
      role: Role.CUSTOMER,
    },
  });

  console.log(`✅ Users seeded: ${biroOwner.name}, ${demoCustomer.name}`);

  // 2. Seed Travel Biro PPIU
  const travel = await prisma.travel.upsert({
    where: { slug: 'al-madinah-tour-travel' },
    update: {},
    create: {
      ownerUserId: biroOwner.id,
      name: 'Al-Madinah Tour & Travel',
      slug: 'al-madinah-tour-travel',
      legalName: 'PT Al-Madinah Barakah Wisata Mandiri',
      skKemenag: 'Kemenag RI PPIU No. 412/2021',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      phone: '021-78901234',
      email: 'info@almadinah.com',
      logoUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=300&q=80',
      description: 'Penyelenggara Perjalanan Ibadah Umroh (PPIU) Resmi Terdaftar di SISKOPATUH Kemenag RI dengan akreditasi A.',
      verificationStatus: TravelVerificationStatus.VERIFIED,
      rating: 4.9,
      reviewCount: 382,
    },
  });

  console.log(`✅ Travel Biro seeded: ${travel.name}`);

  // 3. Seed Packages
  const pkgReguler = await prisma.package.upsert({
    where: { slug: 'umroh-reguler-awal-musim-9-hari' },
    update: {},
    create: {
      travelId: travel.id,
      title: 'Umroh Reguler Awal Musim 1447H (9 Hari)',
      slug: 'umroh-reguler-awal-musim-9-hari',
      category: 'Reguler',
      shortDescription: 'Penerbangan langsung Saudia Airlines Jakarta - Madinah, hotel bintang 4 dekat pelataran masjid.',
      description: 'Rasakan kekhusyukan ibadah di tanah suci dengan bimbingan muthawwif berpengalaman sesuai sunnah. Didukung fasilitas hotel terdekat memudahkan jamaah melaksanakan shalat 5 waktu berjamaah.',
      durationDays: 9,
      basePrice: 28500000,
      departureCity: 'Jakarta (CGK)',
      airline: 'Saudia Airlines',
      flightType: FlightType.DIRECT,
      hotelMakkah: 'Anjum Hotel Makkah (Bintang 4)',
      hotelMakkahDistance: '200 meter dari Masjidil Haram',
      hotelMadinah: 'Rove Al Madinah (Bintang 4)',
      hotelMadinahDistance: '150 meter dari Masjid Nabawi',
      facilities: 'Tiket Pesawat PP, Visa Umroh & Asuransi, Hotel Makkah & Madinah, Makan 3x Sehari Fullboard Indonesia, Bus AC Eksekutif, Handling & Muthawwif, Air Zamzam 5L (jika izin Saudi keluar)',
      exclusions: 'Paspor, Vaksin Meningitis, Keperluan Pribadi, Biaya Kelebihan Bagasi',
      imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1000&q=80',
      commissionAffiliate: 750000,
      rating: 4.9,
      soldCount: 84,
      status: PackageStatus.PUBLISHED,
      featured: true,
    },
  });

  const pkgVip = await prisma.package.upsert({
    where: { slug: 'umroh-vip-haramain-bintang-5-12-hari' },
    update: {},
    create: {
      travelId: travel.id,
      title: 'Umroh VIP Bintang 5 Plus Kereta Cepat Haramain (12 Hari)',
      slug: 'umroh-vip-haramain-bintang-5-12-hari',
      category: 'VIP',
      shortDescription: 'Hotel bintang 5 Fairmont Makkah Clock Tower & Oberoi Madinah, transfer kereta cepat Haramain High Speed Railway.',
      description: 'Layanan ibadah umroh kelas eksekutif dengan fasilitas terbaik di garda terdepan masjid suci. Menggunakan kereta cepat Madinah-Makkah memangkas perjalanan hanya dalam 2 jam 20 menit.',
      durationDays: 12,
      basePrice: 42500000,
      departureCity: 'Jakarta (CGK)',
      airline: 'Garuda Indonesia',
      flightType: FlightType.DIRECT,
      hotelMakkah: 'Fairmont Makkah Clock Royal Tower (Bintang 5)',
      hotelMakkahDistance: '0 meter (Gedung Abraj Al-Bait)',
      hotelMadinah: 'The Oberoi Madinah (Bintang 5)',
      hotelMadinahDistance: '50 meter dari Gerbang Utama Nabawi',
      facilities: 'Tiket Pesawat Garuda Indonesia Direct PP, Kereta Cepat Haramain Kelas Bisnis, Hotel Bintang 5 Terdepan, Makan Buffet Internasional & Asia, Muthawwif Khusus S-2 Madinah, Lounge Bandara CGK & JED',
      exclusions: 'Paspor, Vaksin Meningitis, Pengeluaran Pribadi',
      imageUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1000&q=80',
      commissionAffiliate: 1500000,
      rating: 5.0,
      soldCount: 42,
      status: PackageStatus.PUBLISHED,
      featured: true,
    },
  });

  console.log(`✅ Packages seeded: ${pkgReguler.title}, ${pkgVip.title}`);

  // 4. Seed Departures
  const departureDate1 = new Date('2026-10-25T08:00:00Z');
  const departure1 = await prisma.departure.upsert({
    where: { id: 'dep-almadinah-2026-10-25' },
    update: {},
    create: {
      id: 'dep-almadinah-2026-10-25',
      packageId: pkgReguler.id,
      departureDate: departureDate1,
      returnDate: new Date('2026-11-03T18:00:00Z'),
      departureCity: 'Jakarta (CGK)',
      airline: 'Saudia Airlines',
      flightCode: 'SV-819',
      price: 28500000,
      quotaTotal: 45,
      quotaTaken: 42,
      status: DepartureStatus.ALMOST_FULL,
    },
  });

  const departureDate2 = new Date('2026-11-15T11:00:00Z');
  const departure2 = await prisma.departure.upsert({
    where: { id: 'dep-almadinah-2026-11-15' },
    update: {},
    create: {
      id: 'dep-almadinah-2026-11-15',
      packageId: pkgVip.id,
      departureDate: departureDate2,
      returnDate: new Date('2026-11-27T22:00:00Z'),
      departureCity: 'Jakarta (CGK)',
      airline: 'Garuda Indonesia',
      flightCode: 'GA-980',
      price: 42500000,
      quotaTotal: 30,
      quotaTaken: 18,
      status: DepartureStatus.AVAILABLE,
    },
  });

  console.log(`✅ Departures seeded: SV-819 (${departure1.quotaTaken}/${departure1.quotaTotal} seat) & GA-980 (${departure2.quotaTaken}/${departure2.quotaTotal} seat)`);

  // 5. Seed Demo Booking with Passports
  const booking1 = await prisma.booking.upsert({
    where: { bookingCode: 'UMROH-20261025-001' },
    update: {},
    create: {
      bookingCode: 'UMROH-20261025-001',
      userId: demoCustomer.id,
      travelId: travel.id,
      packageId: pkgReguler.id,
      departureId: departure1.id,
      customerName: 'Muhammad Fadhil',
      customerPhone: '081311223344',
      customerEmail: 'customer@umrohhub.com',
      pilgrimCount: 2,
      roomType: 'Double',
      unitPrice: 28500000,
      totalAmount: 57000000,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
    },
  });

  // Jamaah 1: Valid (> 7 Bulan)
  await prisma.passportDocument.upsert({
    where: { id: 'pass-pax-1-fadhil' },
    update: {},
    create: {
      id: 'pass-pax-1-fadhil',
      bookingId: booking1.id,
      paxIndex: 1,
      fullName: 'MUHAMMAD FADHIL AL-FARISI',
      passportNumber: 'C7829104',
      birthDate: new Date('1988-04-12T00:00:00Z'),
      gender: 'M',
      issuingOffice: 'KANIM JAKARTA SELATAN',
      issuingDate: new Date('2022-01-10T00:00:00Z'),
      expiryDate: new Date('2032-01-10T00:00:00Z'), // 2032 > 2026-10-25 -> VALID (63+ bulan)
      status: DocumentStatus.TERVERIFIKASI,
    },
  });

  // Jamaah 2: Peringatan Kemenag (< 7 Bulan saat terbang)
  // Tanggal terbang 25 Okt 2026, paspor habis Feb 2027 (~3.5 bulan sisa)
  await prisma.passportDocument.upsert({
    where: { id: 'pass-pax-2-aisyah' },
    update: {},
    create: {
      id: 'pass-pax-2-aisyah',
      bookingId: booking1.id,
      paxIndex: 2,
      fullName: 'AISYAH NUR AZIZAH',
      passportNumber: 'B9102847',
      birthDate: new Date('1992-08-20T00:00:00Z'),
      gender: 'F',
      issuingOffice: 'KANIM BANDUNG',
      issuingDate: new Date('2022-02-15T00:00:00Z'),
      expiryDate: new Date('2027-02-15T00:00:00Z'), // Hanya 3.7 bulan dari Okt 2026 -> PERLU REVISI KEMENAG
      status: DocumentStatus.PERLU_REVISI,
      rejectionReason: 'Masa berlaku paspor kurang dari 7 bulan pada tanggal keberangkatan (Aturan Ditjen PHU Kemenag RI & Visa Muassasah Saudi). Wajib perpanjangan paspor segera.',
    },
  });

  console.log(`✅ Booking & Passports seeded for: ${booking1.bookingCode}`);
  console.log('🎉 Seeding database enterprise UmrohHub selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
