'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  PlusCircle,
  FileText,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Download,
  Building,
  Plane,
  Building2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { TopUpEscrowModal } from './TopUpEscrowModal';

interface EscrowSavingsDetailViewProps {
  onBack: () => void;
  onExplorePackages?: () => void;
}

interface EscrowTransaction {
  id: string;
  date: string;
  title: string;
  type: 'deposit' | 'voucher' | 'release';
  amount: number;
  status: 'TERKUNCI' | 'AKTIF' | 'DIRILIS';
  source: string;
  referenceNo: string;
}

export function EscrowSavingsDetailView({
  onBack,
  onExplorePackages,
}: EscrowSavingsDetailViewProps) {
  // State saldo dan riwayat transaksi
  const [balance, setBalance] = useState<number>(1500000);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [copiedVA, setCopiedVA] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'release'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<EscrowTransaction[]>([
    {
      id: 'TX-ESC-881920',
      date: '20 Okt 2026, 14:30 WIB',
      title: 'Setoran Awal Tabungan Escrow',
      type: 'deposit',
      amount: 1500000,
      status: 'TERKUNCI',
      source: 'Bank Syariah Indonesia (BSI VA)',
      referenceNo: 'BSI-VA-9888081299008800',
    },
    {
      id: 'TX-VCH-110293',
      date: '18 Okt 2026, 09:15 WIB',
      title: 'Kupon Berkah Syiar Ramadhan',
      type: 'voucher',
      amount: 500000,
      status: 'AKTIF',
      source: 'Program Afiliasi Syiar Umrohpedia',
      referenceNo: 'VCH-RAMADHAN-1448H',
    },
  ]);

  const targetPackage = {
    name: 'Paket Umroh Bintang 5 Ramadhan 1448H',
    targetAmount: 32500000,
    targetDate: 'Ramadhan 1448H (Maret 2027)',
    monthsRemaining: 12,
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText('9888081299008800');
    setCopiedVA(true);
    showToast('Nomor VA BSI berhasil disalin ke clipboard');
    setTimeout(() => setCopiedVA(false), 2500);
  };

  const handleDepositSuccess = (amount: number, bankName: string) => {
    setBalance((prev) => prev + amount);
    const newTx: EscrowTransaction = {
      id: `TX-ESC-${Date.now().toString().slice(-6)}`,
      date: 'Hari ini, baru saja',
      title: 'Setoran Tabungan Berkah',
      type: 'deposit',
      amount,
      status: 'TERKUNCI',
      source: `${bankName} (Virtual Account)`,
      referenceNo: `VA-${Date.now().toString().slice(-8)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Alhamdulillah! Setoran Rp ${amount.toLocaleString('id-ID')} berhasil diverifikasi masuk ke Escrow.`);
  };

  // Kalkulasi target
  const progressPercent = Math.min(100, Math.round((balance / targetPackage.targetAmount) * 100));
  const remainingAmount = Math.max(0, targetPackage.targetAmount - balance);
  const monthlyRecommendation = Math.ceil(remainingAmount / targetPackage.monthsRemaining);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'deposit') return tx.type === 'deposit' || tx.type === 'voucher';
    if (filterType === 'release') return tx.type === 'release';
    return true;
  });

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
          1. STICKY TOP APP BAR (TOKOPEDIA STYLE MOBILE HEADER)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
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
              Tabungan &amp; Rekening Escrow
            </h1>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Kustodian Kemenag RI &amp; Bank Syariah
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            showToast('Layanan Escrow Umrohpedia diawasi langsung oleh Ditjen PHU Kementerian Agama RI & DSN-MUI.')
          }
          className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          aria-label="Informasi Escrow"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 space-y-3.5">
        {/* =========================================================================
            2. HERO SALDO CARD (ISLAMIC FINTECH ESCROW VA)
           ========================================================================= */}
        <div className="bg-gradient-to-br from-[#005B31] via-[#006E3B] to-[#007A41] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          {/* Subtle Islamic Motif Watermark */}
          <div className="absolute right-0 -bottom-4 opacity-15 pointer-events-none">
            <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3.5">
            {/* Row Header Saldo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/20 text-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs border border-white/10">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Dana Akad Wadiah Amanah</span>
              </div>
              <span className="text-[10px] font-bold bg-[#F59E0B] text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                100% AMANAH
              </span>
            </div>

            {/* Nominal Saldo */}
            <div>
              <span className="text-[11px] text-emerald-100 font-medium block">
                Total Saldo Escrow Tersimpan
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-emerald-200">Rp</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {balance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Virtual Account Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>BSI Virtual Account Kustodian</span>
                </div>
                <p className="font-mono text-xs sm:text-sm font-black text-white tracking-wider mt-0.5 select-all">
                  9888 0812 9900 8800
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyVA}
                className="shrink-0 flex items-center gap-1 bg-white text-emerald-900 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {copiedVA ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin VA</span>
                  </>
                )}
              </button>
            </div>

            {/* Dual Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIsTopUpOpen(true)}
                className="bg-[#03AC0E] hover:bg-[#029b0c] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-emerald-100" />
                <span>+ Setor Tabungan</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  showToast(
                    'Akad Syariah: Menggunakan Akad Wadiah Yad Amanah / Mudharabah Tanpa Potongan Administrasi Bulanan.'
                  )
                }
                className="bg-white/15 hover:bg-white/20 text-white border border-white/25 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Unduh Akad</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. ESCROW MILESTONE RELEASE TRACKER (TRANSPARANSI KEMENAG RI)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#005B31] flex items-center justify-center font-bold text-xs">
                🛡️
              </div>
              <h2 className="text-xs font-black text-[#212121]">
                Alur Transparansi Escrow Kemenag
              </h2>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Anti-Penipuan
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Dana tabungan Anda tidak diserahkan langsung ke biro travel, melainkan dirilis bertahap sesuai kepastian rukun ibadah:
          </p>

          {/* Stepper Vertical 4 Tahapan */}
          <div className="space-y-3 pl-1 pt-1">
            {/* Step 1: Setoran Terkunci di Bank */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-[#03AC0E] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs z-10">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#212121]">
                    1. Dana Terkunci di Escrow (100%)
                  </h4>
                  <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Selesai
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Dana tersimpan atas nama Anda di BSI/Muamalat. Tidak dapat diambil biro sebelum syarat terpenuhi.
                </p>
              </div>
              {/* Connector Line */}
              <div className="absolute left-3 top-6 w-[2px] h-9 bg-slate-200 -translate-x-1/2" />
            </div>

            {/* Step 2: Rilis 30% Tiket & Visa */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs z-10">
                2
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#212121]">
                    2. Rilis 30% Tiket &amp; E-Visa
                  </h4>
                  <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Menunggu Paspor
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Dirilis langsung ke maskapai (Saudia/Garuda) dan Muassasah setelah manifest paspor terverifikasi.
                </p>
              </div>
              {/* Connector Line */}
              <div className="absolute left-3 top-6 w-[2px] h-9 bg-slate-200 -translate-x-1/2" />
            </div>

            {/* Step 3: Rilis 40% Hotel */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                3
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700">
                    3. Rilis 40% Hotel Makkah/Madinah
                  </h4>
                  <span className="text-[9.5px] font-medium text-slate-400">
                    Terjadwal H-3
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Dirilis saat konfirmasi kode booking kamar hotel bintang 5 siap ditempati.
                </p>
              </div>
              {/* Connector Line */}
              <div className="absolute left-3 top-6 w-[2px] h-9 bg-slate-200 -translate-x-1/2" />
            </div>

            {/* Step 4: Pelunasan 30% */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                4
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700">
                    4. Pelunasan Pasca Kepulangan
                  </h4>
                  <span className="text-[9.5px] font-medium text-slate-400">
                    Sisa 30%
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Biro menerima keuntungan bersih setelah jamaah tiba kembali di tanah air dengan selamat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. TARGET RENCANA UMROH (SAVINGS GOAL CALCULATOR)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black text-[#212121]">
                Target Rencana Keberangkatan
              </h2>
            </div>
            <button
              type="button"
              onClick={onExplorePackages}
              className="text-[10.5px] font-bold text-[#03AC0E] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ubah Target</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Goal Detail Box */}
          <div className="bg-[#F7F8FA] rounded-xl p-3 border border-slate-200/70 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {targetPackage.name}
                </h4>
                <p className="text-[10.5px] text-slate-500">
                  Target Waktu: {targetPackage.targetDate} ({targetPackage.monthsRemaining} bulan lagi)
                </p>
              </div>
              <span className="text-xs font-black text-slate-900 shrink-0">
                Rp {targetPackage.targetAmount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                <span>Terkumpul: Rp {balance.toLocaleString('id-ID')}</span>
                <span className="text-emerald-700 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-[#03AC0E] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rekomendasi Menabung Otomatis */}
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 text-[11px]">
            <div className="space-y-0.5">
              <span className="text-emerald-900 font-medium block">
                Saran Setoran Rutin Bulanan:
              </span>
              <span className="font-black text-emerald-800 text-xs">
                Rp {monthlyRecommendation.toLocaleString('id-ID')} / bulan
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="bg-[#005B31] text-white px-2.5 py-1.5 rounded-lg font-bold text-[10.5px] hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
            >
              Setor Sekarang
            </button>
          </div>
        </div>

        {/* =========================================================================
            5. MUTASI TRANSAKSI ESCROW TRANSPARAN
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-[#212121]">
              Riwayat Mutasi &amp; Akad
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">
              Buku Kas Digital
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Mutasi
            </button>
            <button
              type="button"
              onClick={() => setFilterType('deposit')}
              className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-colors cursor-pointer ${
                filterType === 'deposit'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Setoran Masuk
            </button>
            <button
              type="button"
              onClick={() => setFilterType('release')}
              className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-colors cursor-pointer ${
                filterType === 'release'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Rilis Layanan
            </button>
          </div>

          {/* List Mutasi */}
          <div className="divide-y divide-slate-100 space-y-2.5 pt-1">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.type === 'voucher'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{tx.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {tx.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {tx.source} &bull; {tx.referenceNo}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-emerald-600 block">
                    +Rp {tx.amount.toLocaleString('id-ID')}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(`Kwitansi Digital #${tx.id} siap diunduh dalam format PDF resmi Kemenag.`)
                    }
                    className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-slate-500 hover:text-emerald-700 mt-0.5 cursor-pointer"
                  >
                    <Download className="w-2.5 h-2.5" />
                    <span>Kwitansi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            6. EDUKASI JAMINAN 5 PASTI UMROH KEMENAG RI
           ========================================================================= */}
        <div className="bg-[#FAF5FF] border border-purple-200/80 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <h3 className="text-xs font-black">
              Garansi Perlindungan Konsumen Kemenag RI
            </h3>
          </div>
          <p className="text-[11px] text-purple-950/80 leading-relaxed">
            Jika terjadi gagal terbang atau pembatalan sepihak oleh biro perjalanan, saldo tabungan escrow Anda <strong>100% aman dan dikembalikan utuh tanpa potongan</strong> melalui mekanisme jaminan kustodian perbankan syariah nasional.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10.5px]">
            <span className="text-purple-700 font-bold">
              Call Center Siaga Kemenag 1500-425
            </span>
            <button
              type="button"
              onClick={() =>
                showToast('Menghubungkan ke Pusat Mediasi & Pengawasan Ibadah Umroh Kemenag...')
              }
              className="text-purple-900 font-extrabold hover:underline cursor-pointer"
            >
              Pusat Mediasi &rsaquo;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Top Up / Tambah Setoran */}
      <TopUpEscrowModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccessDeposit={handleDepositSuccess}
      />
    </div>
  );
}
