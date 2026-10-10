'use client';

import React, { useState, useMemo } from 'react';
import { PackageItem, MarketplaceFilterState, RoomVariant, DepartureItem } from '@/types/marketplace';
import { PassportDocument, BookingPaxInfo } from '@/types/document';
import { MOCK_PACKAGES } from '@/data/mock-packages';
import { PackageCard } from '@/components/marketplace/PackageCard';
import { MarketplaceFilterBar } from '@/components/marketplace/MarketplaceFilterBar';
import { FilterModal } from '@/components/marketplace/FilterModal';
import { ProductDetailPage } from '@/components/marketplace/ProductDetailPage';
import { PaxSelectorTabs } from '@/components/documents/PaxSelectorTabs';
import { PassportUploadForm } from '@/components/documents/PassportUploadForm';
import { PassportReviewCard } from '@/components/documents/PassportReviewCard';
import { TravelDashboardView } from '@/components/travel-dashboard/TravelDashboardView';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfileMenu } from '@/components/auth/UserProfileMenu';
import { AdminSupervisionView } from '@/components/admin/AdminSupervisionView';
import {
  ShieldCheck,
  Plane,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Download,
  ShoppingBag,
  FileText,
  Search,
  Lock,
} from 'lucide-react';

function UmrohHubEnterpriseAppContent() {
  const { user, quickLogin } = useAuth();
  // Navigation State: 'marketplace' | 'pdp' | 'passport' | 'biro' | 'admin'
  const [currentView, setCurrentView] = useState<'marketplace' | 'pdp' | 'passport' | 'biro' | 'admin'>('marketplace');
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  // Filter State
  const [filters, setFilters] = useState<MarketplaceFilterState>({
    category: '',
    departureCity: '',
    minPrice: null,
    maxPrice: null,
    airline: '',
    cashbackOnly: false,
    sortBy: 'recommended',
    searchQuery: '',
    activeTab: 'packages',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Booking & Passport State
  const [departureDate, setDepartureDate] = useState('2026-10-15');
  const [activePaxIndex, setActivePaxIndex] = useState(1);
  const [manifestViewMode, setManifestViewMode] = useState<'upload' | 'manifest'>('upload');

  const [bookingInfo, setBookingInfo] = useState<BookingPaxInfo>({
    bookingId: 'BKG-7881920',
    bookingCode: 'UH-2026-RAMADHAN',
    packageName: 'Paket Umroh Bintang 5 Awal Ramadhan 1448H',
    departureDate: '2026-10-15',
    travelName: 'PT. Al-Falah Berkah Mandiri (PPIU No. 412/2021)',
    totalPax: 3,
    paxList: [
      { paxIndex: 1, label: 'Jamaah 1' },
      { paxIndex: 2, label: 'Jamaah 2' },
      { paxIndex: 3, label: 'Jamaah 3' },
    ],
  });

  const [documents, setDocuments] = useState<Record<number, Partial<PassportDocument>>>({
    1: {
      id: 'DOC-001',
      bookingId: 'UH-2026-RAMADHAN',
      paxIndex: 1,
      fullName: 'MUHAMMAD AHMAD FAUZI',
      passportNumber: 'C8192031',
      birthDate: '1984-06-12',
      gender: 'M',
      issuingOffice: 'Kanim Jakarta Selatan',
      issuingDate: '2022-01-10',
      expiryDate: '2032-01-10',
      passportScanUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      status: 'TERVERIFIKASI',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
    },
    2: {
      id: 'DOC-002',
      bookingId: 'UH-2026-RAMADHAN',
      paxIndex: 2,
      fullName: 'SITI NUR FATIMAH',
      passportNumber: 'B9920145',
      birthDate: '1987-11-25',
      gender: 'F',
      issuingOffice: 'Kanim Jakarta Timur',
      issuingDate: '2021-03-01',
      expiryDate: '2026-12-01', // Sisa 1.5 bulan (Kurang dari 7 bulan)
      passportScanUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      status: 'PERLU_REVISI',
      rejectionReason: 'Masa berlaku paspor tersisa kurang dari 7 bulan pada tanggal terbang (15 Okt 2026). Mohon segera perpanjang di Kantor Imigrasi.',
      createdAt: '2026-10-02T09:00:00Z',
      updatedAt: '2026-10-03T11:00:00Z',
    },
    3: {
      id: 'DOC-003',
      bookingId: 'UH-2026-RAMADHAN',
      paxIndex: 3,
      fullName: '',
      passportNumber: '',
      birthDate: '',
      gender: 'M',
      issuingOffice: '',
      issuingDate: '',
      expiryDate: '',
      passportScanUrl: '',
      status: 'BELUM_LENGKAP',
      createdAt: '2026-10-03T14:00:00Z',
      updatedAt: '2026-10-03T14:00:00Z',
    },
  });

  // Filter & Sort Logic
  const filteredPackages = useMemo(() => {
    return MOCK_PACKAGES.filter((pkg) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = pkg.title.toLowerCase().includes(query);
        const matchTravel = pkg.travelName.toLowerCase().includes(query);
        if (!matchTitle && !matchTravel) return false;
      }
      if (filters.category && pkg.category !== filters.category) return false;
      if (filters.departureCity && !pkg.departureCity.includes(filters.departureCity.split(' ')[0])) return false;
      if (filters.airline && pkg.airline !== filters.airline) return false;
      if (filters.cashbackOnly && pkg.commissionAffiliate <= 0) return false;
      if (filters.minPrice !== null && pkg.price < filters.minPrice) return false;
      if (filters.maxPrice !== null && pkg.price > filters.maxPrice) return false;
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'rating_desc') return b.rating - a.rating;
      if (filters.sortBy === 'departure_asc') {
        return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
      }
      return b.soldCount - a.soldCount; // recommended
    });
  }, [filters]);

  const handleSelectPackage = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setCurrentView('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToBooking = async (data: {
    pkg: PackageItem;
    paxCount: number;
    roomVariant: RoomVariant;
    departure: DepartureItem;
    totalPrice: number;
  }) => {
    let code = `UH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    let bkgId = `BKG-${Date.now()}`;

    // Kirim pendaftaran transaksi ke PostgreSQL Booking Table via Prisma API
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: data.pkg.id,
          departureId: data.departure.id,
          pilgrimCount: data.paxCount,
          roomType: data.roomVariant.name,
          customerName: 'Muhammad Ahmad Fauzi',
          customerPhone: '081298765432',
          customerEmail: 'jamaah@umrohhub.com',
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success && resData.data?.bookingCode) {
        code = resData.data.bookingCode;
        bkgId = resData.data.id;
      }
    } catch (e) {
      console.warn('Booking API offline, proceeding with client session code:', e);
    }

    // Generate new booking context and move to passport flow
    setBookingInfo({
      bookingId: bkgId,
      bookingCode: code,
      packageName: `${data.pkg.title} (${data.roomVariant.name})`,
      departureDate: data.departure.departureDate,
      travelName: data.pkg.travelName,
      totalPax: data.paxCount,
      paxList: Array.from({ length: data.paxCount }, (_, i) => ({
        paxIndex: i + 1,
        label: `Jamaah ${i + 1}`,
      })),
    });
    setDepartureDate(data.departure.departureDate);
    setActivePaxIndex(1);

    // Inisialisasi dokumen baru
    const initialDocs: Record<number, Partial<PassportDocument>> = {};
    for (let i = 1; i <= data.paxCount; i++) {
      initialDocs[i] = {
        bookingId: code,
        paxIndex: i,
        fullName: i === 1 ? 'MUHAMMAD AHMAD FAUZI' : '',
        passportNumber: i === 1 ? 'C8192031' : '',
        gender: 'M',
        birthDate: i === 1 ? '1984-06-12' : '',
        issuingOffice: i === 1 ? 'Kanim Jakarta Selatan' : '',
        expiryDate: i === 1 ? '2032-01-10' : '',
        status: i === 1 ? 'MENUNGGU_VERIFIKASI' : 'BELUM_LENGKAP',
      };
    }
    setDocuments(initialDocs);

    setCurrentView('passport');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDoc = (updatedDoc: Partial<PassportDocument>) => {
    setDocuments((prev) => ({
      ...prev,
      [activePaxIndex]: updatedDoc,
    }));
  };

  const totalPax = bookingInfo.totalPax;
  const docsList = Object.values(documents);
  const verifiedCount = docsList.filter((d) => d.status === 'TERVERIFIKASI').length;
  const pendingCount = docsList.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;
  const revisionCount = docsList.filter((d) => d.status === 'PERLU_REVISI').length;
  const incompleteCount = totalPax - (verifiedCount + pendingCount + revisionCount);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#212121] pb-16">
      {/* Top Navbar Tokopedia-Inspired */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setCurrentView('marketplace');
              setSelectedPackage(null);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
              UH
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  UmrohHub
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ENTERPRISE v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Marketplace & Portal Umroh Terverifikasi Kemenag RI
              </p>
            </div>
          </div>

          {/* Search Box in Navbar (Marketplace View) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari paket umroh, biro PPIU, kota keberangkatan..."
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs font-medium transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Module Switcher Header Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setCurrentView('marketplace');
                setSelectedPackage(null);
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                currentView === 'marketplace' || currentView === 'pdp'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Katalog Paket</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('passport')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                currentView === 'passport'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paspor Jamaah</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('biro')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                currentView === 'biro'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Dashboard Biro</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                currentView === 'admin'
                  ? 'bg-purple-900 text-white shadow-2xs font-extrabold'
                  : 'text-purple-800 hover:bg-purple-100/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* User Profile & Auth Trigger */}
          <UserProfileMenu onNavigatePortal={(view) => setCurrentView(view)} />
        </div>
      </header>

      {/* Main App Body */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* =========================================================================
            VIEW 1: MARKETPLACE CATALOG (TOKOPEDIA-INSPIRED)
           ========================================================================= */}
        {currentView === 'marketplace' && (
          <div className="space-y-6">
            {/* Promo Banner Strip */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
              <div className="max-w-xl space-y-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-emerald-200 backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  Jaminan 5 Pasti Umroh Kemenag RI
                </span>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Temukan Travel Terpercaya. Bandingkan Paket. Berangkat Lebih Tenang.
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Bandingkan paket resmi berizin PPIU Kemenag RI dengan perlindungan transaksi amanah, kepastian maskapai, hotel, dan audit paspor otomatis.
                </p>
              </div>
            </div>

            {/* Filter Bar & Quick Pills */}
            <MarketplaceFilterBar
              filters={filters}
              onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              onResetFilters={() =>
                setFilters({
                  category: '',
                  departureCity: '',
                  minPrice: null,
                  maxPrice: null,
                  airline: '',
                  cashbackOnly: false,
                  sortBy: 'recommended',
                  searchQuery: '',
                  activeTab: 'packages',
                })
              }
              totalResults={filteredPackages.length}
            />

            {/* Product Cards Grid (GrabFood / Tokopedia style) */}
            {filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onSelect={handleSelectPackage}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Tidak ada paket yang sesuai kriteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Coba ubah kota keberangkatan, rentang harga, atau reset filter untuk melihat seluruh katalog.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      category: '',
                      departureCity: '',
                      minPrice: null,
                      maxPrice: null,
                      airline: '',
                      cashbackOnly: false,
                      sortBy: 'recommended',
                      searchQuery: '',
                      activeTab: 'packages',
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: PRODUCT DETAIL PAGE (3-COLUMN PDP)
           ========================================================================= */}
        {currentView === 'pdp' && selectedPackage && (
          <ProductDetailPage
            pkg={selectedPackage}
            onBack={() => {
              setCurrentView('marketplace');
              setSelectedPackage(null);
            }}
            onProceedToBooking={handleProceedToBooking}
          />
        )}

        {/* =========================================================================
            VIEW 3: PASSPORT & FLIGHT MANIFEST MANAGEMENT
           ========================================================================= */}
        {currentView === 'passport' && (
          <div className="space-y-6">
            {/* Breadcrumb & Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <button
                    type="button"
                    onClick={() => setCurrentView('marketplace')}
                    className="hover:underline hover:text-emerald-700 cursor-pointer"
                  >
                    Katalog Paket
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  <span className="font-semibold text-emerald-700">Dokumen Paspor & Manifes</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Manajemen Paspor & Manifes Penerbangan
                </h1>
              </div>

              {/* View Mode Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setManifestViewMode('upload')}
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    manifestViewMode === 'upload'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Form Upload Jamaah
                </button>
                <button
                  type="button"
                  onClick={() => setManifestViewMode('manifest')}
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    manifestViewMode === 'manifest'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tabel Manifes Maskapai ({totalPax} Pax)
                </button>
              </div>
            </div>

            {/* Booking Card & Flight Timeline Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Booking Dikonfirmasi
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {bookingInfo.bookingCode}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {bookingInfo.packageName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>{bookingInfo.travelName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>{totalPax} Jamaah Terdaftar</span>
                    </div>
                  </div>
                </div>

                {/* Flight Departure Simulator Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Plane className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Jadwal Keberangkatan Terbang:</span>
                  </div>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                  />
                  <p className="text-[10px] text-slate-500">
                    Kalkulator Kemenag 7 bulan otomatis terkalibrasi dengan tanggal ini.
                  </p>
                </div>
              </div>

              {/* Progress Bar Kelengkapan Dokumen */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Progres Kelengkapan Paspor: {verifiedCount} dari {totalPax} Terverifikasi</span>
                  <span className="text-emerald-700 font-bold">
                    {Math.round((verifiedCount / totalPax) * 100)}% Siap Terbang
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(verifiedCount / totalPax) * 100}%` }}
                    className="bg-emerald-600 transition-all duration-300"
                  />
                  <div
                    style={{ width: `${(pendingCount / totalPax) * 100}%` }}
                    className="bg-sky-500 transition-all duration-300"
                  />
                  <div
                    style={{ width: `${(revisionCount / totalPax) * 100}%` }}
                    className="bg-amber-500 transition-all duration-300"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Terverifikasi: {verifiedCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Review Biro: {pendingCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Perlu Revisi: {revisionCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    Belum Diisi: {incompleteCount}
                  </span>
                </div>
              </div>
            </div>

            {manifestViewMode === 'upload' ? (
              <div className="space-y-6">
                {/* Multi-Pax Selector Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <PaxSelectorTabs
                    totalPax={totalPax}
                    activePaxIndex={activePaxIndex}
                    documents={documents}
                    onSelectPax={setActivePaxIndex}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Kolom Kiri: Form Upload Utama */}
                  <div className="lg:col-span-8">
                    <PassportUploadForm
                      paxIndex={activePaxIndex}
                      totalPax={totalPax}
                      bookingCode={bookingInfo.bookingCode}
                      departureDate={departureDate}
                      initialData={documents[activePaxIndex]}
                      onSave={handleSaveDoc}
                    />
                  </div>

                  {/* Kolom Kanan: Summary Preview & Panduan Kemenag */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                        Preview Kartu Jamaah {activePaxIndex}
                      </h3>
                      {documents[activePaxIndex]?.fullName ? (
                        <PassportReviewCard
                          document={documents[activePaxIndex] as PassportDocument}
                        />
                      ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 space-y-2">
                          <Users className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="text-xs font-medium">
                            Belum ada data paspor untuk Jamaah {activePaxIndex}. Silakan isi form di samping.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3 text-xs text-emerald-950">
                      <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Ketentuan Paspor Umroh Resmi</span>
                      </div>
                      <ul className="space-y-2 text-emerald-900/90 leading-relaxed list-disc list-inside">
                        <li>
                          <strong>Aturan 7 Bulan:</strong> Paspor wajib masih berlaku minimal 7 bulan sejak tanggal terbang.
                        </li>
                        <li>
                          <strong>Nama 3 Suku Kata:</strong> Dianjurkan 3 kata (cth: <em>Ahmad Fauzi Ridwan</em>) untuk kelancaran visa Saudi.
                        </li>
                        <li>
                          <strong>Kualitas Foto:</strong> Seluruh teks halaman identitas harus tajam tanpa pantulan kilau lampu.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Daftar Manifes Paspor Penerbangan Maskapai
                    </h3>
                    <p className="text-xs text-slate-500">
                      Format standar PNR maskapai & Siskopatuh Kemenag RI
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert('Manifes siap diekspor ke format CSV / PDF maskapai.')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Ekspor Manifes (CSV/PDF)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Pax</th>
                        <th className="px-4 py-3">Nama Jamaah (Sesuai Paspor)</th>
                        <th className="px-4 py-3">No. Paspor</th>
                        <th className="px-4 py-3">Gender / Lahir</th>
                        <th className="px-4 py-3">Masa Berlaku</th>
                        <th className="px-4 py-3">Status Verifikasi</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookingInfo.paxList.map((pax) => {
                        const doc = documents[pax.paxIndex];
                        return (
                          <tr key={pax.paxIndex} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              #{pax.paxIndex}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-800">
                              {doc?.fullName || <span className="text-slate-400 font-normal">Belum diisi</span>}
                            </td>
                            <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                              {doc?.passportNumber || '-'}
                            </td>
                            <td className="px-4 py-3.5">
                              {doc?.gender ? (doc.gender === 'M' ? 'L' : 'P') : '-'} • {doc?.birthDate || '-'}
                            </td>
                            <td className="px-4 py-3.5">
                              {doc?.expiryDate ? (
                                <span className="font-semibold text-slate-800">
                                  {doc.expiryDate}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {doc?.status === 'TERVERIFIKASI' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                                </span>
                              )}
                              {doc?.status === 'PERLU_REVISI' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Perlu Revisi
                                </span>
                              )}
                              {doc?.status === 'MENUNGGU_VERIFIKASI' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                                  Review Biro
                                </span>
                              )}
                              {(!doc || doc.status === 'BELUM_LENGKAP') && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                  Belum Lengkap
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePaxIndex(pax.paxIndex);
                                  setManifestViewMode('upload');
                                }}
                                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                              >
                                Kelola
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 4: DASHBOARD BIRO TRAVEL PPIU (B2B)
           ========================================================================= */}
        {currentView === 'biro' && (
          <div className="space-y-4">
            {user?.role !== 'TRAVEL' && user?.role !== 'SUPER_ADMIN' && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Anda sedang melihat <strong>Dashboard Biro PPIU</strong> dalam mode demo peninjau.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => quickLogin('TRAVEL')}
                  className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Masuk sebagai Biro Al-Madinah (1-Klik)
                </button>
              </div>
            )}
            <TravelDashboardView />
          </div>
        )}

        {/* =========================================================================
            VIEW 5: SUPER ADMIN PLATFORM BACKOFFICE
           ========================================================================= */}
        {currentView === 'admin' && (
          <div className="space-y-4">
            {user?.role !== 'SUPER_ADMIN' && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs text-purple-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    Anda sedang melihat <strong>Super Admin Backoffice</strong> dalam mode demo auditor.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => quickLogin('SUPER_ADMIN')}
                  className="px-3 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Masuk sebagai Super Admin (1-Klik)
                </button>
              </div>
            )}
            <AdminSupervisionView />
          </div>
        )}
      </main>

      {/* Faceted Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        onReset={() =>
          setFilters({
            category: '',
            departureCity: '',
            minPrice: null,
            maxPrice: null,
            airline: '',
            cashbackOnly: false,
            sortBy: 'recommended',
            searchQuery: '',
            activeTab: 'packages',
          })
        }
      />

      {/* Enterprise Multi-Role Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function UmrohHubEnterpriseApp() {
  return (
    <AuthProvider>
      <UmrohHubEnterpriseAppContent />
    </AuthProvider>
  );
}
