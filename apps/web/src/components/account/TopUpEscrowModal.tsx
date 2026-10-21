'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, QrCode, Building, CreditCard, Sparkles } from 'lucide-react';

interface TopUpEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessDeposit: (amount: number, bankName: string) => void;
}

export function TopUpEscrowModal({
  isOpen,
  onClose,
  onSuccessDeposit,
}: TopUpEscrowModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(2500000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'bsi' | 'muamalat' | 'bca_syariah' | 'qris'>('bsi');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const NOMINAL_OPTIONS = [500000, 1000000, 2500000, 5000000];

  const BANK_CONFIG = {
    bsi: {
      name: 'Bank Syariah Indonesia (BSI)',
      code: 'BSI-VA',
      vaNumber: '9888 0812 9900 8800',
      logoText: 'BSI',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    muamalat: {
      name: 'Bank Muamalat Indonesia',
      code: 'MUAMALAT-VA',
      vaNumber: '7788 0812 9900 8800',
      logoText: 'BMI',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    bca_syariah: {
      name: 'BCA Syariah',
      code: 'BCAS-VA',
      vaNumber: '1122 0812 9900 8800',
      logoText: 'BCAS',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    qris: {
      name: 'QRIS Berkah Real-time',
      code: 'QRIS-NMID',
      vaNumber: 'NMID: ID1020268899001',
      logoText: 'QRIS',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  }[selectedMethod];

  const currentAmount = customAmount ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0 : selectedAmount;

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_CONFIG.vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirm = () => {
    onSuccessDeposit(currentAmount, BANK_CONFIG.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#005B31] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-inner">
              💰
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Tambah Setoran Tabungan / Escrow</h3>
              <p className="text-[10px] text-emerald-200">Rekening penampung resmi Kemenag RI</p>
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

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800">
          {/* 1. Pilih Nominal Setoran */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              1. Pilih Nominal Setoran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NOMINAL_OPTIONS.map((nom) => (
                <button
                  key={nom}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(nom);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    selectedAmount === nom && !customAmount
                      ? 'bg-emerald-50 border-[#03AC0E] text-[#005B31] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <span>Rp {nom.toLocaleString('id-ID')}</span>
                  {nom === 2500000 && (
                    <span className="text-[9px] bg-[#E5F9F0] text-[#007A41] px-1 py-0.2 rounded font-extrabold">
                      Disarankan
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Nominal Input */}
            <div className="relative mt-2">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="text"
                placeholder="Atau masukkan nominal lain..."
                value={customAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCustomAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#03AC0E] transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* 2. Pilih Bank Syariah Mitra */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              2. Pilih Rekening Bank Kustodian Syariah:
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', desc: 'Gratis biaya admin • Verifikasi Otomatis' },
                { id: 'muamalat', name: 'Bank Muamalat Indonesia', desc: 'Pionir Bank Syariah Pertama di RI' },
                { id: 'bca_syariah', name: 'BCA Syariah Virtual Account', desc: 'Transfer via BCA Mobile & myBCA' },
                { id: 'qris', name: 'QRIS Berkah Real-time', desc: 'Scan via BCA, Mandiri, GoPay, OVO, ShopeePay' },
              ].map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedMethod(bank.id as any)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedMethod === bank.id
                      ? 'bg-emerald-50/60 border-[#03AC0E] shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-[11px] text-slate-700 shrink-0">
                      {bank.id === 'qris' ? 'QR' : bank.id.toUpperCase().slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">{bank.name}</div>
                      <div className="text-[10px] text-slate-500">{bank.desc}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === bank.id ? 'border-[#03AC0E] bg-[#03AC0E] text-white' : 'border-slate-300'
                  }`}>
                    {selectedMethod === bank.id && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Kotak Detail Virtual Account */}
          <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Nomor Pembayaran:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BANK_CONFIG.badgeColor}`}>
                {BANK_CONFIG.code}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-wider">
                {BANK_CONFIG.vaNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#005B31] hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#03AC0E]" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Total Tagihan Setoran:</span>
              <span className="font-black text-sm text-[#005B31]">
                Rp {currentAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Garansi Keamanan Escrow */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#03AC0E] shrink-0 mt-0.5" />
            <p className="leading-snug">
              Dana Anda 100% aman tersimpan di Rekening Escrow Penampung Kemenag RI dan baru dicairkan
              ke biro travel jika tiket &amp; visa telah terbit sah.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#005B31] hover:bg-[#007A41] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Konfirmasi Setoran</span>
          </button>
        </div>
      </div>
    </div>
  );
}
