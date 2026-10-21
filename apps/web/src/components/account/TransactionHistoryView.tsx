'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  X,
  Filter,
  ShieldCheck,
  Calendar,
  Users,
  Plane,
  Building2,
  ChevronRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  FileText,
  Star,
  ExternalLink,
} from 'lucide-react';
import { TransactionItem, TransactionDetailModal } from './TransactionDetailModal';
import { BiroReviewModal } from './BiroReviewModal';
import { TopUpEscrowModal } from './TopUpEscrowModal';

interface TransactionHistoryViewProps {
  onBack: () => void;
  onNavigatePassport: () => void;
  onNavigateEscrow: () => void;
  initialTab?: 'all' | 'unpaid' | 'verification' | 'ready' | 'active' | 'completed';
}

export function TransactionHistoryView({
  onBack,
  onNavigatePassport,
  onNavigateEscrow,
  initialTab = 'all',
}: TransactionHistoryViewProps) {
  const [activeTab, setActiveTab] = useState<
    'all' | 'unpaid' | 'verification' | 'ready' | 'active' | 'completed'
  >(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<TransactionItem | null>(null);
  const [selectedTxForReview, setSelectedTxForReview] = useState<TransactionItem | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dataset Mock Transaksi Ibadah Komprehensif
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 'TX-BKG-001',
      bookingCode: 'UH-2026-RAMADHAN',
      date: '15 Okt 2026',
      travelName: 'PT. Al-Falah Berkah Mandiri',
      travelPpiu: 'PPIU No. 412/2021',
      travelPhone: '081288990011',
      packageName: 'Paket Umroh Bintang 5 Awal Ramadhan 1448H',
      packageImage:
        'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80',
      departureDate: '15 Okt 2026 (12 Hari)',
      returnDate: '27 Okt 2026',
      airline: 'Saudia Airlines Direct',
      flightCode: 'SV-819',
      hotelMakkah: 'Dar Al Tawhid Intercontinental (5★)',
      hotelMadinah: 'Pullman Zamzam Madinah (5★)',
      totalPax: 3,
      roomType: 'Quad Room',
      totalPrice: 97500000,
      paidAmount: 97500000,
      paymentMethod: 'BSI Virtual Account (Escrow Kemenag)',
      status: 'VERIFIKASI',
      statusLabel: 'Verifikasi Paspor & Visa',
      passportVerifiedCount: 2,
      pilgrims: [
        {
          name: 'MUHAMMAD AHMAD FAUZI',
          passportNo: 'C8192031',
          status: 'TERVERIFIKASI',
        },
        {
          name: 'SITI NUR FATIMAH',
          passportNo: 'B9920145',
          status: 'TERVERIFIKASI',
        },
        {
          name: 'AISYAH AHMAD FAUZI',
          passportNo: '',
          status: 'BELUM_LENGKAP',
        },
      ],
    },
    {
      id: 'TX-BKG-002',
      bookingCode: 'UH-2026-SYAWAL',
      date: '10 Okt 2026',
      travelName: 'PT. Madinah Iman Wisata',
      travelPpiu: 'PPIU No. 182/2019',
      travelPhone: '081399887766',
      packageName: 'Paket Umroh Syawal Berkah 1448H',
      packageImage:
        'https://images.unsplash.com/photo-1565552684305-7e8e7a080824?auto=format&fit=crop&w=600&q=80',
      departureDate: '25 Nov 2026 (9 Hari)',
      returnDate: '04 Des 2026',
      airline: 'Garuda Indonesia Direct',
      flightCode: 'GA-980',
      hotelMakkah: 'Movenpick Hajar Tower (5★)',
      hotelMadinah: 'Al Haram Hotel (4★)',
      totalPax: 2,
      roomType: 'Double Room',
      totalPrice: 62000000,
      paidAmount: 10000000,
      paymentMethod: 'Bank Muamalat VA (Escrow Syariah)',
      status: 'BELUM_BAYAR',
      statusLabel: 'Menunggu Pelunasan Escrow',
      passportVerifiedCount: 0,
      pilgrims: [
        {
          name: 'HENDRA PRASETYO',
          passportNo: 'A1102938',
          status: 'MENUNGGU_VERIFIKASI',
        },
        {
          name: 'DEWI ANGGRAENI',
          passportNo: 'A2293847',
          status: 'MENUNGGU_VERIFIKASI',
        },
      ],
    },
    {
      id: 'TX-BKG-003',
      bookingCode: 'UH-2026-RAJAB',
      date: '02 Sep 2026',
      travelName: 'PT. Arminareka Perdana',
      travelPpiu: 'PPIU No. 047/2020',
      travelPhone: '081122334455',
      packageName: 'Paket Umroh Reguler VIP Rajab 1448H',
      packageImage:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      departureDate: '05 Jan 2027 (10 Hari)',
      returnDate: '15 Jan 2027',
      airline: 'Saudia Airlines',
      flightCode: 'SV-823',
      hotelMakkah: 'Swissotel Makkah (5★)',
      hotelMadinah: 'Dallah Taibah (5★)',
      totalPax: 1,
      roomType: 'Single Room',
      totalPrice: 38500000,
      paidAmount: 38500000,
      paymentMethod: 'BCA Syariah VA (Escrow Kemenag)',
      status: 'SIAP_TERBANG',
      statusLabel: 'Siap Terbang & E-Visa Terbit',
      passportVerifiedCount: 1,
      pilgrims: [
        {
          name: 'MUHAMMAD AHMAD FAUZI',
          passportNo: 'C8192031',
          status: 'TERVERIFIKASI',
        },
      ],
    },
    {
      id: 'TX-BKG-004',
      bookingCode: 'UH-2025-AKHIR',
      date: '12 Des 2025',
      travelName: 'PT. Al-Falah Berkah Mandiri',
      travelPpiu: 'PPIU No. 412/2021',
      travelPhone: '081288990011',
      packageName: 'Paket Umroh Akhir Tahun Liburan 1447H',
      packageImage:
        'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
      departureDate: '20 Des 2025 (10 Hari)',
      returnDate: '30 Des 2025',
      airline: 'Garuda Indonesia Direct',
      flightCode: 'GA-982',
      hotelMakkah: 'Pullman Zamzam Makkah (5★)',
      hotelMadinah: 'Rove Al Madinah (4★)',
      totalPax: 2,
      roomType: 'Double Room',
      totalPrice: 65000000,
      paidAmount: 65000000,
      paymentMethod: 'BSI Virtual Account',
      status: 'SELESAI',
      statusLabel: 'Ibadah Selesai (Mabrur)',
      passportVerifiedCount: 2,
      pilgrims: [
        {
          name: 'MUHAMMAD AHMAD FAUZI',
          passportNo: 'C8192031',
          status: 'TERVERIFIKASI',
        },
        {
          name: 'SITI NUR FATIMAH',
          passportNo: 'B9920145',
          status: 'TERVERIFIKASI',
        },
      ],
    },
  ]);

  // Tab Filtering Logic
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        tx.bookingCode.toLowerCase().includes(q) ||
        tx.packageName.toLowerCase().includes(q) ||
        tx.travelName.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // 2. Tab filter
    if (activeTab === 'all') return true;
    if (activeTab === 'unpaid') return tx.status === 'BELUM_BAYAR';
    if (activeTab === 'verification') return tx.status === 'VERIFIKASI';
    if (activeTab === 'ready') return tx.status === 'SIAP_TERBANG';
    if (activeTab === 'active') return tx.status === 'DI_TANAH_SUCI';
    if (activeTab === 'completed') return tx.status === 'SELESAI';
    return true;
  });

  // Tab Badge Counters
  const countUnpaid = transactions.filter((t) => t.status === 'BELUM_BAYAR').length;
  const countVerification = transactions.filter((t) => t.status === 'VERIFIKASI').length;
  const countReady = transactions.filter((t) => t.status === 'SIAP_TERBANG').length;

  const handleReviewSubmit = (reviewData: {
    bookingCode: string;
    ratings: { muthawif: number; hotel: number; catering: number; bus: number };
    overall: number;
    comment: string;
  }) => {
    showToast(
      `Jazakallahu khair! Ulasan rating ${reviewData.overall}★ untuk booking ${reviewData.bookingCode} berhasil disimpan.`
    );
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F5F7] text-[#212121] pb-24 font-sans animate-in fade-in">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#212121]/95 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 max-w-[90vw]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="line-clamp-2">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. TOP APP BAR (TOKOPEDIA STYLE MOBILE HEADER)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Kembali ke Akun"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-[#212121] leading-tight">
              Daftar Transaksi Ibadah
            </h1>
            <p className="text-[10px] text-slate-500">
              Riwayat pemesanan paket &amp; proteksi escrow
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isSearchOpen ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Cari Transaksi"
        >
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Search Input Box (Collapsible) */}
      {isSearchOpen && (
        <div className="bg-white border-b border-slate-200 p-2.5 px-4 animate-in slide-in-from-top-2">
          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 focus-within:border-emerald-600 focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Cari kode booking, nama paket, atau biro PPIU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          2. HORIZONTAL SCROLLABLE FILTER TABS (TOKOPEDIA PILLS)
         ========================================================================= */}
      <div className="sticky top-[49px] z-30 bg-white border-b border-slate-200 px-3 py-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
            activeTab === 'all'
              ? 'bg-[#005B31] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua ({transactions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unpaid')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
            activeTab === 'unpaid'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Belum Bayar</span>
          {countUnpaid > 0 && (
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'unpaid' ? 'bg-white text-rose-700' : 'bg-rose-500 text-white'
              }`}
            >
              {countUnpaid}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
            activeTab === 'verification'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Verifikasi Paspor &amp; Visa</span>
          {countVerification > 0 && (
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'verification' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
              }`}
            >
              {countVerification}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ready')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
            activeTab === 'ready'
              ? 'bg-[#03AC0E] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Siap Terbang</span>
          {countReady > 0 && (
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'ready' ? 'bg-white text-emerald-800' : 'bg-[#03AC0E] text-white'
              }`}
            >
              {countReady}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
            activeTab === 'active'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Di Tanah Suci
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
            activeTab === 'completed'
              ? 'bg-slate-800 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Selesai
        </button>
      </div>

      {/* =========================================================================
          3. TRANSACTION CARDS LIST
         ========================================================================= */}
      <div className="p-3.5 space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
              🕋
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Tidak Ada Transaksi pada Kategori Ini
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Pilih tab status lainnya atau cari kata kunci lain.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#03AC0E] hover:underline cursor-pointer"
            >
              Reset Filter &amp; Tampilkan Semua
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isNeedPassportAction =
              tx.status === 'VERIFIKASI' && tx.passportVerifiedCount < tx.totalPax;

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-3.5 space-y-3 hover:border-slate-300 transition-all"
              >
                {/* 1. Header Card: Tanggal + Kode Booking + Badge Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tx.date}</span>
                    <span>&bull;</span>
                    <span className="font-mono font-bold text-slate-700">{tx.bookingCode}</span>
                  </div>

                  <div>
                    <span
                      className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                        tx.status === 'VERIFIKASI'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : tx.status === 'BELUM_BAYAR'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : tx.status === 'SIAP_TERBANG'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tx.statusLabel}
                    </span>
                  </div>
                </div>

                {/* 2. Info Biro PPIU Resmi */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{tx.travelName}</span>
                  </div>
                  <span className="text-[9.5px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                    {tx.travelPpiu}
                  </span>
                </div>

                {/* 3. Paket Summary: Thumbnail + Judul + Pax */}
                <div className="flex gap-3 bg-[#F9FAFB] p-2.5 rounded-xl border border-slate-100">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                    <Image
                      src={tx.packageImage}
                      alt={tx.packageName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {tx.packageName}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {tx.totalPax} Jamaah &bull; Kamar {tx.roomType} &bull; {tx.airline}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Terbang: {tx.departureDate}
                    </p>
                  </div>
                </div>

                {/* 4. Alert Khusus: Paspor Belum Lengkap */}
                {isNeedPassportAction && (
                  <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>{tx.totalPax - tx.passportVerifiedCount} paspor</strong> belum lengkap untuk penerbitan visa
                      </span>
                    </div>
                    <span className="text-amber-800 font-bold bg-amber-200/60 px-1.5 py-0.2 rounded text-[9.5px]">
                      {tx.passportVerifiedCount}/{tx.totalPax} Siap
                    </span>
                  </div>
                )}

                {/* 5. Finansial & Escrow Status */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Tagihan Transaksi</span>
                    <span className="text-sm font-black text-slate-900">
                      Rp {tx.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {tx.paidAmount >= tx.totalPrice ? 'Lunas di Escrow Syariah' : 'DP Tersimpan di Escrow'}
                    </span>
                  </div>
                </div>

                {/* 6. Context-Aware Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTxForDetail(tx)}
                    className="text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Detail Pesanan
                  </button>

                  {tx.status === 'VERIFIKASI' && (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = '#passport';
                        onNavigatePassport();
                      }}
                      className="bg-[#03AC0E] hover:bg-[#029b0c] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      + Lengkapi Paspor ({tx.passportVerifiedCount}/{tx.totalPax})
                    </button>
                  )}

                  {tx.status === 'BELUM_BAYAR' && (
                    <button
                      type="button"
                      onClick={() => setIsTopUpModalOpen(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Bayar Tagihan Escrow
                    </button>
                  )}

                  {tx.status === 'SIAP_TERBANG' && (
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`E-Visa & Tiket ${tx.bookingCode} telah diunduh (Saudia Airlines SV-823).`)
                      }
                      className="bg-[#005B31] hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh E-Visa &amp; Tiket</span>
                    </button>
                  )}

                  {tx.status === 'SELESAI' && (
                    <button
                      type="button"
                      onClick={() => setSelectedTxForReview(tx)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Beri Ulasan Biro</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Detail Rincian Pesanan */}
      <TransactionDetailModal
        isOpen={Boolean(selectedTxForDetail)}
        onClose={() => setSelectedTxForDetail(null)}
        transaction={selectedTxForDetail}
        onNavigatePassport={onNavigatePassport}
        onNavigateEscrow={onNavigateEscrow}
      />

      {/* Modal 2: Ulasan Biro PPIU */}
      {selectedTxForReview && (
        <BiroReviewModal
          isOpen={Boolean(selectedTxForReview)}
          onClose={() => setSelectedTxForReview(null)}
          bookingCode={selectedTxForReview.bookingCode}
          travelName={selectedTxForReview.travelName}
          packageName={selectedTxForReview.packageName}
          onSubmitReview={handleReviewSubmit}
        />
      )}

      {/* Modal 3: Bayar Tagihan Escrow */}
      <TopUpEscrowModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccessDeposit={(amount, bank) => {
          showToast(`Pembayaran tagihan Rp ${amount.toLocaleString('id-ID')} via ${bank} berhasil.`);
        }}
      />
    </div>
  );
}
