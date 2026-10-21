'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
  CreditCard,
  FileCheck,
  PhoneCall,
  MapPin,
  Lock,
} from 'lucide-react';

interface RegisterBiroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRegistered: (biroData: {
    brandName: string;
    legalName: string;
    skPpiu: string;
    city: string;
  }) => void;
}

export function RegisterBiroModal({
  isOpen,
  onClose,
  onSuccessRegistered,
}: RegisterBiroModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [brandName, setBrandName] = useState('Al-Falah Berkah Travel');
  const [legalName, setLegalName] = useState('PT. Al-Falah Berkah Mandiri');
  const [city, setCity] = useState('Jakarta Selatan, DKI Jakarta');
  const [adminPhone, setAdminPhone] = useState('081288990011');

  const [skPpiu, setSkPpiu] = useState('SK Kemenag No. 412 Tahun 2021');
  const [nib, setNib] = useState('9120008819201');
  const [akreditasi, setAkreditasi] = useState<'A' | 'B' | 'C'>('A');
  const [agreedFivePasti, setAgreedFivePasti] = useState(true);

  const [bankName, setBankName] = useState('Bank Syariah Indonesia (BSI)');
  const [bankAccountNo, setBankAccountNo] = useState('7123998811');
  const [accountHolder, setAccountHolder] = useState('PT. Al-Falah Berkah Mandiri');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      // Step 4: Sukses
      setStep(4);
      onSuccessRegistered({
        brandName,
        legalName,
        skPpiu,
        city,
      });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 overflow-hidden font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#005B31] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base shadow-inner">
              🏪
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Pendaftaran Biro PPIU Baru</h3>
              <p className="text-[10px] text-emerald-200">
                Integrasi Legalitas Siskopatuh Kemenag RI
              </p>
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

        {/* Step Indicator (If not on success step) */}
        {step < 4 && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-[#005B31] text-white' : 'bg-emerald-100 text-[#005B31]'
                }`}
              >
                1
              </span>
              <span className={step === 1 ? 'text-[#005B31]' : 'text-slate-500'}>Profil</span>
            </div>
            <div className="w-8 h-[2px] bg-slate-200" />

            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-[#005B31] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className={step === 2 ? 'text-[#005B31]' : 'text-slate-500'}>SK Kemenag</span>
            </div>
            <div className="w-8 h-[2px] bg-slate-200" />

            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 3 ? 'bg-[#005B31] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span className={step === 3 ? 'text-[#005B31]' : 'text-slate-500'}>Escrow Bank</span>
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          {/* =========================================================================
              STEP 1: PROFIL & IDENTITAS BIRO
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Lengkapi identitas biro perjalanan Anda. Data ini akan ditampilkan pada halaman profil biro publik &amp; katalog paket umroh.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 block text-xs">
                  Nama Brand Biro Travel: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Al-Falah Berkah Travel"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 block text-xs">
                  Nama Resmi Badan Hukum (PT / Yayasan): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Contoh: PT. Al-Falah Berkah Mandiri"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block text-xs">
                    Kota Kantor Pusat:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jakarta Selatan"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block text-xs">
                    No. WhatsApp Admin:
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: LEGALITAS & AKREDITASI KEMENAG RI
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-950 leading-relaxed">
                  UmrohHub hanya melayani PPIU (Penyelenggara Perjalanan Ibadah Umrah) yang memiliki izin operasional aktif dari Kementerian Agama RI.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 block text-xs">
                  Nomor Izin SK PPIU Kemenag RI: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={skPpiu}
                  onChange={(e) => setSkPpiu(e.target.value)}
                  placeholder="Contoh: SK Kemenag No. 412 Tahun 2021"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block text-xs">
                    Nomor NIB OSS:
                  </label>
                  <input
                    type="text"
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    placeholder="912000xxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block text-xs">
                    Nilai Akreditasi PPIU:
                  </label>
                  <select
                    value={akreditasi}
                    onChange={(e) => setAkreditasi(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="A">Akreditasi A (Sangat Baik)</option>
                    <option value="B">Akreditasi B (Baik)</option>
                    <option value="C">Akreditasi C (Cukup)</option>
                  </select>
                </div>
              </div>

              {/* Komitmen 5 Pasti Umroh */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedFivePasti}
                  onChange={(e) => setAgreedFivePasti(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 mt-0.5"
                />
                <span className="text-[11px] text-slate-700 leading-tight">
                  Biro kami berkomitmen mematuhi <strong>5 Pasti Umroh Kemenag RI</strong> (Pasti Travelnya, Pasti Jadwalnya, Pasti Terbangnya, Pasti Hotelnya, Pasti Visanya) dan bersedia diawasi secara berkala.
                </span>
              </label>
            </div>
          )}

          {/* =========================================================================
              STEP 3: REKENING OPERASIONAL KUSTODIAN ESCROW
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-950 leading-relaxed">
                  Pencairan dana paket dari jamaah dilakukan bertahap secara otomatis dari Rekening Escrow Kemenag ke rekening operasional resmi PT Anda.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 block text-xs">
                  Bank Syariah Penampung:
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
                  Nomor Rekening PT: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="7123998811"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-900 block text-xs">
                  Nama Pemilik Rekening (Sesuai Badan Hukum):
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="PT. Al-Falah Berkah Mandiri"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: SUKSES PENDAFTARAN & MENUJU DASHBOARD
             ========================================================================= */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl shadow-sm">
                🎉
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  Pendaftaran Biro Berhasil!
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Selamat! <strong>{brandName}</strong> telah terdaftar di ekosistem UmrohHub dengan verifikasi SK Kemenag resmi.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1 text-[11px] max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Legalitas:</span>
                  <span className="font-mono font-bold text-emerald-700">{skPpiu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rekening:</span>
                  <span className="font-bold text-slate-800">{bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700">Mitra PPIU Aktif</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.hash = '#travel-dashboard';
                  }}
                  className="w-full bg-[#005B31] hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Buka Dashboard Biro Travel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Controls) */}
        {step < 4 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={step === 2 && !agreedFivePasti}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs ${
                step === 2 && !agreedFivePasti
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#005B31] hover:bg-emerald-800 text-white'
              }`}
            >
              <span>{step === 3 ? 'Kirim & Buka Dashboard' : 'Lanjutkan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
