'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  Plane,
  Building2,
  Calendar,
  Users,
  CreditCard,
  Download,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  FileText,
} from 'lucide-react';

export interface TransactionItem {
  id: string;
  bookingCode: string;
  date: string;
  travelName: string;
  travelPpiu: string;
  travelPhone: string;
  packageName: string;
  packageImage: string;
  departureDate: string;
  returnDate: string;
  airline: string;
  flightCode: string;
  hotelMakkah: string;
  hotelMadinah: string;
  totalPax: number;
  roomType: string;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: string;
  status: 'BELUM_BAYAR' | 'VERIFIKASI' | 'SIAP_TERBANG' | 'DI_TANAH_SUCI' | 'SELESAI';
  statusLabel: string;
  passportVerifiedCount: number;
  pilgrims: {
    name: string;
    passportNo: string;
    status: 'TERVERIFIKASI' | 'MENUNGGU_VERIFIKASI' | 'BELUM_LENGKAP';
  }[];
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
  onNavigatePassport?: () => void;
  onNavigateEscrow?: () => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onNavigatePassport,
  onNavigateEscrow,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const isFullyPaid = transaction.paidAmount >= transaction.totalPrice;
  const remainingBill = Math.max(0, transaction.totalPrice - transaction.paidAmount);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 overflow-hidden font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#005B31] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm shadow-inner">
              📋
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Rincian Transaksi Ibadah</h3>
              <p className="text-[10px] text-emerald-200 font-mono">{transaction.bookingCode}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          {/* Status Tracker Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
                Status Pesanan
              </span>
              <h4 className="text-sm font-black text-emerald-900 mt-0.5">
                {transaction.statusLabel}
              </h4>
              <p className="text-[10.5px] text-slate-600 mt-0.5">
                Tanggal Pemesanan: {transaction.date}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Escrow Amanah
              </span>
            </div>
          </div>

          {/* Info Biro PPIU */}
          <div className="bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Biro Penyelenggara Resmi (PPIU)
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                  {transaction.travelName}
                </h4>
                <p className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {transaction.travelPpiu}
                </p>
              </div>
              <a
                href={`https://wa.me/${transaction.travelPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold shadow-2xs transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-emerald-600" />
                <span>CS Biro</span>
              </a>
            </div>
          </div>

          {/* Rincian Paket & Akomodasi */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
              Rincian Perjalanan Ibadah
            </h4>
            
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
              <div>
                <h5 className="font-bold text-slate-900 text-xs">{transaction.packageName}</h5>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Kamar {transaction.roomType} &bull; {transaction.totalPax} Jamaah Terdaftar
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Plane className="w-3 h-3 text-slate-500" /> Maskapai Penerbangan:
                  </span>
                  <span className="font-bold text-slate-800">
                    {transaction.airline} ({transaction.flightCode})
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> Jadwal Terbang:
                  </span>
                  <span className="font-bold text-slate-800">
                    {transaction.departureDate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-600" /> Hotel Makkah:
                  </span>
                  <span className="font-bold text-slate-800 line-clamp-1">
                    {transaction.hotelMakkah}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" /> Hotel Madinah:
                  </span>
                  <span className="font-bold text-slate-800 line-clamp-1">
                    {transaction.hotelMadinah}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Jamaah & Paspor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="font-bold text-slate-900 text-xs">
                Data Jamaah &amp; Paspor ({transaction.passportVerifiedCount}/{transaction.totalPax} Terverifikasi)
              </h4>
              {transaction.passportVerifiedCount < transaction.totalPax && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigatePassport) onNavigatePassport();
                  }}
                  className="text-[10px] font-bold text-[#03AC0E] hover:underline cursor-pointer"
                >
                  + Lengkapi Paspor
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {transaction.pilgrims.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Paspor: {p.passportNo || 'Belum diisi'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        p.status === 'TERVERIFIKASI'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'MENUNGGU_VERIFIKASI'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.status === 'TERVERIFIKASI'
                        ? 'Terverifikasi'
                        : p.status === 'MENUNGGU_VERIFIKASI'
                        ? 'Sedang Diproses'
                        : 'Belum Lengkap'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Finansial & Escrow */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
              Rincian Pembayaran Escrow
            </h4>
            <div className="bg-[#FAF5FF] border border-purple-200 rounded-xl p-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Harga Paket ({transaction.totalPax} Pax)</span>
                <span className="font-bold text-slate-900">
                  Rp {transaction.totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Dana Tersimpan di Escrow Syariah</span>
                <span className="font-bold">
                  Rp {transaction.paidAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-purple-200 font-bold text-slate-900 text-xs">
                <span>Sisa Tagihan Pelunasan</span>
                <span className={remainingBill > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                  {remainingBill > 0
                    ? `Rp ${remainingBill.toLocaleString('id-ID')}`
                    : 'Lunas (100% di Escrow)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => alert(`Unduhan Dokumen Konfirmasi Booking ${transaction.bookingCode} telah dimulai (Format PDF Resmi Kemenag RI).`)}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh PDF</span>
          </button>

          <div className="flex items-center gap-2">
            {transaction.status === 'VERIFIKASI' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigatePassport) onNavigatePassport();
                }}
                className="bg-[#03AC0E] hover:bg-[#029b0c] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Lengkapi Dokumen &rsaquo;
              </button>
            )}

            {transaction.status === 'BELUM_BAYAR' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateEscrow) onNavigateEscrow();
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Bayar Tagihan &rsaquo;
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
