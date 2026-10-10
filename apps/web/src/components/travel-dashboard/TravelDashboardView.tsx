'use client';

import React, { useState } from 'react';
import {
  MOCK_TRAVEL_STATS,
  MOCK_DEPARTURES,
  MOCK_BIRO_PASSPORTS,
} from '@/data/mock-travel-data';
import { DepartureQuotaItem, BiroPassportItem } from '@/types/travel-dashboard';
import { TravelOverviewStats } from './TravelOverviewStats';
import { DepartureQuotaManager } from './DepartureQuotaManager';
import { PassportVerificationTable } from './PassportVerificationTable';
import { FlightManifestGenerator } from './FlightManifestGenerator';
import {
  LayoutDashboard,
  FileCheck,
  Plane,
  FileText,
  Building2,
  BadgeCheck,
} from 'lucide-react';

export function TravelDashboardView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'passports' | 'quotas' | 'manifest'>('overview');
  const [departures, setDepartures] = useState<DepartureQuotaItem[]>(MOCK_DEPARTURES);
  const [passports, setPassports] = useState<BiroPassportItem[]>(MOCK_BIRO_PASSPORTS);

  // Update Quota Handler
  const handleUpdateQuota = (departureId: string, delta: number) => {
    setDepartures((prev) =>
      prev.map((d) => {
        if (d.id === departureId) {
          const newTotal = Math.max(d.quotaTaken, d.quotaTotal + delta);
          return {
            ...d,
            quotaTotal: newTotal,
            status: newTotal === d.quotaTaken ? 'FULL' : newTotal - d.quotaTaken <= 5 ? 'ALMOST_FULL' : 'OPEN',
          };
        }
        return d;
      })
    );
  };

  const handleToggleStatus = (departureId: string) => {
    setDepartures((prev) =>
      prev.map((d) => (d.id === departureId ? { ...d, status: d.status === 'FULL' ? 'OPEN' : 'FULL' } : d))
    );
  };

  // Passport Verification Handler
  const handleVerifyPassport = (
    id: string,
    status: 'TERVERIFIKASI' | 'PERLU_REVISI',
    rejectionReason?: string
  ) => {
    setPassports((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status,
            rejectionReason: rejectionReason || '',
          };
        }
        return p;
      })
    );
  };

  // Stats recalculated dynamically
  const pendingCount = passports.filter((p) => p.status === 'MENUNGGU_VERIFIKASI').length;
  const verifiedCount = passports.filter((p) => p.status === 'TERVERIFIKASI').length;
  const totalSeatsTotal = departures.reduce((acc, d) => acc + d.quotaTotal, 0);
  const totalSeatsBooked = departures.reduce((acc, d) => acc + d.quotaTaken, 0);

  const dynamicStats = {
    ...MOCK_TRAVEL_STATS,
    pendingPassportReview: pendingCount,
    readyToFlyCount: verifiedCount,
    totalSeatsTotal,
    totalSeatsBooked,
  };

  return (
    <div className="space-y-6">
      {/* Top Section Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'overview', label: 'Ringkasan & Operasional', icon: LayoutDashboard },
            {
              id: 'passports',
              label: 'Verifikasi Paspor',
              icon: FileCheck,
              badge: pendingCount > 0 ? pendingCount : undefined,
            },
            { id: 'quotas', label: 'Manajemen Kuota Terbang', icon: Plane },
            { id: 'manifest', label: 'Manifes Penerbangan Maskapai', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 text-xs text-slate-500 font-medium">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span>Izin Resmi PPIU No. 412/2021 Terverifikasi</span>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <TravelOverviewStats
            stats={dynamicStats}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <DepartureQuotaManager
                departures={departures.slice(0, 3)}
                onUpdateQuota={handleUpdateQuota}
                onToggleStatus={handleToggleStatus}
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Paspor Membutuhkan Perhatian ({pendingCount})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('passports')}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Lihat Semua →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {passports.filter((p) => p.status === 'MENUNGGU_VERIFIKASI').slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">{p.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {p.passportNumber} • Exp: {p.expiryDate}
                        </span>
                        {p.isCritical && (
                          <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                            ⚠️ Sisa {p.diffMonths} bln (&lt;7 bln Kemenag)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('passports')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Passports */}
      {activeTab === 'passports' && (
        <PassportVerificationTable
          passports={passports}
          onVerify={handleVerifyPassport}
        />
      )}

      {/* Tab 3: Quotas */}
      {activeTab === 'quotas' && (
        <DepartureQuotaManager
          departures={departures}
          onUpdateQuota={handleUpdateQuota}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Tab 4: Manifest */}
      {activeTab === 'manifest' && (
        <FlightManifestGenerator
          departures={departures}
          passports={passports}
        />
      )}
    </div>
  );
}
