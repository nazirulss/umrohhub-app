'use client';

import React from 'react';
import { PassportDocument } from '@/types/document';
import { formatTanggalIndo } from '@/lib/passport-validation';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  User,
  Calendar,
} from 'lucide-react';

interface PassportReviewCardProps {
  document: PassportDocument;
  onEdit?: () => void;
  onVerify?: (status: 'TERVERIFIKASI' | 'PERLU_REVISI', reason?: string) => void;
  isBiroMode?: boolean;
}

export function PassportReviewCard({
  document,
  onEdit,
  onVerify,
  isBiroMode = false,
}: PassportReviewCardProps) {
  const isVerified = document.status === 'TERVERIFIKASI';
  const isRevision = document.status === 'PERLU_REVISI';
  const isPending = document.status === 'MENUNGGU_VERIFIKASI';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            P{document.paxIndex}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {document.fullName || 'Belum diisi'}
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              No. Paspor: <span className="font-semibold text-slate-700">{document.passportNumber || '-'}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Terverifikasi
            </span>
          )}
          {isRevision && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Perlu Revisi
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Menunggu Review Biro
            </span>
          )}
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Jenis Kelamin</span>
          <span className="font-semibold text-slate-700">
            {document.gender === 'M' ? 'Laki-laki (M)' : document.gender === 'F' ? 'Perempuan (F)' : '-'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Tanggal Lahir</span>
          <span className="font-semibold text-slate-700">
            {formatTanggalIndo(document.birthDate)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Kantor Penerbit</span>
          <span className="font-semibold text-slate-700 truncate block">
            {document.issuingOffice || '-'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Habis Berlaku</span>
          <span className="font-semibold text-slate-700">
            {formatTanggalIndo(document.expiryDate)}
          </span>
        </div>
      </div>

      {document.passportScanUrl && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Foto Scan Halaman Paspor Terlampir</span>
            </div>
            <a
              href={document.passportScanUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              Lihat Foto <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="bg-slate-50/70 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Terakhir diupdate: {formatTanggalIndo(document.updatedAt)}
        </span>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Edit Data
          </button>
        )}
      </div>
    </div>
  );
}
