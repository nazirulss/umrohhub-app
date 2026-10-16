'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { PackageItem } from '@/types/marketplace';
import { Search, RotateCcw, Calendar, Check, ShieldCheck } from 'lucide-react';

interface ScheduleViewProps {
  packages: PackageItem[];
  onSelectPackage: (pkg: PackageItem) => void;
}

interface FlattenedDeparture {
  id: string;
  package: PackageItem;
  departureCity: string;
  departureDate: string;
  airline: string;
  quotaTotal: number;
  quotaTaken: number;
  price: number;
}

const MONTH_TABS = [
  { key: 'all', label: 'Semua Jadwal', sub: 'Musim 1448H' },
  { key: '2026-10', label: 'Okt 2026', sub: 'Awal Musim' },
  { key: '2026-11', label: 'Nov 2026', sub: 'Musim Dingin' },
  { key: '2026-12', label: 'Des 2026', sub: 'Libur Akhir Tahun' },
  { key: '2027-01', label: 'Jan 2027', sub: 'Rajab 1448H' },
  { key: '2027-02', label: 'Feb 2027', sub: "Sya'ban 1448H" },
  { key: '2027-03', label: 'Mar 2027', sub: 'Ramadhan 1448H' },
];

const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const monthNamesIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sept', 'Okt', 'Nov', 'Des'];

function formatIndoDate(dateStr: string): string {
  if (!dateStr) return 'Senin, 14 Sept 2026';
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    const dayName = !isNaN(dt.getDay()) ? dayNamesIndo[dt.getDay()] : 'Senin';
    const monthName = monthNamesIndo[m] || 'Sept';
    return `${dayName}, ${d} ${monthName} ${y}`;
  }
  const dt = new Date(dateStr);
  if (!isNaN(dt.getTime())) {
    const dayName = dayNamesIndo[dt.getDay()];
    const monthName = monthNamesIndo[dt.getMonth()];
    return `${dayName}, ${dt.getDate()} ${monthName} ${dt.getFullYear()}`;
  }
  return dateStr;
}

