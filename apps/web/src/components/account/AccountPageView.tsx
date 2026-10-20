'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PackageItem } from '@/types/marketplace';
import { BookingPaxInfo, PassportDocument } from '@/types/document';
import { PackageCard } from '@/components/marketplace/PackageCard';
import {
  User,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  Ticket,
  Package,
  Sparkles,
  ChevronRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Phone,
  HelpCircle,
  ExternalLink,
  Plane,
  Clock,
  Heart,
  Share2,
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
  const [showPromoAlert, setShowPromoAlert] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Kalkulasi ringkasan progres paspor jamaah
  const totalPax = bookingInfo?.totalPax || 3;
  const docsList = Object.values(documents);
  const verifiedCount = docsList.filter((d) => d.status === 'TERVERIFIKASI').length;
  const pendingCount = docsList.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;
  const revisionCount = docsList.filter((d) => d.status === 'PERLU_REVISI').length;
  const readinessPercent = Math.round((verifiedCount / totalPax) * 100);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'JM';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-20">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER PROFIL TOKOPEDIA STYLE
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {user.name}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    ⭐ Member Jamaah 1448H
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Terverifikasi Kemenag
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Bantuan / Hubungi CS */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  showToast('CS Siaga 24/7 UmrohHub: WhatsApp Resmi +62 812-9900-8800')
                }
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Pusat Bantuan & WhatsApp CS"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Masuk ke Akun UmrohHub</h2>
                <p className="text-xs text-slate-500">
                  Akses riwayat pemesanan, dokumen paspor, dan voucher berkah.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => openAuthModal('CUSTOMER')}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('CUSTOMER')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Daftar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. KARTU SALDO & PRIVILEGE MEMBER (2-COLUMN TOKOPEDIA STYLE)
         ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() =>
            showToast('Hemat Rp 1.500.000 dengan Program Early Bird & Cashback Syiar!')
          }
          className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-col justify-between hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Hematmu musim ini</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Rp 1.500.000
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Garansi Escrow Amanah
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            showToast('Umroh Plus VIP: Prioritas Fast-Track Imigrasi & Manasik Privat Eksklusif.')
          }
          className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl text-white shadow-2xs p-3.5 flex flex-col justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between text-[11px] text-emerald-200">
            <span className="font-extrabold tracking-wide text-amber-300 flex items-center gap-1">
              UMROH PLUS 👑
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-xs sm:text-sm font-bold text-white leading-tight">
              Ibadah Tenang &amp; Berkah
            </div>
            <div className="text-[10px] text-emerald-100/90 mt-0.5">
              Handling koper &amp; batik gratis
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. QUICK BENEFIT STRIP (PITA 4 MANFAAT TOKOPEDIA STYLE)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 flex items-center justify-around divide-x divide-slate-100">
        <button
          type="button"
          onClick={() => showToast('2 Voucher Berkah Aktif: Diskon Ramadhan & Cashback Rp 1,5 Jt!')}
          className="flex-1 flex flex-col items-center text-center px-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-base mb-0.5">🎟️</div>
          <div className="text-xs font-black text-slate-900">2 Kupon</div>
          <div className="text-[9.5px] text-slate-500">Voucher Berkah</div>
        </button>

        <button
          type="button"
          onClick={() =>
            showToast('1 Set Perlengkapan Jamaah: Koper 24", Kain Ihram/Mukena & Seragam Batik.')
          }
          className="flex-1 flex flex-col items-center text-center px-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-base mb-0.5">📦</div>
          <div className="text-xs font-black text-slate-900">1 Paket</div>
          <div className="text-[9.5px] text-slate-500">Perlengkapan</div>
        </button>

        <button
          type="button"
          onClick={() =>
            showToast('Komisi Afiliasi Tersedia: Rp 9.000.000 (Dapat ditarik ke rekening bank).')
          }
          className="flex-1 flex flex-col items-center text-center px-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-base mb-0.5">🎁</div>
          <div className="text-xs font-black text-slate-900">Rp 9 Jt</div>
          <div className="text-[9.5px] text-slate-500">Komisi Syiar</div>
        </button>

        <button
          type="button"
          onClick={() =>
            showToast('Rekening Bersama Escrow BSI/Muamalat: Dana aman hingga jamaah terbang.')
          }
          className="flex-1 flex flex-col items-center text-center px-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-base mb-0.5">🛡️</div>
          <div className="text-xs font-black text-emerald-700">100% Aman</div>
          <div className="text-[9.5px] text-slate-500">Escrow Kemenag</div>
        </button>
      </div>

      {/* =========================================================================
          4. PROMO ALERT STRIP (DISMISSIBLE)
         ========================================================================= */}
      {showPromoAlert && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span>
              Ada voucher diskon <strong>Rp 1.500.000</strong> berakhir dalam{' '}
              <span className="bg-amber-600 text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                11:08:56
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                showToast('Voucher UMROHBERKAH1500 berhasil diklaim!');
                setShowPromoAlert(false);
              }}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              Klaim
            </button>
            <button
              type="button"
              onClick={() => setShowPromoAlert(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. WIDGET DOKUMEN PASPOR & MANIFES (KONEKSI UTAMA KE VIEW PASSPORT)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Dokumen Paspor &amp; Manifes
              </h2>
              <p className="text-[11px] text-slate-500">
                {bookingInfo?.packageName || 'Paket Umroh Bintang 5 Awal Ramadhan 1448H'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
            {bookingInfo?.bookingCode || 'UH-2026-RAMADHAN'}
          </span>
        </div>

        {/* Progress Bar Kesiapan Terbang */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Progres Paspor ({verifiedCount} dari {totalPax} Terverifikasi)
            </span>
            <span className="font-black text-emerald-700">{readinessPercent}% Siap Terbang</span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
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

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {verifiedCount} Sah Kemenag
            </span>
            {revisionCount > 0 && (
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {revisionCount} Perlu Revisi
              </span>
            )}
            <span className="flex items-center gap-1">
              <Plane className="w-3 h-3 text-slate-400" />
              Terbang: {bookingInfo?.departureDate || '15 Okt 2026'}
            </span>
          </div>
        </div>

        {/* Action Button: Buka Layanan Paspor Lengkap */}
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#passport';
            onNavigateView('passport');
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span>Kelola Paspor &amp; Manifes Lengkap</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          6. PIPELINE STATUS TRANSAKSI (5 TAHAP TOKOPEDIA STYLE)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Transaksi Saya</h2>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#passport';
              onNavigateView('passport');
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Lihat Riwayat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center">
          <button
            type="button"
            onClick={() => showToast('Tidak ada tagihan yang belum dibayar.')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              💵
            </div>
            <span className="text-[10px] font-semibold text-slate-700 leading-tight">
              Belum Bayar
            </span>
          </button>

          <button
            type="button"
            onClick={() => showToast('1 Pesanan sedang diproses verifikasi Kemenag.')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group relative"
          >
            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              📦
            </div>
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[10px] font-semibold text-slate-700 leading-tight">
              Diproses
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#passport';
              onNavigateView('passport');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              ✈️
            </div>
            <span className="text-[10px] font-semibold text-slate-700 leading-tight">
              Keberangkatan
            </span>
          </button>

          <button
            type="button"
            onClick={() => showToast('Jadwal ketibaan di Madinah/Makkah akan diupdate real-time.')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              🕋
            </div>
            <span className="text-[10px] font-semibold text-slate-700 leading-tight">
              Sudah Tiba
            </span>
          </button>

          <button
            type="button"
            onClick={() => showToast('Semua ulasan jamaah dapat dilihat di profil biro PPIU.')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              ⭐
            </div>
            <span className="text-[10px] font-semibold text-slate-700 leading-tight">
              Ulasan
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          7. MENU LAYANAN LAINNYA (SHORTCUT PORTAL & FITUR)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Menu &amp; Layanan Ekosistem</h2>

        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#travels';
              onNavigateView('biro');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🕌
            </div>
            <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
              Biro PPIU
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#travel-map';
              onNavigateView('map');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🗺️
            </div>
            <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
              Peta Lokasi
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#schedule';
              onNavigateView('schedule');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🗓️
            </div>
            <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
              Jadwal Terbang
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#travel-dashboard';
              onNavigateView('travel-dashboard');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🏢
            </div>
            <span className="text-[10.5px] font-semibold text-slate-700 leading-tight">
              Portal Biro
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          8. SIMULASI ROLE SWITCHER (INTERAKTIF DEMO)
         ========================================================================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900">Simulasi Ganti Peran Demo</span>
          </div>
          <span className="text-[10px] text-slate-500">Pilih role untuk uji alur kerja</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => {
              quickLogin('CUSTOMER');
              showToast('Role diubah ke Jamaah');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              user?.role === 'CUSTOMER'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600'
            }`}
          >
            👤 Jamaah
          </button>

          <button
            type="button"
            onClick={() => {
              quickLogin('TRAVEL');
              showToast('Role diubah ke Biro Travel PPIU');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              user?.role === 'TRAVEL'
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-600'
            }`}
          >
            🏢 Biro PPIU
          </button>

          <button
            type="button"
            onClick={() => {
              quickLogin('SUPER_ADMIN');
              showToast('Role diubah ke Super Admin');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              user?.role === 'SUPER_ADMIN'
                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-600'
            }`}
          >
            🛡️ Super Admin
          </button>

          <button
            type="button"
            onClick={() => {
              showToast('Mitra Afiliasi diaktifkan! Komisi referral 30 hari otomatis.');
            }}
            className="py-2 px-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-amber-500 transition-all cursor-pointer"
          >
            💰 Afiliasi
          </button>
        </div>
      </div>

      {/* =========================================================================
          9. REKOMENDASI PAKET TOKOPEDIA STYLE ("Mungkin kamu suka ini")
         ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Mungkin kamu suka ini</h2>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#marketplace';
              onNavigateView('marketplace');
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Lihat Semua &rsaquo;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {recommendations.slice(0, 4).map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelectPackage}
            />
          ))}
        </div>
      </div>

      {/* =========================================================================
          10. LOGOUT BUTTON (IF LOGGED IN)
         ========================================================================= */}
      {user && (
        <div className="pt-3">
          <button
            type="button"
            onClick={async () => {
              if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
                await logout();
                showToast('Anda telah berhasil keluar.');
              }
            }}
            className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      )}
    </div>
  );
}
