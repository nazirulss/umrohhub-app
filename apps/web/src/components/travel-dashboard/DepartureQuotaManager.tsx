'use client';

import React, { useState } from 'react';
import { DepartureQuotaItem } from '@/types/travel-dashboard';
import { Plane, Calendar, Users, Plus, Minus, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface DepartureQuotaManagerProps {
  departures: DepartureQuotaItem[];
  onUpdateQuota: (departureId: string, delta: number) => void;
  onToggleStatus: (departureId: string) => void;
}

export function DepartureQuotaManager({
  departures,
  onUpdateQuota,
  onToggleStatus,
}: DepartureQuotaManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = departures.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.packageTitle.toLowerCase().includes(q) ||
      d.flightCode.toLowerCase().includes(q) ||
      d.departureCity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-600" />
            Manajemen Kuota Jadwal Keberangkatan
          </h3>
          <p className="text-xs text-slate-500">
            Kendalikan alokasi seat penerbangan maskapai secara real-time untuk mencegah overbooking
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari penerbangan, kota, paket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Departures Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 rounded-l-xl">Jadwal & Paket</th>
              <th className="px-4 py-3">Penerbangan</th>
              <th className="px-4 py-3">Alokasi Kuota</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right rounded-r-xl">Aksi Kuota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((dep) => {
              const remaining = dep.quotaTotal - dep.quotaTaken;
              const percent = Math.round((dep.quotaTaken / dep.quotaTotal) * 100);

              return (
                <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Paket & Jadwal */}
                  <td className="px-4 py-3.5">
                    <span className="font-extrabold text-slate-900 block text-xs">
                      {dep.packageTitle}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-emerald-800">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {dep.departureDate}
                      </span>
                      <span>•</span>
                      <span>{dep.departureCity}</span>
                    </div>
                  </td>

                  {/* Maskapai */}
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-800 block">{dep.airline}</span>
                    <span className="font-mono text-[11px] text-slate-500">{dep.flightCode}</span>
                  </td>

                  {/* Kuota Progress */}
                  <td className="px-4 py-3.5 min-w-[180px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-900">
                        {dep.quotaTaken} / {dep.quotaTotal} Seat
                      </span>
                      <span className={remaining <= 5 ? 'text-amber-600 font-black' : 'text-slate-500'}>
                        Sisa {remaining}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all ${
                          percent >= 100
                            ? 'bg-red-500'
                            : percent >= 85
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                      />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5">
                    {dep.status === 'FULL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        <Lock className="w-3 h-3" /> Kuota Penuh
                      </span>
                    )}
                    {dep.status === 'ALMOST_FULL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3 h-3" /> Menipis
                      </span>
                    )}
                    {dep.status === 'OPEN' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Buka
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(dep.id, -1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer"
                        title="Kurangi 1 Kuota"
                        disabled={dep.quotaTotal <= dep.quotaTaken}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(dep.id, 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer"
                        title="Tambah 1 Kuota"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
