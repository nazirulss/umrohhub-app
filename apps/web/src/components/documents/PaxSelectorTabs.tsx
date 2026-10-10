'use client';

import React from 'react';
import { PassportDocument } from '@/types/document';
import { User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface PaxSelectorTabsProps {
  totalPax: number;
  activePaxIndex: number;
  documents: Record<number, Partial<PassportDocument>>;
  onSelectPax: (paxIndex: number) => void;
}

export function PaxSelectorTabs({
  totalPax,
  activePaxIndex,
  documents,
  onSelectPax,
}: PaxSelectorTabsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
          Pilih Jamaah ({totalPax} Pax Terdaftar)
        </label>
        <span className="text-xs text-slate-500">
          Lengkapi dokumen tiap jamaah
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {Array.from({ length: totalPax }, (_, idx) => {
          const paxNum = idx + 1;
          const isSelected = activePaxIndex === paxNum;
          const doc = documents[paxNum];
          const hasName = Boolean(doc?.fullName && doc.fullName.trim().length > 0);
          const hasPassportNo = Boolean(doc?.passportNumber && doc.passportNumber.trim().length > 0);
          const isVerified = doc?.status === 'TERVERIFIKASI';
          const isRevision = doc?.status === 'PERLU_REVISI';
          const isPending = doc?.status === 'MENUNGGU_VERIFIKASI' || (hasName && hasPassportNo && !isVerified && !isRevision);

          return (
            <button
              key={paxNum}
              type="button"
              onClick={() => onSelectPax(paxNum)}
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {paxNum}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Jamaah {paxNum}
                  </span>
                </div>

                {/* Status Indicator Icon */}
                {isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {isRevision && (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                {!isVerified && !isRevision && isPending && (
                  <Clock className="w-4 h-4 text-sky-600" />
                )}
                {!hasName && !hasPassportNo && (
                  <User className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <div className="w-full">
                <p className="text-[11px] font-medium text-slate-700 truncate w-full">
                  {doc?.fullName || 'Belum diisi'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {doc?.passportNumber ? `No: ${doc.passportNumber}` : 'Paspor kosong'}
                </p>
              </div>

              {/* Status pill */}
              <div className="mt-2 w-full pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : isRevision
                      ? 'bg-amber-100 text-amber-800'
                      : isPending
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isVerified
                    ? 'Terverifikasi'
                    : isRevision
                    ? 'Perlu Revisi'
                    : isPending
                    ? 'Review Biro'
                    : 'Belum Ada Data'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
