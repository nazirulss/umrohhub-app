'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface BiroItem {
  id: string;
  name: string;
  legalName: string;
  skKemenag: string;
  city: string;
  packagesCount: number;
  rating: number;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'SUSPENDED';
}

const INITIAL_BIROS: BiroItem[] = [
  {
    id: 'biro-1',
    name: 'Al-Madinah Tour & Travel',
    legalName: 'PT Al-Madinah Barakah Wisata Mandiri',
    skKemenag: 'Kemenag RI PPIU No. 412/2021',
    city: 'Jakarta Selatan',
    packagesCount: 12,
    rating: 4.9,
    status: 'VERIFIED',
  },
  {
    id: 'biro-2',
    name: 'Al-Falah Berkah Mandiri',
    legalName: 'PT Al-Falah Wisata Umroh Internasional',
    skKemenag: 'Kemenag RI PPIU No. 819/2020',
    city: 'Surabaya',
    packagesCount: 8,
    rating: 4.8,
    status: 'VERIFIED',
  },
  {
    id: 'biro-3',
    name: 'Nurul Haramain Wisata',
    legalName: 'PT Nurul Haramain Berkah Abadi',
    skKemenag: 'Kemenag RI PPIU No. 104/2023',
    city: 'Bandung',
    packagesCount: 4,
    rating: 4.7,
    status: 'UNDER_REVIEW',
  },
  {
    id: 'biro-4',
    name: 'Baitullah Prima Travel',
    legalName: 'PT Baitullah Prima Sejahtera',
    skKemenag: 'Kemenag RI PPIU No. 550/2019',
    city: 'Medan',
    packagesCount: 6,
    rating: 4.6,
    status: 'VERIFIED',
  },
  {
    id: 'biro-5',
    name: 'Cahaya Safar Umroh',
    legalName: 'PT Cahaya Safar Barakah',
    skKemenag: 'Kemenag RI PPIU No. 209/2024',
    city: 'Semarang',
    packagesCount: 2,
    rating: 4.5,
    status: 'UNDER_REVIEW',
  },
];

export function AdminSupervisionView() {
  const [biros, setBiros] = useState<BiroItem[]>(INITIAL_BIROS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VERIFIED' | 'UNDER_REVIEW'>('ALL');

  const filteredBiros = biros.filter((b) => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.legalName.toLowerCase().includes(q) ||
        b.skKemenag.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: 'VERIFIED' | 'SUSPENDED') => {
    setBiros((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Supervisi */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-purple-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-purple-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Otoritas Pengawasan Platform (Siskopatuh Compliance)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Super Admin Backoffice & Audit PPIU
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Memverifikasi legalitas izin operasional biro travel, mengawasi dana escrow rekening bersama, serta memastikan kepatuhan standar 5 Pasti Kemenag RI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-right">
              <div className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">
                Status Sistem
              </div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operasional Normal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Biro PPIU</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">48 Biro</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
            42 Terverifikasi • 6 Review
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Dana Perlindungan Escrow</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Rp 18,4 Miliar</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rekening bersama aman transaksional
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Kepatuhan Paspor (≥7 Bulan)</span>
            <FileCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">98.4%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari 3.850 jamaah terjadwal
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Peringatan Kritis</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">3 Dokumen</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Perlu tindakan segera biro
          </p>
        </div>
      </div>

      {/* Tabel Legalitas & Audit Biro PPIU */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Direktori & Verifikasi Legalitas Biro PPIU Kemenag
            </h3>
            <p className="text-xs text-slate-500">
              Validasi SK operasional, domisili, dan kepatuhan akreditasi penyelenggara
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <input
                type="text"
                placeholder="Cari biro, SK, kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex rounded-xl bg-slate-200/70 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('UNDER_REVIEW')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'UNDER_REVIEW' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ⏳ Review
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('VERIFIED')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'VERIFIED' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ✅ Terverifikasi
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-extrabold border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3">Nama Biro & Legalitas PT</th>
                <th className="px-4 py-3">No. SK Kemenag RI</th>
                <th className="px-4 py-3">Kota Domisili</th>
                <th className="px-4 py-3">Paket Aktif</th>
                <th className="px-4 py-3">Status Izin</th>
                <th className="px-5 py-3 text-right">Tindakan Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBiros.map((biro) => (
                <tr key={biro.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-extrabold text-slate-900">{biro.name}</div>
                    <div className="text-[11px] text-slate-500">{biro.legalName}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      {biro.skKemenag}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">
                    {biro.city}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-700">
                    {biro.packagesCount} Paket
                  </td>
                  <td className="px-4 py-3.5">
                    {biro.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PPIU Terverifikasi
                      </span>
                    )}
                    {biro.status === 'UNDER_REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Menunggu Verifikasi
                      </span>
                    )}
                    {biro.status === 'SUSPENDED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3 text-red-600" /> Dibekukan
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {biro.status === 'UNDER_REVIEW' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(biro.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Setujui SK
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              biro.id,
                              biro.status === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED'
                            )
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          {biro.status === 'VERIFIED' ? 'Audit / Bekukan' : 'Aktifkan'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
