'use client';

import React, { useState, useEffect, useId } from 'react';
import { PassportDocument } from '@/types/document';
import { validatePassportKemenag } from '@/lib/passport-validation';
import { PassportValidationBadge } from './PassportValidationBadge';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

interface PassportUploadFormProps {
  paxIndex: number;
  totalPax: number;
  bookingCode: string;
  departureDate: string;
  initialData?: Partial<PassportDocument>;
  onSave: (doc: Partial<PassportDocument>) => void;
}

export function PassportUploadForm({
  paxIndex,
  totalPax,
  bookingCode,
  departureDate,
  initialData,
  onSave,
}: PassportUploadFormProps) {
  const fileInputId = useId();
  const [formData, setFormData] = useState<Partial<PassportDocument>>({
    fullName: '',
    passportNumber: '',
    birthDate: '',
    gender: 'M',
    issuingOffice: '',
    issuingDate: '',
    expiryDate: '',
    passportScanUrl: '',
    status: 'BELUM_LENGKAP',
    ...initialData,
  });

  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.passportScanUrl || null
  );

  // Sync state saat paxIndex atau initialData berubah
  useEffect(() => {
    setFormData({
      fullName: initialData?.fullName || '',
      passportNumber: initialData?.passportNumber || '',
      birthDate: initialData?.birthDate || '',
      gender: initialData?.gender || 'M',
      issuingOffice: initialData?.issuingOffice || '',
      issuingDate: initialData?.issuingDate || '',
      expiryDate: initialData?.expiryDate || '',
      passportScanUrl: initialData?.passportScanUrl || '',
      status: initialData?.status || 'BELUM_LENGKAP',
      rejectionReason: initialData?.rejectionReason || '',
      ...initialData,
    });
    setPreviewImage(initialData?.passportScanUrl || null);
    setIsSavedRecently(false);
  }, [paxIndex, initialData]);

  // Real-time Kemenag 7 Months Rule Validation
  const validationResult = validatePassportKemenag(
    formData.expiryDate,
    departureDate
  );

  // Deteksi jumlah kata nama (Saudi MoFA mensyaratkan 3 kata untuk visa umroh)
  const nameWords = (formData.fullName || '').trim().split(/\s+/).filter(Boolean);
  const hasThreeWords = nameWords.length >= 3;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'passportNumber' ? value.toUpperCase() : value,
    }));
    setIsSavedRecently(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Buat local object URL untuk preview responsif instan
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData((prev) => ({
        ...prev,
        passportScanUrl: url,
      }));
      setIsSavedRecently(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({
      ...prev,
      passportScanUrl: '',
    }));
    setIsSavedRecently(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isComplete = Boolean(
      formData.fullName &&
      formData.passportNumber &&
      formData.expiryDate &&
      formData.birthDate
    );

    const newStatus = isComplete ? 'MENUNGGU_VERIFIKASI' : 'BELUM_LENGKAP';

    const updatedDoc: Partial<PassportDocument> = {
      ...formData,
      paxIndex,
      bookingId: bookingCode,
      status: formData.status === 'TERVERIFIKASI' ? 'TERVERIFIKASI' : newStatus,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedDoc);
    setIsSavedRecently(true);

    // Kirim sinkronisasi ke PostgreSQL Backend API Layer
    if (bookingCode && formData.fullName && formData.passportNumber && formData.birthDate && formData.expiryDate) {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/documents/passport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingCode,
            paxIndex,
            fullName: formData.fullName,
            passportNumber: formData.passportNumber,
            birthDate: formData.birthDate,
            gender: formData.gender || 'M',
            issuingOffice: formData.issuingOffice,
            issuingDate: formData.issuingDate,
            expiryDate: formData.expiryDate,
            passportScanUrl: formData.passportScanUrl,
          }),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          setApiFeedback('Tersimpan di Database PostgreSQL & lolos validasi server');
        } else {
          setApiFeedback('Tersimpan di sesi lokal (Database offline)');
        }
      } catch {
        setApiFeedback('Tersimpan di sesi lokal');
      } finally {
        setIsSubmitting(false);
        setTimeout(() => {
          setIsSavedRecently(false);
          setApiFeedback(null);
        }, 3500);
      }
    } else {
      setTimeout(() => setIsSavedRecently(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Form */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-emerald-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Dokumen Paspor Jamaah {paxIndex} dari {totalPax}
            </h3>
            <p className="text-xs text-emerald-200/90">
              Kode Booking: <span className="font-mono font-semibold">{bookingCode}</span> • Tanggal Terbang:{' '}
              <span className="font-semibold">{departureDate}</span>
            </p>
          </div>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2">
          {formData.status === 'TERVERIFIKASI' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Terverifikasi Biro
            </span>
          )}
          {formData.status === 'PERLU_REVISI' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
              <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
              Perlu Revisi
            </span>
          )}
          {formData.status === 'MENUNGGU_VERIFIKASI' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
              Menunggu Review Biro
            </span>
          )}
        </div>
      </div>

      {/* Banner Perlu Revisi Jika Ada Catatan Biro */}
      {formData.status === 'PERLU_REVISI' && formData.rejectionReason && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">
              Catatan Revisi dari Biro Travel:
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              {formData.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Body Form */}
      <div className="p-6 space-y-6">
        {/* Section 1: Identitas Nama Sesuai Paspor */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Nama Lengkap (Sesuai Paspor) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Standar Visa Saudi: Minimal 3 Suku Kata</span>
              </div>
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Contoh: MUHAMMAD AHMAD FAUZI"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-colors"
              required
            />
            {formData.fullName && !hasThreeWords && (
              <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Nama hanya terdiri dari {nameWords.length} suku kata. Pastikan sesuai paspor (jika nama di paspor 2 kata, biro travel akan membantu proses penambahan nama untuk visa).
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nomor Paspor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                placeholder="Contoh: C1234567 / B9876543"
                maxLength={9}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono font-semibold tracking-wider transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-colors bg-white"
              >
                <option value="M">Laki-laki (Male)</option>
                <option value="F">Perempuan (Female)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kantor Imigrasi Penerbit
              </label>
              <input
                type="text"
                name="issuingOffice"
                value={formData.issuingOffice}
                onChange={handleInputChange}
                placeholder="Contoh: Kanim Jakarta Selatan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Masa Berlaku Paspor & Kalkulator Regulasi 7 Bulan Kemenag */}
        <div className="pt-4 border-t border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tanggal Dikeluarkan (Issue Date)
              </label>
              <input
                type="date"
                name="issuingDate"
                value={formData.issuingDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tanggal Habis Berlaku (Expiry Date) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-colors"
                required
              />
            </div>
          </div>

          {/* Real-time Kemenag 7 Months Rule Badge */}
          <PassportValidationBadge result={validationResult} />
        </div>

        {/* Section 3: Upload Scan / Foto Halaman Paspor */}
        <div className="pt-4 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              Foto / Scan Halaman Identitas Paspor <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Format: JPG, PNG, atau PDF (Maks. 5 MB)
            </span>
          </div>

          {previewImage ? (
            <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-slate-50 p-3 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-48 h-32 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                  <img
                    src={previewImage}
                    alt="Scan Paspor"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold">
                    Terunggah
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>File Foto Paspor Siap Diverifikasi</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Pastikan seluruh sudut halaman identitas, nomor paspor, dan tanda tangan terlihat jelas tanpa pantulan kilap lampu.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <label
                      htmlFor={fileInputId}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs"
                    >
                      Ganti Foto
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor={fileInputId}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/20 rounded-2xl p-8 cursor-pointer transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-500 group-hover:text-emerald-700 transition-colors mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 text-center">
                Klik untuk unggah atau seret file ke sini
              </p>
              <p className="text-[11px] text-slate-500 mt-1 text-center">
                Unggah halaman paspor yang memuat nama, tanggal lahir, dan masa berlaku
              </p>
            </label>
          )}

          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data dilindungi enkripsi privasi sesuai standar UU PDP.</span>
        </div>

        <div className="flex items-center gap-3">
          {apiFeedback && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {apiFeedback}
            </span>
          )}
          {isSavedRecently && !apiFeedback && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Tersimpan!
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyinkronkan...' : `Simpan Dokumen Jamaah ${paxIndex}`}
          </button>
        </div>
      </div>
    </form>
  );
}