export function ScheduleView({ packages, onSelectPackage }: ScheduleViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedAirline, setSelectedAirline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Flatten departures from all packages
  const allDepartures = useMemo(() => {
    const list: FlattenedDeparture[] = [];
    (packages || []).forEach((pkg) => {
      const deps = pkg.departures && pkg.departures.length > 0 ? pkg.departures : [
        {
          id: `${pkg.id}-DEP`,
          departureCity: pkg.departureCity || 'Jakarta (CGK)',
          departureDate: pkg.departureDate || '2026-10-15',
          airline: pkg.airline || 'Saudia Airlines',
          quotaTotal: pkg.quotaTotal || 45,
          quotaTaken: pkg.quotaTaken || 8,
        }
      ];

      deps.forEach((dep) => {
        list.push({
          id: dep.id,
          package: pkg,
          departureCity: dep.departureCity || pkg.departureCity,
          departureDate: dep.departureDate || pkg.departureDate,
          airline: dep.airline || pkg.airline,
          quotaTotal: dep.quotaTotal || pkg.quotaTotal,
          quotaTaken: dep.quotaTaken || pkg.quotaTaken,
          price: pkg.price,
        });
      });
    });

    return list;
  }, [packages]);

  // 2. Filter & Sort departures
  const filteredDepartures = useMemo(() => {
    let result = [...allDepartures];

    // Month filter
    if (selectedMonth !== 'all') {
      result = result.filter((item) => (item.departureDate || '').startsWith(selectedMonth));
    }

    // City filter
    if (selectedCity !== 'all') {
      const c = selectedCity.toLowerCase();
      result = result.filter((item) => item.departureCity.toLowerCase().includes(c));
    }

    // Airline filter
    if (selectedAirline !== 'all') {
      const a = selectedAirline.toLowerCase();
      result = result.filter((item) => item.airline.toLowerCase().includes(a));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        item.package.title.toLowerCase().includes(q) ||
        item.package.travelName.toLowerCase().includes(q) ||
        item.departureCity.toLowerCase().includes(q) ||
        item.airline.toLowerCase().includes(q) ||
        item.package.hotelMakkah.toLowerCase().includes(q)
      );
    }

    // Sort ascending by departureDate
    result.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

    return result;
  }, [allDepartures, selectedMonth, selectedCity, selectedAirline, searchQuery]);

  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedCity('all');
    setSelectedAirline('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 1. Header Section ala Umrohpedia */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-[#00aa5b] shrink-0" />
          <div>
            <h1 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Jadwal Keberangkatan
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              Musim 1448H &bull; Seluruh biro terakreditasi resmi PPIU
            </p>
          </div>
        </div>

        {/* Count Pill Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] whitespace-nowrap shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{filteredDepartures.length} Jadwal</span>
        </span>
      </div>

      {/* 2. Horizontal Scrollable Month Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {MONTH_TABS.map((m) => {
          const isActive = selectedMonth === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelectedMonth(m.key)}
              className={`inline-flex flex-col items-center justify-center py-1.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#00aa5b] border-2 border-[#00aa5b] text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/40'
              }`}
            >
              <span className="leading-tight">{m.label}</span>
              <span className={`text-[9px] font-normal leading-tight mt-0.5 ${isActive ? 'text-white/85' : 'text-slate-400'}`}>
                {m.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Filter Controls Row: Search Input & Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        {/* Live Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Cari paket, biro, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 placeholder-slate-400 font-medium focus:border-emerald-600 focus:outline-hidden shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Dropdowns & Reset Button */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex-1 sm:flex-initial px-2.5 py-2 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 outline-hidden shadow-2xs cursor-pointer focus:border-emerald-600"
          >
            <option value="all">Semua Embarkasi</option>
            <option value="Jakarta">Jakarta (CGK)</option>
            <option value="Surabaya">Surabaya (SUB)</option>
            <option value="Solo">Solo (SOC)</option>
            <option value="Makassar">Makassar (UPG)</option>
            <option value="Medan">Medan (KNO)</option>
          </select>

          <select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className="flex-1 sm:flex-initial px-2.5 py-2 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 outline-hidden shadow-2xs cursor-pointer focus:border-emerald-600"
          >
            <option value="all">Semua Maskapai</option>
            <option value="Saudia">Saudia Airlines</option>
            <option value="Garuda">Garuda Indonesia</option>
            <option value="Emirates">Emirates</option>
            <option value="Turkish">Turkish Airlines</option>
            <option value="Oman">Oman Air</option>
            <option value="Qatar">Qatar Airways</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            title="Reset Semua Filter"
            className="px-2.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. Schedule Product Cards Grid */}
      {filteredDepartures.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
          {filteredDepartures.map((item) => {
            const pkg = item.package;
            const fullDateLabel = formatIndoDate(item.departureDate);
            const quotaLeft = Math.max(0, item.quotaTotal - item.quotaTaken);
            const cashbackStr = pkg.commissionAffiliate
              ? `Rp ${(pkg.commissionAffiliate / 1000).toFixed(0)} Rb`
              : '';
            const airlineShort = item.airline.split(' ')[0];
            const departureShort = item.departureCity.split(' ')[0];

            return (
              <div
                key={item.id}
                onClick={() => onSelectPackage(pkg)}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs p-2.5 sm:p-3 flex items-stretch gap-2.5 sm:gap-3 transition-all cursor-pointer group"
              >
                {/* Left: Squarish Thumbnail 1:1 with Badges */}
                <div className="relative w-[104px] h-[104px] sm:w-[124px] sm:h-[124px] shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Top-Left Promo Badge */}
                  <span className="absolute top-1 left-1 bg-[#00aa5b] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs tracking-wider z-10">
                    PROMO
                  </span>
                  {/* Bottom-Right Verified Badge */}
                  <span
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00aa5b] text-white flex items-center justify-center shadow-xs z-10"
                    title="Biro Resmi PPIU Terverifikasi Kemenag RI"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                </div>

                {/* Right: Content Details Strictly Synchronized to Photo */}
                <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                  {/* Baris 1: Tanggal Keberangkatan Soft Pill Biru Lembut */}
                  <div className="flex items-center">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0369a1] bg-[#e0f2fe] border border-[#bae6fd] px-1.5 py-0.5 rounded leading-tight">
                      <Calendar className="w-2.5 h-2.5 text-[#0284c7]" />
                      <span>{fullDateLabel}</span>
                    </div>
                  </div>

                  {/* Baris 2: Judul Paket (Tampil Maksimal Line Clamp 2) */}
                  <h3
                    className="font-bold text-[12.5px] sm:text-[13.5px] text-slate-900 leading-snug line-clamp-2 my-0.5 group-hover:text-emerald-700 transition-colors"
                    title={pkg.title}
                  >
                    {pkg.title}
                  </h3>

                  {/* Baris 3: Nama Travel Biro Resmi */}
                  <div className="flex items-center gap-1 text-[9.5px] text-slate-600 truncate">
                    <span>🕌</span>
                    <span className="truncate">{pkg.travelName}</span>
                    <span className="text-emerald-600 font-bold text-[9px]" title="Biro Berizin Resmi PPIU">
                      ✓
                    </span>
                  </div>

                  {/* Baris 4: Meta Info Row: Durasi • Kota • Maskapai */}
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span>⏱️ {pkg.durationDays} Hari</span>
                    <span className="text-slate-300">•</span>
                    <span>📍 {departureShort}</span>
                    <span className="text-slate-300">•</span>
                    <span>✈️ {airlineShort}</span>
                  </div>

                  {/* Baris 5: Footer: Price, Cashback & Sisa Quota */}
                  <div className="pt-1.5 mt-0.5 border-t border-dashed border-slate-200 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-[13px] sm:text-sm text-emerald-800">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      {cashbackStr && (
                        <span className="text-[8.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                          🎁 {cashbackStr}
                        </span>
                      )}
                    </div>
                    <span className={`text-[9px] font-medium shrink-0 ${quotaLeft <= 5 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                      Sisa {quotaLeft}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2.5">
          <div className="text-3xl">🗓️</div>
          <h4 className="font-bold text-xs text-slate-800">Tidak ada jadwal yang cocok</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Coba ganti filter bulan, kota embarkasi, atau hapus kata kunci pencarian Anda.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}
