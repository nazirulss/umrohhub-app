'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { PackageItem } from '@/types/marketplace';
import { BookingPaxInfo, PassportDocument } from '@/types/document';
import { ManasikDoaModal } from './ManasikDoaModal';
import { TopUpEscrowModal } from './TopUpEscrowModal';
import {
  ChevronRight,
  LogOut,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Plane,
  Ticket,
  FileText,
  Clock,
  Wallet,
  Share2,
  Copy,
  Building2,
  Users,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface AccountPageViewProps {
  onNavigateView: (
    view:
      | 'marketplace'
      | 'pdp'
      | 'passport'
      | 'biro'
      | 'admin'
      | 'schedule'
      | 'travel-dashboard'
      | 'map'
      | 'account'
      | 'escrow'
      | 'orders'
      | 'register-biro'
      | 'mitra-syiar'
  ) => void;
  onSelectPackage: (pkg: PackageItem) => void;
  recommendations: PackageItem[];
  bookingInfo?: BookingPaxInfo;
  documents?: Record<number, Partial<PassportDocument>>;
}

export function AccountPageView({
  onNavigateView,
  onSelectPackage,
  recommendations,
  bookingInfo,
  documents = {},
}: AccountPageViewProps) {
  const { user, logout, openAuthModal, quickLogin } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManasikModalOpen, setIsManasikModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [escrowBalance, setEscrowBalance] = useState<number>(1500000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Kalkulasi ringkasan progres paspor jamaah rombongan
  const totalPax = bookingInfo?.totalPax || 3;
  const docsList = Object.values(documents);
  const verifiedCount = docsList.filter((d) => d.status === 'TERVERIFIKASI').length;
  const pendingCount = docsList.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;
  const revisionCount = docsList.filter((d) => d.status === 'PERLU_REVISI').length;
  const incompleteCount = Math.max(0, totalPax - (verifiedCount + pendingCount + revisionCount));
  const readinessPercent = Math.round((verifiedCount / totalPax) * 100);

  // Pax khusus yang perlu revisi untuk alert spesifik
  const revisionPax = docsList.find((d) => d.status === 'PERLU_REVISI');

  // Callback sukses setor tabungan escrow
  const handleSuccessDeposit = (amount: number, bankName: string) => {
    setEscrowBalance((prev) => prev + amount);
    showToast(
      `Alhamdulillah! Setoran Rp ${amount.toLocaleString('id-ID')} via ${bankName} berhasil diamankan di Escrow Kemenag RI.`
    );
  };

  // Referral copy & share untuk Afiliasi
  const handleCopyReferral = () => {
    navigator.clipboard.writeText('https://umrohpedia.my.id/?ref=USTADZ-SALMAN');
    showToast('Tautan Syiar berhasil disalin ke clipboard!');
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      'Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nBagi bapak/ibu yang berniat menunaikan ibadah Umroh dengan amanah & resmi berizin Kemenag RI, mari mendaftar melalui tautan resmi ini:\nhttps://umrohpedia.my.id/?ref=USTADZ-SALMAN\n\n✅ Rekening Escrow Syariah Kemenag RI\n✅ 5 Pasti Umroh Terjamin\n\nSemoga menjadi wasilah ibadah yang mabrur.'
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  // Username & Initial logic sesuai role
  const username = user?.name
    ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'starmilstore';

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'ST';

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F5F7] text-[#212121] px-4 pt-3 pb-24 space-y-3 font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#212121]/95 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 max-w-[90vw]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="line-clamp-2">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. TOP BAR: BANTUAN & PENGATURAN (PENGATURAN ROLE SWITCHER)
         ========================================================================= */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-2">
          {user?.role === 'TRAVEL' && (
            <span className="text-[10px] font-bold bg-emerald-100 text-[#005B31] border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Akun Biro PPIU
            </span>
          )}
          {user?.role === 'AFFILIATE' && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Mitra Syiar Berkah
            </span>
          )}
          {user?.role === 'SUPER_ADMIN' && (
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" /> Pengawas Kemenag RI
            </span>
          )}
          {(!user || user?.role === 'CUSTOMER') && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Akun Jamaah Terlindungi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Help Center / CS Face Icon */}
          <button
            type="button"
            onClick={() => showToast('Pusat Bantuan & CS Siaga 24/7 Umrohpedia Kemenag RI')}
            className="text-[#212121] hover:opacity-75 transition-opacity p-1 cursor-pointer"
            title="Pusat Bantuan"
            aria-label="Pusat Bantuan"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none" />
              <path d="M4 12v-1a8 8 0 0 1 16 0v1" />
            </svg>
          </button>

          {/* Settings Gear Icon (Switch Role) */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="text-[#212121] hover:opacity-75 transition-opacity p-1 cursor-pointer relative"
            title="Pengaturan & Ganti Peran"
            aria-label="Pengaturan"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#03AC0E]" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. USER PROFILE HEADER (DYNAMIC USERNAME & BADGE ACCORDING TO ROLE)
         ========================================================================= */}
      <div className="flex items-center gap-3.5 py-1">
        {user ? (
          <>
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm tracking-widest shadow-sm flex-shrink-0 border ${
                  user.role === 'TRAVEL'
                    ? 'bg-[#005B31] text-white border-emerald-300'
                    : user.role === 'AFFILIATE'
                    ? 'bg-amber-700 text-amber-50 border-amber-300'
                    : user.role === 'SUPER_ADMIN'
                    ? 'bg-indigo-950 text-indigo-100 border-indigo-400'
                    : 'bg-[#18181B] text-white border-slate-300/40'
                }`}
              >
                {userInitials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#03AC0E] text-white p-0.5 rounded-full border-2 border-white shadow-2xs">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[18px] font-black text-[#212121] leading-tight truncate">
                {user.role === 'TRAVEL' ? user.travelName || user.name : user.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                {user.role === 'TRAVEL' ? (
                  <span className="text-[#007A41] font-semibold flex items-center gap-0.5 truncate">
                    <ShieldCheck className="w-3 h-3 shrink-0" />{' '}
                    {user.skKemenag || 'PPIU No. 412/2021'}
                  </span>
                ) : user.role === 'AFFILIATE' ? (
                  <span className="text-amber-800 font-semibold flex items-center gap-0.5 truncate">
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" /> Ustadz &amp; Agen Syiar
                    Resmi
                  </span>
                ) : user.role === 'SUPER_ADMIN' ? (
                  <span className="text-indigo-700 font-semibold flex items-center gap-0.5 truncate">
                    <ShieldCheck className="w-3 h-3 shrink-0" /> Auditor PHU Siskopatuh Kemenag
                  </span>
                ) : (
                  <>
                    <span>Member Jamaah 1448H</span>
                    <span>&bull;</span>
                    <span className="text-[#03AC0E] font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Terverifikasi Kemenag
                    </span>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={() => openAuthModal('CUSTOMER')}
            className="flex items-center gap-3.5 cursor-pointer w-full group"
          >
            <div className="w-14 h-14 rounded-full bg-[#18181B] text-white flex items-center justify-center font-black text-xs tracking-widest shadow-sm flex-shrink-0">
              STRML
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[19px] font-black text-[#212121] leading-tight group-hover:text-[#03AC0E] transition-colors">
                starmilstore
              </h1>
              <span className="text-xs text-[#03AC0E] font-bold">
                Masuk / Daftar Akun &rsaquo;
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. HERO CARD (ADAPTIF MENURUT PERAN PENGGUNA)
         ========================================================================= */}

      {/* -------------------------------------------------------------------------
          A. KARTU ROLE BIRO TRAVEL (TRAVEL) - RINGKASAN OPERASIONAL & KEMENAG
         ------------------------------------------------------------------------- */}
      {user?.role === 'TRAVEL' && (
        <div className="bg-gradient-to-br from-[#06331e] via-[#09472a] to-[#042817] rounded-2xl p-4 text-white space-y-3.5 shadow-md animate-in fade-in">
          <div className="flex items-start justify-between border-b border-emerald-800/60 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Portal Operasional PPIU Kemenag
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {user.travelName || 'Al-Madinah Tour & Travel'}
              </h2>
              <p className="text-[11px] text-emerald-200 font-mono mt-0.5">
                {user.skKemenag || 'PPIU No. 412/2021'} &bull; Akreditasi A
              </p>
            </div>
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full shrink-0">
              Aktif 1448H
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[10px] text-emerald-200 block">Jamaah Terdaftar</span>
              <span className="text-lg font-black text-white">48</span>
              <span className="text-[9px] text-emerald-300 block">Musim 1448H</span>
            </div>
            <div
              onClick={() => {
                window.location.hash = '#travel-dashboard';
                onNavigateView('travel-dashboard');
              }}
              className="bg-amber-400/15 border border-amber-400/30 rounded-xl p-2.5 backdrop-blur-xs cursor-pointer hover:bg-amber-400/25 transition-colors"
            >
              <span className="text-[10px] text-amber-200 block font-semibold">Paspor Pending</span>
              <span className="text-lg font-black text-amber-300">5 Berkas</span>
              <span className="text-[9px] text-amber-200 block font-bold">Verifikasi &rsaquo;</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[10px] text-emerald-200 block">Escrow Siap Klaim</span>
              <span className="text-[14px] font-black text-white">Rp 145 Jt</span>
              <span className="text-[9px] text-emerald-300 block">Aman di Bank Syariah</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[10px] text-emerald-200 block">Sisa Kuota Kursi</span>
              <span className="text-lg font-black text-white">12 Seat</span>
              <span className="text-[9px] text-emerald-300 block">Paket Ramadhan</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#travel-dashboard';
                onNavigateView('travel-dashboard');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#03AC0E] hover:bg-[#02900c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Verifikasi Paspor Jamaah (5 Pending)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#travel-dashboard';
                onNavigateView('travel-dashboard');
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>Buka Dashboard Operasional Biro</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          B. KARTU ROLE AFILIASI (AFFILIATE) - DASHBOARD KOMISI & LINK SYIAR WA
         ------------------------------------------------------------------------- */}
      {user?.role === 'AFFILIATE' && (
        <div className="bg-gradient-to-br from-[#1a382b] via-[#214a38] to-[#142e23] rounded-2xl p-4 text-white space-y-3.5 shadow-md animate-in fade-in">
          <div className="flex items-start justify-between border-b border-emerald-700/60 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                ⭐ Mitra Syiar Berkah Resmi
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{user.name}</h2>
              <p className="text-[11px] text-emerald-200/90 mt-0.5">
                Ustadz &amp; Agen Komunitas Dakwah &bull; Ujrah Halal
              </p>
            </div>
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full shrink-0">
              Aktif
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs col-span-1">
              <span className="text-[9.5px] text-emerald-200 block">Komisi Siap Tarik</span>
              <span className="text-[13px] font-black text-amber-300 block mt-0.5">
                Rp 9.000.000
              </span>
              <span className="text-[8.5px] text-emerald-300 block">BSI / Rekening</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs col-span-1">
              <span className="text-[9.5px] text-emerald-200 block">Jamaah Closing</span>
              <span className="text-lg font-black text-white block mt-0.5">6</span>
              <span className="text-[8.5px] text-emerald-300 block">Akad Sah</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs col-span-1">
              <span className="text-[9.5px] text-emerald-200 block">Kunjungan Link</span>
              <span className="text-lg font-black text-white block mt-0.5">148</span>
              <span className="text-[8.5px] text-emerald-300 block">Klik Total</span>
            </div>
          </div>

          {/* 1-Click Referral Link Box */}
          <div className="bg-black/25 rounded-xl p-3 space-y-2 border border-emerald-500/20">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">Link Syiar Referral Anda:</span>
              <span className="font-mono text-amber-300 font-bold text-[10px]">
                KODE: USTADZ-SALMAN
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1.5 border border-white/10">
              <span className="text-[11px] font-mono text-emerald-300 truncate flex-1 px-1">
                umrohpedia.my.id/?ref=USTADZ-SALMAN
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="py-1 px-2.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>Salin</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Ajakan Umroh ke WhatsApp</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                showToast(
                  'Permintaan penarikan komisi Rp 9.000.000 telah diajukan ke BSI Rek: 7129038101.'
                )
              }
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Tarik Komisi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#mitra-syiar';
                onNavigateView('mitra-syiar');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Dashboard Syiar &rsaquo;</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          C. KARTU ROLE SUPER ADMIN (KEMENAG REGULATOR & AUDITOR)
         ------------------------------------------------------------------------- */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white space-y-3.5 shadow-md animate-in fade-in">
          <div className="flex items-start justify-between border-b border-indigo-800/50 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                🛡️ Pengawas Siskopatuh Kemenag RI
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{user.name}</h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Auditor PHU &bull; Pengawasan Rekening Bersama Escrow
              </p>
            </div>
            <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full shrink-0">
              Super Admin
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">Biro Berizin</span>
              <span className="text-lg font-black text-white">42 PPIU</span>
              <span className="text-[9px] text-emerald-400 block">100% Sah</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">Dana Terproteksi</span>
              <span className="text-[13px] font-black text-white">Rp 12.8 M</span>
              <span className="text-[9px] text-indigo-300 block">Escrow Syariah</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">Jamaah Terlantar</span>
              <span className="text-lg font-black text-emerald-400">0</span>
              <span className="text-[9px] text-slate-300 block">Zero Fraud</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#admin';
              onNavigateView('admin');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Buka Console Audit Kemenag RI</span>
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          D. KARTU ROLE JAMAAH (CUSTOMER) - PRIORITAS UTAMA 80%: ESCROW & 5 PASTI
         ------------------------------------------------------------------------- */}
      {(!user || user?.role === 'CUSTOMER') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
          {/* Row 1: Dual Cards (50 - 50 Grid) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Card Kiri: Tabungan Umroh / Saldo Escrow Interaktif */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-slate-50 border border-emerald-100 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div>
                <div className="flex items-center justify-between text-[10.5px] text-slate-600 font-medium">
                  <span className="truncate">Tabungan / Escrow</span>
                  <span className="text-[9px] font-bold text-[#007A41] bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
                    Syariah
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-0.5">
                  <span className="text-[11px] font-bold text-[#212121]">Rp</span>
                  <span className="text-[17px] font-black text-[#212121] tracking-tight">
                    {escrowBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Target: Rp 29.500.000
                </div>
              </div>

              {/* Setor Cepat & Mutasi */}
              <div className="pt-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(true)}
                  className="flex-1 py-1 px-2 rounded-lg bg-[#005B31] hover:bg-[#004726] text-white font-bold text-[10.5px] text-center transition-colors cursor-pointer shadow-2xs"
                >
                  + Setor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#escrow';
                    onNavigateView('escrow');
                  }}
                  className="py-1 px-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-[10px] text-center transition-colors cursor-pointer"
                >
                  Mutasi
                </button>
              </div>
            </div>

            {/* Card Kanan: 5 PASTI UMROH 🛡️ / UMROH PLUS 👑 */}
            <div
              onClick={() =>
                showToast(
                  '5 Pasti Umroh Kemenag: Pasti Travelnya, Pasti Jadwalnya, Pasti Terbangnya, Pasti Hotelnya, Pasti Visanya.'
                )
              }
              className="bg-gradient-to-br from-[#005B31] via-[#006E3B] to-[#007A41] rounded-xl p-3 text-white flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-2xs"
            >
              {/* Silhouette art */}
              <div className="absolute right-0 -bottom-1 opacity-20">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="italic font-black text-[12px] tracking-wider text-[#F59E0B] flex items-center gap-1">
                    5 PASTI UMROH 🛡️
                  </span>
                  <span className="text-[9px] font-bold bg-[#F59E0B]/20 text-[#FDE68A] px-1 py-0.2 rounded">
                    PLUS 👑
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-bold text-white leading-tight">
                  Garansi PPIU Berizin
                </div>
                <div className="text-[9.5px] text-emerald-100/90 leading-tight">
                  Manasik eksklusif &amp; amanah
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Horizontal Quick Benefit Strip with Dividers */}
          <div className="flex items-center justify-between pt-1">
            {/* Item 1: Voucher Berkah */}
            <button
              type="button"
              onClick={() => showToast('2 Voucher Berkah: Kupon Diskon Ramadhan & Pelunasan Akad')}
              className="flex-1 flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="text-[#E02954] mb-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 5H3a1 1 0 0 0-1 1v4a2 2 0 0 1 0 4v4a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4a2 2 0 0 1 0-4V6a1 1 0 0 0-1-1zm-6.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </div>
              <div className="text-[13px] font-black text-[#212121] leading-none mb-0.5">2</div>
              <div className="text-[9.5px] text-slate-500 leading-tight">Voucher berkah</div>
            </button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-slate-200" />

            {/* Item 2: Perlengkapan Jamaah */}
            <button
              type="button"
              onClick={() =>
                showToast(
                  'Perlengkapan Jamaah: Koper 24", Kain Ihram/Mukena & Seragam Batik Siap Kirim'
                )
              }
              className="flex-1 flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="text-[#03AC0E] mb-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z" />
                </svg>
              </div>
              <div className="text-[13px] font-black text-[#212121] leading-none mb-0.5">1 Paket</div>
              <div className="text-[9.5px] text-slate-500 leading-tight">Perlengkapan</div>
            </button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-slate-200" />

            {/* Item 3: Rekening Escrow */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#escrow';
                onNavigateView('escrow');
              }}
              className="flex-1 flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="text-[#0088CC] mb-0.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-[12px] font-bold text-[#212121] leading-none mb-0.5">
                100% Aman
              </div>
              <div className="text-[9.5px] text-slate-500 leading-tight">Rekening Escrow</div>
            </button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-slate-200" />

            {/* Item 4: Menu Lainnya */}
            <button
              type="button"
              onClick={() => showToast('Perlindungan Asuransi Jiwa & Rekening Terdaftar Kemenag RI')}
              className="px-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Menu Lainnya"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. JAMAAH: KARTU IBADAH AKTIF BERJALAN (ACTIVE BOOKING SUMMARY)
         ========================================================================= */}
      {(!user || user?.role === 'CUSTOMER') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-[14px] font-bold text-[#212121]">Ibadah Aktif Berjalan</h2>
            </div>
            {revisionCount > 0 ? (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> 1 Dokumen Perlu Revisi
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-50 text-[#007A41] border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Berkas Terjadwal
              </span>
            )}
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-3.5 text-white space-y-2.5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider block">
                  KODE: UH-2026-RAMADHAN
                </span>
                <h3 className="text-xs font-bold text-white truncate mt-0.5">
                  {bookingInfo?.packageName || 'Paket Umroh Bintang 5 Awal Ramadhan 1448H'}
                </h3>
                <p className="text-[10.5px] text-slate-300 mt-0.5 truncate">
                  {bookingInfo?.travelName || 'PT. Al-Falah Berkah Mandiri (PPIU No. 412/2021)'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 ml-2">
                <Plane className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-[10.5px]">
              <div>
                <span className="text-slate-400 block text-[9.5px]">Jadwal Terbang:</span>
                <span className="font-semibold text-slate-100">15 Okt 2026 (9 Hari)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9.5px]">Rombongan Keluarga:</span>
                <span className="font-semibold text-slate-100">{totalPax} Jamaah Terdaftar</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#orders';
                  onNavigateView('orders');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-white/15 hover:bg-white/20 text-white font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>E-Tiket &amp; Akad</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#passport';
                  onNavigateView('passport');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#03AC0E] hover:bg-[#02900c] text-white font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cek Dokumen Paspor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. JAMAAH: SIKLUS 5 TAHAPAN TRANSAKSI IBADAH
         ========================================================================= */}
      {(!user || user?.role === 'CUSTOMER') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
          <div
            onClick={() => {
              window.location.hash = '#orders';
              onNavigateView('orders');
            }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <h2 className="text-[15px] font-bold text-[#212121]">Transaksi Ibadah</h2>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="grid grid-cols-5 gap-1 text-center">
            {/* 1. Belum Bayar */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#orders?tab=unpaid';
                onNavigateView('orders');
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
              <span className="text-[10px] text-[#212121] leading-tight">Belum bayar</span>
            </button>

            {/* 2. Verifikasi Dokumen & Visa */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#orders?tab=verification';
                onNavigateView('orders');
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group relative"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#FA591D]" />
              <span className="text-[10px] text-[#212121] leading-tight">Verifikasi</span>
            </button>

            {/* 3. Siap Terbang (Tiket PNR & Hotel) */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#orders?tab=ready';
                onNavigateView('orders');
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
              <span className="text-[10px] text-[#212121] leading-tight">Siap terbang</span>
            </button>

            {/* 4. Di Tanah Suci (Ka'bah / Ibadah) */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#orders?tab=active';
                onNavigateView('orders');
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="10" x2="20" y2="10" strokeDasharray="2 2" />
                </svg>
              </div>
              <span className="text-[10px] text-[#212121] leading-tight">Di Tanah Suci</span>
            </button>

            {/* 5. Ulasan Biro */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#orders?tab=completed';
                onNavigateView('orders');
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="text-[10px] text-[#212121] leading-tight">Ulasan biro</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. JAMAAH: VALIDASI ALUR PASPOR ROMBONGAN KELUARGA (MULTI-PAX READINESS)
         ========================================================================= */}
      {(!user || user?.role === 'CUSTOMER') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
          <div
            onClick={() => {
              window.location.hash = '#passport';
              onNavigateView('passport');
            }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-[#212121]">
                Dokumen Paspor Rombongan
              </h2>
              <span className="text-[10px] font-bold bg-[#E5F9F0] text-[#007A41] px-1.5 py-0.5 rounded">
                {readinessPercent}% Siap
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="bg-[#F7F8FA] border border-[#E5E7E9] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 truncate">
                {bookingInfo?.packageName || 'Paket Umroh Bintang 5 Awal Ramadhan'}
              </span>
              <span className="text-[11px] font-bold text-[#03AC0E] shrink-0">
                {verifiedCount}/{totalPax} Paspor Sah
              </span>
            </div>

            {/* Multi-Pax Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(verifiedCount / totalPax) * 100}%` }}
                className="bg-[#03AC0E] transition-all"
                title={`${verifiedCount} Terverifikasi`}
              />
              <div
                style={{ width: `${(revisionCount / totalPax) * 100}%` }}
                className="bg-[#FA591D] transition-all"
                title={`${revisionCount} Perlu Revisi`}
              />
              <div
                style={{ width: `${(pendingCount / totalPax) * 100}%` }}
                className="bg-[#0088CC] transition-all"
                title={`${pendingCount} Menunggu Verifikasi`}
              />
            </div>

            {/* Checklist Legenda */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#03AC0E]" /> {verifiedCount} Sah
                <span className="w-1.5 h-1.5 rounded-full bg-[#FA591D] ml-1" /> {revisionCount} Revisi
                {incompleteCount > 0 && (
                  <span className="text-slate-400 ml-1">({incompleteCount} Belum Unggah)</span>
                )}
              </span>
              <span
                className="font-bold text-[#007A41] hover:underline cursor-pointer"
                onClick={() => {
                  window.location.hash = '#passport';
                  onNavigateView('passport');
                }}
              >
                Kelola Semua &rsaquo;
              </span>
            </div>

            {/* Kemenag Specific Warning Banner jika ada revisi */}
            {revisionPax && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1.5">
                <div className="flex items-start gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Perhatian Kemenag: Paspor Pax {revisionPax.paxIndex}{' '}
                    {revisionPax.fullName ? `(${revisionPax.fullName})` : ''} Perlu Diperbaiki
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 leading-snug pl-5">
                  {revisionPax.rejectionReason ||
                    'Masa berlaku paspor tersisa kurang dari 7 bulan pada tanggal terbang (15 Okt 2026). Harap segera perpanjang di Kantor Imigrasi.'}
                </p>
                <div className="pl-5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#passport';
                      onNavigateView('passport');
                    }}
                    className="py-1 px-2.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-2xs"
                  >
                    Perbaiki Dokumen Pax {revisionPax.paxIndex} Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* Mini Pax Roster */}
            <div className="divide-y divide-slate-200/70 pt-1 text-[11px]">
              <div className="py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    1
                  </span>
                  <span className="font-medium text-slate-900">
                    {documents[1]?.fullName || 'MUHAMMAD AHMAD FAUZI'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#03AC0E] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  ✓ Sah (Exp: 2032)
                </span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-medium text-slate-900">
                    {documents[2]?.fullName || 'SITI NUR FATIMAH'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#FA591D] bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                  ⚠️ Perlu Revisi (&lt; 7 Bln)
                </span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <span className="font-medium text-slate-500">Jamaah 3 (Belum Diisi)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  ⏳ Belum Upload
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. JAMAAH: DUA FITUR KHAS UMROH (MANASIK OFFLINE & KONTAK DARURAT)
         ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Fitur A: Panduan Doa & Manasik Offline */}
        <div
          onClick={() => setIsManasikModalOpen(true)}
          className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-[#005B31] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#005B31] flex items-center justify-center text-lg">
              📖
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100/70 text-[#005B31] px-1.5 py-0.5 rounded-full">
              Offline
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#005B31] transition-colors leading-tight">
              Panduan Doa &amp; Manasik
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              Doa Thawaf 1-7, Sa&apos;i, &amp; Niat Ihram
            </p>
          </div>
        </div>

        {/* Fitur B: Kontak Darurat Muthawif & Kemenag */}
        <div
          onClick={() => setIsEmergencyModalOpen(true)}
          className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
              🚨
            </div>
            <span className="text-[9.5px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
              Hotline
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors leading-tight">
              Kontak Darurat Jamaah
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              Muthawif Saudi &amp; Kemenag RI
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. CARD MENU LAINNYA
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
        <h2 className="text-[15px] font-bold text-[#212121]">Menu lainnya</h2>

        <div className="grid grid-cols-4 gap-2 text-center">
          {/* 1. Buka Biro PPIU */}
          <button
            type="button"
            onClick={() => {
              if (user?.role === 'TRAVEL') {
                window.location.hash = '#travel-dashboard';
                onNavigateView('travel-dashboard');
              } else {
                window.location.hash = '#register-biro';
                onNavigateView('register-biro');
              }
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                <path d="M2 7h20" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">
              {user?.role === 'TRAVEL' ? 'Dashboard Biro' : 'Buka Biro PPIU'}
            </span>
          </button>

          {/* 2. Mitra Syiar */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#mitra-syiar';
              onNavigateView('mitra-syiar');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <path d="M8.5 7.5 15.5 16.5" />
                <path d="M15.5 7.5 8.5 16.5" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Mitra Syiar</span>
          </button>

          {/* 3. Rencana Ibadah */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#marketplace';
              onNavigateView('marketplace');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Rencana Ibadah</span>
          </button>

          {/* 4. Biro Favorit */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#travels';
              onNavigateView('biro');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M2 7h20" />
                <path d="M12 11.5c.8-1 2.3-1 3.1 0 .8.9.8 2.2 0 3.1l-3.1 3.1-3.1-3.1c-.8-.9-.8-2.2 0-3.1.8-1 2.3-1 3.1 0Z" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Biro Favorit</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          9. MUNGKIN KAMU SUKA INI (2-COLUMN PRODUCT RECOMMENDATION)
         ========================================================================= */}
      <div className="space-y-3 pt-1">
        <h2 className="text-[16px] font-bold text-[#212121]">Mungkin kamu suka ini</h2>

        <div className="grid grid-cols-2 gap-2.5">
          {recommendations.slice(0, 6).map((pkg, idx) => {
            const discountPill = idx % 2 === 0 ? '-36%' : '-31%';
            const formattedPrice = `Rp${pkg.price.toLocaleString('id-ID')}`;

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Image Aspect 1:1 with Discount Tag */}
                <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Red Discount Pill (Top Right) */}
                  <span className="absolute top-1.5 right-1.5 bg-[#E02954] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                    {discountPill}
                  </span>
                </div>

                {/* Content */}
                <div className="p-2.5 flex flex-col justify-between flex-1 gap-1">
                  <div>
                    <h3 className="text-[12px] text-slate-800 line-clamp-2 leading-snug font-normal">
                      {pkg.title}
                    </h3>
                    <div className="text-[13px] font-black text-[#212121] mt-1 tracking-tight">
                      {formattedPrice}
                    </div>
                  </div>

                  {/* Cashback Badge */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9.5px] font-bold text-[#03AC0E] bg-[#E5F9F0] px-1 py-0.2 rounded">
                      Cashback 1.5Jt
                    </span>
                  </div>

                  {/* Location & Rating */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[80px]">
                      {pkg.departureCity || 'Jakarta'}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#F59E0B] font-bold">
                      ★ 4.9
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          10. MODAL SETOR TABUNGAN ESCROW LANGSUNG DARI HALAMAN AKUN
         ========================================================================= */}
      <TopUpEscrowModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccessDeposit={handleSuccessDeposit}
      />

      {/* =========================================================================
          11. MODAL PANDUAN MANASIK & DOA OFFLINE
         ========================================================================= */}
      <ManasikDoaModal
        isOpen={isManasikModalOpen}
        onClose={() => setIsManasikModalOpen(false)}
      />

      {/* =========================================================================
          12. MODAL KONTAK DARURAT MUTHAWIF & KEMENAG
         ========================================================================= */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 className="text-sm font-bold text-[#212121] leading-tight">
                    Kontak Darurat Jamaah
                  </h3>
                  <p className="text-[10px] text-slate-500">Siaga 24 Jam di Arab Saudi &amp; RI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Muthawif Makkah */}
              <a
                href="https://wa.me/966501234567"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-emerald-950 block">Ustadz Ridwan (Muthawif Makkah)</strong>
                  <span className="text-[11px] text-emerald-700 font-mono">+966 50 123 4567</span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2 py-1 rounded-lg">
                  WhatsApp
                </span>
              </a>

              {/* Tour Leader Bandara */}
              <a
                href="tel:+6281299887766"
                className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-sky-950 block">Tour Leader Bandara Soetta/JED</strong>
                  <span className="text-[11px] text-sky-700 font-mono">+62 812 9988 7766</span>
                </div>
                <span className="text-xs font-bold text-sky-800 bg-sky-200/80 px-2 py-1 rounded-lg">
                  Telepon
                </span>
              </a>

              {/* Hotline Kemenag RI */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Hotline Pengaduan Umroh Kemenag RI</strong>
                  <span className="text-[11px] text-slate-500 font-mono">Call Center: 134</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-lg">
                  Resmi RI
                </span>
              </div>

              {/* KJRI Jeddah */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">KJRI Jeddah (Perlindungan WNI)</strong>
                  <span className="text-[11px] text-slate-500 font-mono">+966 50 361 7487</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-lg">
                  Konsulat
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          13. SETTINGS & 4-ROLE SWITCHER MODAL (SIMULASI 1-KLIK SEMUA PERAN)
         ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#212121]">Pengaturan Akun &amp; Peran</h3>
                <p className="text-[10.5px] text-slate-500">Uji coba simulasi 4 jenis akun</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">
                Simulasi Peran Pengguna (1-Klik):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Jamaah */}
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('CUSTOMER');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Akun Jamaah Terdaftar');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${
                    !user || user.role === 'CUSTOMER'
                      ? 'border-[#03AC0E] bg-emerald-50/60 text-[#005B31]'
                      : 'border-slate-200 hover:border-[#03AC0E] text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Jamaah</span>
                  </div>
                  {(!user || user.role === 'CUSTOMER') && (
                    <Check className="w-3.5 h-3.5 text-[#03AC0E]" />
                  )}
                </button>

                {/* 2. Biro Travel */}
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('TRAVEL');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Akun Biro PPIU (Al-Madinah)');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${
                    user?.role === 'TRAVEL'
                      ? 'border-[#03AC0E] bg-emerald-50/60 text-[#005B31]'
                      : 'border-slate-200 hover:border-[#03AC0E] text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🏢</span>
                    <span>Biro Travel</span>
                  </div>
                  {user?.role === 'TRAVEL' && (
                    <Check className="w-3.5 h-3.5 text-[#03AC0E]" />
                  )}
                </button>

                {/* 3. Super Admin */}
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('SUPER_ADMIN');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Akun Pengawas Kemenag');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${
                    user?.role === 'SUPER_ADMIN'
                      ? 'border-[#03AC0E] bg-emerald-50/60 text-[#005B31]'
                      : 'border-slate-200 hover:border-[#03AC0E] text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Super Admin</span>
                  </div>
                  {user?.role === 'SUPER_ADMIN' && (
                    <Check className="w-3.5 h-3.5 text-[#03AC0E]" />
                  )}
                </button>

                {/* 4. Afiliasi */}
                <button
                  type="button"
                  onClick={async () => {
                    await quickLogin('AFFILIATE');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Akun Mitra Syiar (Ustadz Salman)');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${
                    user?.role === 'AFFILIATE'
                      ? 'border-[#03AC0E] bg-emerald-50/60 text-[#005B31]'
                      : 'border-slate-200 hover:border-[#03AC0E] text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>Afiliasi</span>
                  </div>
                  {user?.role === 'AFFILIATE' && (
                    <Check className="w-3.5 h-3.5 text-[#03AC0E]" />
                  )}
                </button>
              </div>
            </div>

            {user && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setIsSettingsOpen(false);
                    showToast('Berhasil keluar dari akun.');
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
