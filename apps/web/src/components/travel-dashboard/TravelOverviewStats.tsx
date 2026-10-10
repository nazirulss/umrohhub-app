'use client';

import React from 'react';
import { TravelStats } from '@/types/travel-dashboard';
import { Users, FileCheck, Plane, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TravelOverviewStatsProps {
  stats: TravelStats;
  onNavigateTab: (tab: 'passports' | 'quotas' | 'manifest') => void;
}

export function TravelOverviewStats({ stats, onNavigateTab }: TravelOverviewStatsProps) {
  const quotaOccupancyRate = Math.round((stats.totalSeatsBooked / stats.totalSeatsTotal) * 100);

  return (
    <div className="space-y-4">
      {/* Biro Travel Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              PORTAL BIRO TRAVEL PPIU RESMI
            </span>
            <span className="text-xs text-slate-300 font-mono">No. SK Kemenag: 412/2021</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            PT. Al-Falah Berkah Mandiri
          </h2>
          <p className="text-xs text-emerald-200/80">
            Pusat Operasional Keberangkatan, Verifikasi Paspor 5 Pasti, & Manifes Maskapai
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block font-semibold">Tingkat Okupansi Kuota</span>
            <span className="text-xl font-black text-emerald-300">{quotaOccupancyRate}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-emerald-300 border border-white/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Jamaah */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Jamaah</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalJamaah} <span className="text-xs font-semibold text-slate-400">Pax</span>
          </div>
          <p className="text-[11px] text-slate-500">Terdaftar di {stats.activePackages} paket aktif</p>
        </div>

        {/* Card 2: Menunggu Verifikasi Paspor (Actionable) */}
        <div
          onClick={() => onNavigateTab('passports')}
          className="bg-white rounded-2xl border border-amber-200 hover:border-amber-400 p-4 shadow-2xs space-y-2 cursor-pointer transition-all hover:bg-amber-50/20"
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold">Review Paspor</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {stats.pendingPassportReview} <span className="text-xs font-semibold text-amber-600">Perlu Review</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium">Klik untuk verifikasi paspor jamaah →</p>
        </div>

        {/* Card 3: Siap Berangkat */}
        <div
          onClick={() => onNavigateTab('manifest')}
          className="bg-white rounded-2xl border border-emerald-200 hover:border-emerald-400 p-4 shadow-2xs space-y-2 cursor-pointer transition-all hover:bg-emerald-50/20"
        >
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold">Siap Terbang</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {stats.readyToFlyCount} <span className="text-xs font-semibold text-emerald-600">Jamaah</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Paspor tervalidasi & manifes siap →</p>
        </div>

        {/* Card 4: Kuota Kursi */}
        <div
          onClick={() => onNavigateTab('quotas')}
          className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-2xs space-y-2 cursor-pointer transition-all hover:bg-slate-50"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Kapasitas Kursi</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalSeatsBooked}/{stats.totalSeatsTotal}{' '}
            <span className="text-xs font-semibold text-slate-400">Kursi</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sisa {stats.totalSeatsTotal - stats.totalSeatsBooked} kursi penerbangan
          </p>
        </div>
      </div>
    </div>
  );
}
