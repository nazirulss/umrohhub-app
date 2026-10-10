'use client';

import React from 'react';
import { PassportValidationResult } from '@/types/document';
import { AlertTriangle, CheckCircle2, XCircle, Info, CalendarClock } from 'lucide-react';

interface PassportValidationBadgeProps {
  result: PassportValidationResult;
  showFullDetails?: boolean;
}

export function PassportValidationBadge({
  result,
  showFullDetails = true,
}: PassportValidationBadgeProps) {
  if (result.status === 'EMPTY') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Masukkan tanggal habis berlaku untuk verifikasi otomatis syarat 7 bulan Kemenag RI.</span>
      </div>
    );
  }

  if (result.status === 'INVALID') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">
        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
        <span>{result.message}</span>
      </div>
    );
  }

  if (result.status === 'EXPIRED') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-900 shadow-xs">
        <div className="flex items-start gap-2.5">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-red-800 flex items-center gap-2">
              <span>Paspor Kadaluwarsa</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-bold">
                TIDAK VALID
              </span>
            </div>
            <p className="leading-relaxed text-red-700">{result.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'LESS_THAN_7_MONTHS') {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-950 shadow-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-bold text-amber-900">
                Peringatan Regulasi 7 Bulan Kemenag RI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                Sisa {result.diffMonths} Bulan
              </span>
            </div>
            <p className="leading-relaxed text-amber-800">
              {result.message}
            </p>
            {showFullDetails && (
              <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-700">
                <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                <span>Selisih waktu ke tanggal terbang: <strong>{result.diffDays} hari</strong> (wajib ≥ 210 hari).</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VALID
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 shadow-xs">
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-900">Masa Berlaku Memenuhi Syarat</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
              AMAN ({result.diffMonths} Bulan)
            </span>
          </div>
          <p className="leading-relaxed text-emerald-800">{result.message}</p>
        </div>
      </div>
    </div>
  );
}
