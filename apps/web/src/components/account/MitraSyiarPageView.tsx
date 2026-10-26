'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Share2,
  DollarSign,
  Users,
  ArrowRight,
  ShieldCheck,
  Download,
  Gift,
  ExternalLink,
  Wallet,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface MitraSyiarPageViewProps {
  onBack: () => void;
  initialRegistered?: boolean;
}

export function MitraSyiarPageView({
  onBack,
  initialRegistered = true,
}: MitraSyiarPageViewProps) {
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPromoText, setCopiedPromoText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State Registrasi Baru
  const [fullName, setFullName] = useState('Ahmad Fauzi');
  const [referralSlug, setReferralSlug] = useState('starmilstore');
  const [bankName, setBankName] = useState('Bank Syariah Indonesia (BSI)');
  const [bankAccount, setBankAccount] = useState('7123008899');

  // Mini Dashboard State
  const [availableBalance, setAvailableBalance] = useState(4500000);
  const [totalEarned, setTotalEarned] = useState(9000000);
  const [totalPilgrims, setTotalPilgrims] = useState(6);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const referralLink = `https://umrohpedia.my.id/syiar/${referralSlug}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Tautan Syiar berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nBagi bapak/ibu yang berniat mendaftar Ibadah Umroh dengan jaminan legalitas resmi Kemenag RI dan proteksi Rekening Escrow Syariah, silakan akses paket rekomendasi amanah melalui tautan ini:\n${referralLink}\n\nDapatkan diskon berkah dan kemudahan manasik terpercaya. Barakallahu fikum.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleWithdraw = () => {
    if (availableBalance <= 0) {
      showToast('Saldo komisi belum mencukupi untuk ditarik.');
      return;
    }
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setAvailableBalance(0);
      showToast(
        `Alhamdulillah! Penarikan dana komisi Rp 4.500.000 ke ${bankName} (${bankAccount}) sedang diproses secara real-time.`
      );
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistered(true);
    showToast('Selamat! Akun Mitra Syi\'ar Anda telah aktif.');
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F5F7] text-[#212121] pb-24 font-sans animate-in fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#212121]/95 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 max-w-[90vw]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="line-clamp-2">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. STICKY TOP APP BAR (TOKOPEDIA STYLE MOBILE HEADER)
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
              Program Kemitraan Syiar
            </h1>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Syiar Ibadah &bull; Komisi Berkah Halal
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#005B31] flex items-center justify-center font-bold text-xs">
          🔗
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT CONTAINER
         ========================================================================= */}
      <div className="p-4 space-y-3.5 text-xs">
        {/* =========================================================================
            VIEW 1: FORM REGISTRASI JIKA BELUM TERDAFTAR
           ========================================================================= */}
        {!isRegistered ? (
          <form onSubmit={handleRegisterSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5 animate-in fade-in">
            {/* Hero Banner Manfaat */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Dapatkan Komisi Hingga Rp 1,5 Jt / Jamaah</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ajak keluarga, jamaah majelis taklim, atau kerabat Anda beribadah ke tanah suci bersama biro resmi berizin Kemenag RI.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold pt-1">
                <span>✓ Akad Syariah Halal</span>
                <span>&bull;</span>
                <span>✓ Pencairan Fleksibel</span>
                <span>&bull;</span>
                <span>✓ 100% Gratis</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 block text-xs">
                Nama Lengkap Anda:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 block text-xs">
                Custom Kode / Tautan Syiar:
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-emerald-600 focus-within:bg-white">
                <span className="text-[11px] text-slate-400 font-mono">umrohpedia.my.id/syiar/</span>
                <input
                  type="text"
                  value={referralSlug}
                  onChange={(e) => setReferralSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full bg-transparent border-none text-xs font-bold text-emerald-800 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 block text-xs">
                Bank Syariah untuk Pencairan Komisi:
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                <option value="Bank Muamalat Indonesia">Bank Muamalat Indonesia</option>
                <option value="BCA Syariah">BCA Syariah</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 block text-xs">
                Nomor Rekening Penerima:
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="7123xxxxxx"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#005B31] hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Aktifkan Akun Mitra Syi&apos;ar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* =========================================================================
             VIEW 2: DASHBOARD MITRA AKTIF (LINK REFERRAL & SALDO KOMISI)
             ========================================================================= */
          <div className="space-y-3.5 animate-in fade-in">
            {/* Card Saldo Komisi & Metrik (Selaras dengan Pita Cepat Rp 9 Jt) */}
            <div className="bg-gradient-to-br from-[#005B31] via-[#006E3B] to-[#007A41] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Komisi Berkah Terverifikasi
                </span>
                <span className="text-[9px] font-black bg-[#F59E0B] text-slate-950 px-2 py-0.5 rounded-full">
                  MITRA AKTIF
                </span>
              </div>

              <div>
                <span className="text-[10.5px] text-emerald-100 font-medium block">
                  Saldo Komisi Siap Ditarik:
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-bold text-emerald-200">Rp</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {availableBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[10.5px]">
                <div>
                  <span className="text-emerald-200 block">Total Komisi Diterima:</span>
                  <span className="font-bold text-white text-xs">
                    Rp {totalEarned.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-200 block">Jamaah Terdaftar:</span>
                  <span className="font-bold text-white text-xs">
                    {totalPilgrims} Jamaah Sah
                  </span>
                </div>
              </div>

              {/* Tombol Tarik Dana */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={availableBalance <= 0 || isWithdrawing}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    availableBalance > 0
                      ? 'bg-white text-emerald-900 hover:bg-emerald-50 active:scale-98'
                      : 'bg-white/20 text-white/60 cursor-not-allowed'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {isWithdrawing
                      ? 'Mentransfer ke Rekening...'
                      : availableBalance > 0
                      ? `Tarik Rp ${availableBalance.toLocaleString('id-ID')} ke ${bankName.split(' ')[0]}`
                      : 'Saldo Telah Dicairkan'}
                  </span>
                </button>
              </div>
            </div>

            {/* Box Tautan Syiar Pribadi */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" /> Tautan Syiar Pribadi Anda:
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                  Aktif
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 truncate select-all">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share ke WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full bg-[#03AC0E] hover:bg-[#029b0c] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Tautan ke WhatsApp</span>
              </button>
            </div>

            {/* Promo Kit Banner & Copy Text */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 text-[11px] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Template Caption Promosi Siap Pakai:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Niatkan ibadah umroh bersama keluarga dengan jaminan 5 Pasti Kemenag RI dan perlindungan Rekening Escrow Syariah. Akses paket resmi di ${referralLink}`
                    );
                    setCopiedPromoText(true);
                    showToast('Caption promosi disalin ke clipboard!');
                    setTimeout(() => setCopiedPromoText(false), 2500);
                  }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {copiedPromoText ? 'Tersalin ✓' : 'Salin Teks'}
                </button>
              </div>
              <p className="text-slate-600 italic bg-[#F7F8FA] p-3 rounded-xl border border-slate-200/70 text-[10.5px] leading-relaxed">
                &ldquo;Niatkan ibadah umroh bersama keluarga dengan jaminan 5 Pasti Kemenag RI dan perlindungan Rekening Escrow Syariah. Akses paket resmi di {referralLink}&rdquo;
              </p>
            </div>

            {/* Riwayat Mutasi Komisi */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
              <span className="font-bold text-slate-900 text-xs block">
                Riwayat Komisi Syiar Terakhir:
              </span>
              <div className="divide-y divide-slate-100 text-[10.5px]">
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Jamaah BKG-7881920 (3 Pax)</p>
                    <p className="text-slate-400">15 Okt 2026 &bull; Paket Bintang 5 Ramadhan</p>
                  </div>
                  <span className="font-bold text-emerald-600">+Rp 4.500.000</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Jamaah BKG-6129841 (2 Pax)</p>
                    <p className="text-slate-400">10 Okt 2026 &bull; Paket Syawal Berkah</p>
                  </div>
                  <span className="font-bold text-emerald-600">+Rp 3.000.000</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Jamaah BKG-5510294 (1 Pax)</p>
                    <p className="text-slate-400">02 Sep 2026 &bull; Paket Reguler VIP</p>
                  </div>
                  <span className="font-bold text-emerald-600">+Rp 1.500.000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
