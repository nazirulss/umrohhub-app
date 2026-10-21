'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { PackageItem } from '@/types/marketplace';
import { BookingPaxInfo, PassportDocument } from '@/types/document';
import {
  ChevronRight,
  LogOut,
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Kalkulasi ringkasan progres paspor jamaah
  const totalPax = bookingInfo?.totalPax || 3;
  const docsList = Object.values(documents);
  const verifiedCount = docsList.filter((d) => d.status === 'TERVERIFIKASI').length;
  const pendingCount = docsList.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;
  const revisionCount = docsList.filter((d) => d.status === 'PERLU_REVISI').length;
  const readinessPercent = Math.round((verifiedCount / totalPax) * 100);

  // Username display ala Tokopedia (lowercase username)
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
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#212121]/95 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. TOP BAR: HELP & SETTINGS ICONS (EXACT TOKOPEDIA TOP RIGHT)
         ========================================================================= */}
      <div className="flex items-center justify-end gap-3 pt-1 pb-1">
        {/* Help Center / CS Face Icon */}
        <button
          type="button"
          onClick={() => showToast('Pusat Bantuan & CS Siaga 24/7 Tokopedia/UmrohHub')}
          className="text-[#212121] hover:opacity-75 transition-opacity p-1 cursor-pointer"
          title="Pusat Bantuan"
          aria-label="Pusat Bantuan"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Friendly CS Face with Headset */}
            <circle cx="12" cy="12" r="9" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none" />
            <path d="M4 12v-1a8 8 0 0 1 16 0v1" />
          </svg>
        </button>

        {/* Settings Gear Icon */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="text-[#212121] hover:opacity-75 transition-opacity p-1 cursor-pointer"
          title="Pengaturan & Ganti Peran"
          aria-label="Pengaturan"
        >
          <svg
            width="24"
            height="24"
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
        </button>
      </div>

      {/* =========================================================================
          2. USER PROFILE ROW (CIRCULAR AVATAR + USERNAME)
         ========================================================================= */}
      <div className="flex items-center gap-3.5 py-1">
        {user ? (
          <>
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#18181B] text-white flex items-center justify-center font-black text-sm tracking-widest shadow-sm flex-shrink-0 border border-slate-300/40">
                {userInitials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#03AC0E] text-white p-0.5 rounded-full border-2 border-white shadow-2xs">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-[19px] font-black text-[#212121] leading-tight truncate">
                {username}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <span>Member Jamaah</span>
                <span>&bull;</span>
                <span className="text-[#03AC0E] font-semibold">Terverifikasi</span>
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
          3. TOP WHITE CARD (DUAL CARDS + BENEFIT STRIP ALA TOKOPEDIA)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
        {/* Row 1: Dual Cards (50 - 50 Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card Kiri: Hematmu 12 bulan ini */}
          <div
            onClick={() => showToast('Total hematmu dari cashback & diskon: Rp 1.500.000')}
            className="bg-[#F7F8FA] border border-[#E5E7E9] rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Hematmu 12 bulan ini</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-0.5">
              <span className="text-[11px] font-bold text-[#212121]">Rp</span>
              <span className="text-[18px] font-black text-[#212121] tracking-tight">
                1.500.000
              </span>
            </div>
          </div>

          {/* Card Kanan: Tokopedia PLUS Banner */}
          <div
            onClick={() =>
              showToast('Tokopedia/UmrohHub PLUS: Akses diskon ekstra & handling prioritas!')
            }
            className="bg-gradient-to-br from-[#005B31] via-[#006E3B] to-[#007A41] rounded-xl p-3 text-white flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-2xs"
          >
            {/* Voucher background art */}
            <div className="absolute right-1 -top-1 opacity-25">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" strokeDasharray="2 2" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="italic font-black text-[13px] tracking-wider text-[#F59E0B]">
                  PLUS
                </span>
                <span className="text-[9px] font-bold bg-[#F59E0B]/20 text-[#FDE68A] px-1 py-0.2 rounded">
                  %
                </span>
              </div>
              <div className="mt-1 text-[11px] font-bold text-white leading-tight">
                Selalu diskon
              </div>
              <div className="text-[10px] text-white/80 leading-tight">
                setiap belanja
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Horizontal Quick Benefit Strip with Dividers */}
        <div className="flex items-center justify-between pt-1">
          {/* Item 1: Voucher Belanja */}
          <button
            type="button"
            onClick={() => showToast('4 Voucher belanja umroh & diskon aktif!')}
            className="flex-1 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="text-[#E02954] mb-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 5H3a1 1 0 0 0-1 1v4a2 2 0 0 1 0 4v4a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4a2 2 0 0 1 0-4V6a1 1 0 0 0-1-1zm-6.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              </svg>
            </div>
            <div className="text-[13px] font-black text-[#212121] leading-none mb-0.5">4</div>
            <div className="text-[9.5px] text-slate-500 leading-tight">Voucher belanja</div>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-200" />

          {/* Item 2: Voucher Ongkir */}
          <button
            type="button"
            onClick={() => showToast('36 Voucher ongkir & handling koper tersedia!')}
            className="flex-1 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="text-[#03AC0E] mb-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-11 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 6h-4v6h6V8.5L19 6zM2 5v10h2.1a4 4 0 0 1 7.8 0h3.2a4 4 0 0 1 7.8 0H22V4H2v1z" />
              </svg>
            </div>
            <div className="text-[13px] font-black text-[#212121] leading-none mb-0.5">36</div>
            <div className="text-[9.5px] text-slate-500 leading-tight">Voucher ongkir</div>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-200" />

          {/* Item 3: Belanja Bonus */}
          <button
            type="button"
            onClick={() => showToast('Bonus belanja syiar & cashback Rp 1.500.000')}
            className="flex-1 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="text-[#F59E0B] mb-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V18h-2v-1.07A4 4 0 0 1 8 13h2a2 2 0 0 0 4 0c0-1.5-2.5-1.5-3.5-2.5S9 8.5 9 7a4 4 0 0 1 2-3.46V2h2v1.54A4 4 0 0 1 16 7h-2a2 2 0 0 0-4 0c0 1.5 2.5 1.5 3.5 2.5s1.5 2 1.5 3.5a4 4 0 0 1-2 3.93z" />
              </svg>
            </div>
            <div className="text-[12px] font-bold text-[#03AC0E] leading-none mb-0.5">Belanja</div>
            <div className="text-[9.5px] text-slate-500 leading-tight">Bonus</div>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-200" />

          {/* Item 4: Tokopedia Card */}
          <button
            type="button"
            onClick={() => showToast('Tokopedia Card / Escrow Syariah Kemenag Aktif')}
            className="flex-1 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="text-[#0088CC] mb-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="text-[12px] font-bold text-[#212121] leading-none mb-0.5">Daftar</div>
            <div className="text-[9.5px] text-slate-500 leading-tight">Tokopedia Card</div>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-200" />

          {/* Item 5: Three Dots */}
          <button
            type="button"
            onClick={() => showToast('Menu ringkasan saldo & voucher lainnya')}
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

      {/* =========================================================================
          4. CARD TRANSAKSI (EXACT 5 STATUS TOKOPEDIA ICONS)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
        <div
          onClick={() => {
            window.location.hash = '#passport';
            onNavigateView('passport');
          }}
          className="flex items-center justify-between cursor-pointer group"
        >
          <h2 className="text-[15px] font-bold text-[#212121]">Transaksi</h2>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div className="grid grid-cols-5 gap-1 text-center">
          {/* 1. Belum Bayar */}
          <button
            type="button"
            onClick={() => showToast('Tidak ada tagihan yang belum dibayar.')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Belum bayar</span>
          </button>

          {/* 2. Diproses */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#passport';
              onNavigateView('passport');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Diproses</span>
          </button>

          {/* 3. Dikirim / Keberangkatan */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#passport';
              onNavigateView('passport');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 17h4V5H2v12h3" />
                <path d="M14 8h4.5l2.5 3.5V17h-3" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Dikirim</span>
          </button>

          {/* 4. Sudah Tiba */}
          <button
            type="button"
            onClick={() => showToast('Jadwal kepulangan & tiba di tanah air.')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Sudah tiba</span>
          </button>

          {/* 5. Ulasan */}
          <button
            type="button"
            onClick={() => showToast('Beri ulasan pengalaman ibadah bersama biro PPIU.')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="text-[10.5px] text-[#212121] leading-tight">Ulasan</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          5. DOKUMEN & PASPOR JAMAAH WIDGET (KHAS UMROHHUB TOKOPEDIA STYLE)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3">
        <div
          onClick={() => {
            window.location.hash = '#passport';
            onNavigateView('passport');
          }}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#212121]">
              Dokumen Paspor &amp; Manifes
            </h2>
            <span className="text-[10px] font-bold bg-[#E5F9F0] text-[#007A41] px-1.5 py-0.5 rounded">
              {readinessPercent}% Siap
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div className="bg-[#F7F8FA] border border-[#E5E7E9] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 truncate">
              {bookingInfo?.packageName || 'Paket Umroh Bintang 5 Ramadhan'}
            </span>
            <span className="text-[11px] font-bold text-[#03AC0E] shrink-0">
              {verifiedCount}/{totalPax} Jamaah
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(verifiedCount / totalPax) * 100}%` }}
              className="bg-[#03AC0E] transition-all"
            />
            <div
              style={{ width: `${(revisionCount / totalPax) * 100}%` }}
              className="bg-[#FA591D] transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>Terverifikasi Kemenag</span>
            <span className="font-medium text-[#03AC0E] underline cursor-pointer" onClick={() => { window.location.hash = '#passport'; onNavigateView('passport'); }}>
              Lengkapi Paspor &rsaquo;
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. CARD MENU LAINNYA (EXACT 4 ICONS: BUKA TOKO, AFFILIATE, WISHLIST, TOKO FAVORIT)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3.5">
        <h2 className="text-[15px] font-bold text-[#212121]">Menu lainnya</h2>

        <div className="grid grid-cols-4 gap-2 text-center">
          {/* 1. Buka toko / Buka Biro PPIU */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#travel-dashboard';
              onNavigateView('travel-dashboard');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                <path d="M2 7h20" />
              </svg>
            </div>
            <span className="text-[11px] text-[#212121] leading-tight">Buka toko</span>
          </button>

          {/* 2. Affiliate */}
          <button
            type="button"
            onClick={() => showToast('Program Kemitraan Syiar & Afiliasi Digital UmrohHub')}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <path d="M8.5 7.5 15.5 16.5" />
                <path d="M15.5 7.5 8.5 16.5" />
              </svg>
            </div>
            <span className="text-[11px] text-[#212121] leading-tight">Affiliate</span>
          </button>

          {/* 3. Wishlist */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#marketplace';
              onNavigateView('marketplace');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-[11px] text-[#212121] leading-tight">Wishlist</span>
          </button>

          {/* 4. Toko favorit */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#travels';
              onNavigateView('biro');
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-7 h-7 flex items-center justify-center text-[#212121]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M2 7h20" />
                <path d="M12 11.5c.8-1 2.3-1 3.1 0 .8.9.8 2.2 0 3.1l-3.1 3.1-3.1-3.1c-.8-.9-.8-2.2 0-3.1.8-1 2.3-1 3.1 0Z" />
              </svg>
            </div>
            <span className="text-[11px] text-[#212121] leading-tight">Toko favorit</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          7. MUNGKIN KAMU SUKA INI (2-COLUMN EXACT TOKOPEDIA PRODUCT CARD)
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
          8. SETTINGS & ROLE SWITCHER MODAL (PENGATURAN TOKOPEDIA)
         ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#212121]">Pengaturan Akun &amp; Peran</h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block">
                Simulasi Peran Pengguna (1-Klik):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    quickLogin('CUSTOMER');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Jamaah');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#03AC0E] text-xs font-bold text-slate-800 text-left flex items-center gap-2 cursor-pointer"
                >
                  <span>👤</span>
                  <span>Jamaah</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickLogin('TRAVEL');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Biro PPIU');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#03AC0E] text-xs font-bold text-slate-800 text-left flex items-center gap-2 cursor-pointer"
                >
                  <span>🏢</span>
                  <span>Biro Travel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickLogin('SUPER_ADMIN');
                    setIsSettingsOpen(false);
                    showToast('Beralih ke Super Admin');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#03AC0E] text-xs font-bold text-slate-800 text-left flex items-center gap-2 cursor-pointer"
                >
                  <span>🛡️</span>
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    showToast('Peran Afiliasi Aktif');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#03AC0E] text-xs font-bold text-slate-800 text-left flex items-center gap-2 cursor-pointer"
                >
                  <span>💰</span>
                  <span>Afiliasi</span>
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
