'use client';

import React, { useState } from 'react';
import { BiroPassportItem } from '@/types/travel-dashboard';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  Clock,
  Eye,
  X,
  Send,
} from 'lucide-react';

interface PassportVerificationTableProps {
  passports: BiroPassportItem[];
  onVerify: (id: string, status: 'TERVERIFIKASI' | 'PERLU_REVISI', rejectionReason?: string) => void;
}

export function PassportVerificationTable({
  passports,
  onVerify,
}: PassportVerificationTableProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Modal revisi
  const [rejectingItem, setRejectingItem] = useState<BiroPassportItem | null>(null);
  const [rejectionInput, setRejectionInput] = useState('');

  const counts = {
    ALL: passports.length,
    PENDING: passports.filter((p) => p.status === 'MENUNGGU_VERIFIKASI').length,
    VERIFIED: passports.filter((p) => p.status === 'TERVERIFIKASI').length,
    REJECTED: passports.filter((p) => p.status === 'PERLU_REVISI').length,
    CRITICAL: passports.filter((p) => p.isCritical).length,
  };

  const filtered = passports.filter((p) => {
    if (activeFilter === 'PENDING' && p.status !== 'MENUNGGU_VERIFIKASI') return false;
    if (activeFilter === 'VERIFIED' && p.status !== 'TERVERIFIKASI') return false;
    if (activeFilter === 'REJECTED' && p.status !== 'PERLU_REVISI') return false;
    if (activeFilter === 'CRITICAL' && !p.isCritical) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchPassport = p.passportNumber.toLowerCase().includes(q);
      const matchBooking = p.bookingCode.toLowerCase().includes(q);
      if (!matchName && !matchPassport && !matchBooking) return false;
    }
    return true;
  });

  const handleOpenRejectModal = (item: BiroPassportItem) => {
    setRejectingItem(item);
    setRejectionInput(
      item.isCritical
        ? `Masa berlaku paspor hanya tersisa ${item.diffMonths} bulan (kurang dari syarat 7 bulan Kemenag RI). Mohon perpanjang paspor di Imigrasi.`
        : 'Foto halaman identitas paspor buram / tidak terbaca dengan jelas. Mohon unggah ulang.'
    );
  };

  const handleConfirmReject = () => {
    if (rejectingItem) {
      onVerify(rejectingItem.id, 'PERLU_REVISI', rejectionInput);
      setRejectingItem(null);
      setRejectionInput('');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Verifikator Paspor Jamaah (Aturan 5 Pasti Kemenag)
          </h3>
          <p className="text-xs text-slate-500">
            Periksa keabsahan masa aktif paspor (≥ 7 bulan), kesesuaian nama jamaah, dan foto identitas
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama, no paspor, booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: `Semua (${counts.ALL})` },
          { id: 'PENDING', label: `⏳ Perlu Review (${counts.PENDING})` },
          { id: 'VERIFIED', label: `✅ Terverifikasi (${counts.VERIFIED})` },
          { id: 'REJECTED', label: `❌ Perlu Revisi (${counts.REJECTED})` },
          { id: 'CRITICAL', label: `⚠️ Kritis <7 Bulan (${counts.CRITICAL})`, isWarning: true },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === tab.id
                ? tab.isWarning
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
                : tab.isWarning && counts.CRITICAL > 0
                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 rounded-l-xl">Jamaah & Booking</th>
              <th className="px-4 py-3">No. Paspor</th>
              <th className="px-4 py-3">Habis Berlaku (Kemenag)</th>
              <th className="px-4 py-3">Scan Paspor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right rounded-r-xl">Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Nama & Booking */}
                <td className="px-4 py-3.5">
                  <span className="font-extrabold text-slate-900 block text-xs">
                    {item.fullName}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-emerald-800">
                      {item.bookingCode} (Pax #{item.paxIndex})
                    </span>
                    <span>•</span>
                    <span>{item.gender === 'M' ? 'L' : 'P'}</span>
                  </div>
                </td>

                {/* No Paspor */}
                <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                  {item.passportNumber}
                  <span className="block text-[10px] font-sans font-normal text-slate-400">
                    {item.issuingOffice}
                  </span>
                </td>

                {/* Expiry Date & Kemenag Warning */}
                <td className="px-4 py-3.5">
                  <span className="font-bold text-slate-900 block">{item.expiryDate}</span>
                  {item.isCritical ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Sisa {item.diffMonths} Bulan (&lt; 7 Bulan Kemenag)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Aman ({item.diffMonths} Bulan)
                    </span>
                  )}
                </td>

                {/* Scan Paspor Thumbnail */}
                <td className="px-4 py-3.5">
                  {item.passportScanUrl ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.passportScanUrl)}
                      className="group relative w-12 h-9 rounded-lg overflow-hidden border border-slate-300 hover:border-emerald-600 transition-all cursor-pointer block"
                      title="Klik untuk melihat foto paspor"
                    >
                      <img
                        src={item.passportScanUrl}
                        alt="Scan Paspor"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Tidak ada file</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  {item.status === 'TERVERIFIKASI' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                    </span>
                  )}
                  {item.status === 'PERLU_REVISI' && (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <XCircle className="w-3 h-3 text-amber-600" /> Perlu Revisi
                      </span>
                      {item.rejectionReason && (
                        <p className="text-[10px] text-amber-800 mt-1 max-w-xs truncate" title={item.rejectionReason}>
                          {item.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                  {item.status === 'MENUNGGU_VERIFIKASI' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      <Clock className="w-3 h-3 text-sky-600" /> Menunggu Review
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onVerify(item.id, 'TERVERIFIKASI')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Setujui Paspor (Lolos)"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lolos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(item)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Tolak & Minta Revisi"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Revisi
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Preview Scan Paspor Jamaah</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 flex justify-center max-h-[70vh] overflow-auto">
              <img src={previewImage} alt="Paspor" className="rounded-xl max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejection Reason */}
      {rejectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setRejectingItem(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-red-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Minta Revisi Dokumen Paspor
              </h4>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>Jamaah: <strong className="text-slate-900">{rejectingItem.fullName}</strong></p>
              <p>No. Paspor: <strong className="text-slate-900 font-mono">{rejectingItem.passportNumber}</strong></p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Catatan Revisi untuk Jamaah (Wajib):
              </label>
              <textarea
                rows={3}
                value={rejectionInput}
                onChange={(e) => setRejectionInput(e.target.value)}
                placeholder="Tuliskan alasan revisi agar jamaah dapat memperbaiki..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
