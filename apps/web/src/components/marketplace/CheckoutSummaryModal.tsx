'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PackageItem, RoomVariant, DepartureItem } from '@/types/marketplace';
import { AuthUser } from '@/types/auth';
import {
  X,
  ShieldCheck,
  Building2,
  Calendar,
  Plane,
  Hotel,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
} from 'lucide-react';

interface CheckoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: PackageItem;
  paxCount: number;
  roomVariant: RoomVariant;
  departure: DepartureItem;
  totalPrice: number;
  unitPrice: number;
  user: AuthUser | null;
  onProceedToPassport: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentOption: 'DP' | 'FULL';
    specialNotes: string;
  }) => void;
  onPayLaterAndUploadLater?: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentOption: 'DP' | 'FULL';
    specialNotes: string;
  }) => void;
}

export function CheckoutSummaryModal({
  isOpen,
  onClose,
  pkg,
  paxCount,
  roomVariant,
  departure,
  totalPrice,
  unitPrice,
  user,
  onProceedToPassport,
  onPayLaterAndUploadLater,
}: CheckoutSummaryModalProps) {
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '081234567890');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState<'DP' | 'FULL'>('DP');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const dpPerPax = 5000000;
  const totalDp = dpPerPax * paxCount;
  const initialPaymentDue = paymentOption === 'DP' ? totalDp : totalPrice;
  const cashbackTotal = (pkg.commissionAffiliate || 0) * paxCount;

  const handleSubmitPassport = () => {
    if (!customerName.trim()) {
      setErrorMessage('Nama penanggung jawab wajib diisi.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi (min. 10 digit).');
      return;
    }
    setErrorMessage(null);
    onProceedToPassport({
      customerName,
      customerPhone,
      customerEmail,
      paymentOption,
      specialNotes,
    });
  };

  const handlePayLater = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Nama pemesan dan nomor WhatsApp wajib diisi.');
      return;
    }
    setErrorMessage(null);
    if (onPayLaterAndUploadLater) {
      onPayLaterAndUploadLater({
        customerName,
        customerPhone,
        customerEmail,
        paymentOption,
        specialNotes,
      });
    } else {
      handleSubmitPassport();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* =========================================================================
            1. MODAL HEADER
           ========================================================================= */}
        <div className="relative bg-gradient-to-r from-[#005B31] via-[#007A41] to-[#00924e] p-4 sm:p-5 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              Verifikasi Kemenag RI
            </span>
            <span className="text-[11px] text-emerald-100/90 font-medium hidden sm:inline">
              Garansi 5 Pasti Umroh
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
            Ringkasan Pemesanan &amp; Konfirmasi Booking
          </h3>
          <p className="text-[11px] text-emerald-100/90 mt-0.5">
            Pastikan data keberangkatan &amp; kontak penanggung jawab jamaah sudah sesuai
          </p>
        </div>

        {/* =========================================================================
            2. MODAL BODY (SCROLLABLE)
           ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-[#212121]">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs font-semibold animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CARD A: DETAIL PAKET & BIRO PPIU */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-[#007A41]">
                    {pkg.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {pkg.durationDays} Hari Perjalanan
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                  {pkg.title}
                </h4>
                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{pkg.travelName}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                </p>
              </div>
            </div>

            {/* Grid Detail Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2.5 border-t border-slate-200/70 text-[11px]">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] block">Tipe Kamar:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Hotel className="w-3 h-3 text-emerald-600" />
                  {roomVariant.name}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] block">Keberangkatan:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  {departure.departureDate}
                </span>
              </div>
              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-slate-500 text-[10px] block">Bandara / Maskapai:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <Plane className="w-3 h-3 text-emerald-600" />
                  {departure.departureCity} • {departure.airline}
                </span>
              </div>
            </div>
          </div>

          {/* CARD B: DATA KONTAK PENANGGUNG JAWAB JAMAAH */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Data Pemesan &amp; Kontak Utama ({paxCount} Pax)
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Slot Jamaah 1 s/d {paxCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Lengkap Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sesuai KTP / Paspor Pemesan"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812xxxxxxxx (notifikasi & invoice)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email (Untuk E-Ticket &amp; Bukti Escrow)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="jamaah@email.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Permintaan Khusus / Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Contoh: Membawa kursi roda lansia, kamar lantai rendah, dll."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* CARD C: SKEMA PEMBAYARAN ESCROW KEMENAG */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pilih Skema Pembayaran Rekening Bersama (Escrow)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Opsi DP */}
              <div
                onClick={() => setPaymentOption('DP')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                  paymentOption === 'DP'
                    ? 'border-[#007A41] bg-emerald-50/60 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900">
                    1. Bayar Uang Muka (DP Kunci Kursi)
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentOption === 'DP'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentOption === 'DP' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Rp {(dpPerPax).toLocaleString('id-ID')} / pax
                </p>
                <p className="text-xs font-black text-emerald-800 mt-1">
                  Total DP: Rp {totalDp.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Pelunasan dapat dicicil hingga H-30 keberangkatan
                </p>
              </div>

              {/* Opsi Lunas */}
              <div
                onClick={() => setPaymentOption('FULL')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                  paymentOption === 'FULL'
                    ? 'border-[#007A41] bg-emerald-50/60 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900">
                    2. Bayar Lunas Langsung
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentOption === 'FULL'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentOption === 'FULL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Semua biaya paket {paxCount} pax
                </p>
                <p className="text-xs font-black text-slate-900 mt-1">
                  Total: Rp {totalPrice.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  Bebas biaya administrasi &amp; jaminan harga tetap
                </p>
              </div>
            </div>

            {/* Escrow Trust Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-950">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Keamanan Escrow Bank Syariah:</span> Dana disimpan di rekening penampung resmi Kemenag RI dan baru diteruskan ke biro travel setelah tiket PP, hotel, dan visa umroh Anda terverifikasi terbit (Jaminan 5 Pasti Umroh).
              </div>
            </div>
          </div>

          {/* CARD D: RINCIAN BIAYA PEMESANAN */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 text-xs mb-2">Rincian Pembayaran:</h4>
            <div className="flex justify-between text-slate-600">
              <span>Paket Umroh ({roomVariant.name}) × {paxCount} Pax</span>
              <span className="font-semibold text-slate-800">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            {cashbackTotal > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kupon Syiar Berkah Cashback
                </span>
                <span>-Rp {cashbackTotal.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan &amp; Verifikasi Kemenag</span>
              <span className="font-bold text-emerald-700">GRATIS</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="font-black text-slate-900 text-sm block">
                  {paymentOption === 'DP' ? 'Tagihan Awal (Uang Muka DP):' : 'Total Pembayaran Lunas:'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {paymentOption === 'DP' ? `Sisa tagihan Rp ${(totalPrice - totalDp).toLocaleString('id-ID')} dilunasi bertahap` : 'Sudah termasuk asuransi & perlindungan'}
                </span>
              </div>
              <span className="text-base sm:text-lg font-black text-emerald-700">
                Rp {initialPaymentDue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. MODAL FOOTER & ACTION BUTTONS
           ========================================================================= */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
          {/* Tombol Utama: Lanjut Lengkapi Paspor */}
          <button
            type="button"
            onClick={handleSubmitPassport}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#005B31] to-[#007A41] hover:from-[#004e2a] hover:to-[#006a38] active:scale-98 text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Lanjut &amp; Lengkapi Paspor ({paxCount} Jamaah)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Tombol Fleksibel: Kunci Kursi & Upload Paspor Nanti */}
          <button
            type="button"
            onClick={handlePayLater}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Kunci Kursi Dulu &amp; Lengkapi Paspor Nanti di Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}
