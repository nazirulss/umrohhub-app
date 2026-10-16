'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { BiroItem, MOCK_BIRO_LIST } from '@/data/mock-biro-directory';
import { PackageItem } from '@/types/marketplace';
import {
  Search,
  MapPin,
  Building2,
  Check,
  Star,
  Users,
  Package,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  X,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface BiroDirectoryViewProps {
  packages: PackageItem[];
  onSelectPackage: (pkg: PackageItem) => void;
  onOpenOwnerDashboard?: () => void;
  onNavigateMap?: () => void;
}

const CITY_CHIPS = [
  { key: 'all', label: 'Semua Kota' },
  { key: 'Jakarta', label: 'Jakarta' },
  { key: 'Surabaya', label: 'Surabaya' },
  { key: 'Bandung', label: 'Bandung' },
  { key: 'Solo', label: 'Solo' },
  { key: 'Semarang', label: 'Semarang' },
  { key: 'Makassar', label: 'Makassar' },
  { key: 'Medan', label: 'Medan' },
];

export function BiroDirectoryView({
  packages,
  onSelectPackage,
  onOpenOwnerDashboard,
  onNavigateMap,
}: BiroDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedBiroForStore, setSelectedBiroForStore] = useState<BiroItem | null>(null);
  const [activeMapBiro, setActiveMapBiro] = useState<BiroItem | null>(null);
  const [isAllMapOpen, setIsAllMapOpen] = useState(false);

  // Filter biro list
  const filteredBiroList = useMemo(() => {
    let list = [...MOCK_BIRO_LIST];

    if (selectedCity !== 'all') {
      const c = selectedCity.toLowerCase();
      list = list.filter((b) => b.city.toLowerCase().includes(c));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.skKemenag.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCity, searchQuery]);

  // Packages belonging to selected biro
  const biroPackages = useMemo(() => {
    if (!selectedBiroForStore) return [];
    return packages.filter(
      (p) =>
        p.travelId === selectedBiroForStore.id ||
        (p.travelName &&
          selectedBiroForStore.name &&
          p.travelName.toLowerCase().trim().includes(selectedBiroForStore.name.toLowerCase().trim()))
    );
  }, [selectedBiroForStore, packages]);

  // =========================================================================
  // SUB-VIEW: TRAVEL STORE (PROFIL TOKO BIRO RESMI PPIU)
  // =========================================================================
  if (selectedBiroForStore) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto pb-10">
        {/* Tombol Kembali ke Direktori */}
        <button
          type="button"
          onClick={() => setSelectedBiroForStore(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Direktori Biro</span>
        </button>

        {/* Banner Cover Toko */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm h-36 sm:h-52 bg-slate-900">
          <Image
            src={
              selectedBiroForStore.bannerUrl ||
              'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80'
            }
            alt={selectedBiroForStore.name}
            fill
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        </div>

        {/* Profile Card Header Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-4 -mt-10 sm:-mt-14 relative z-10 mx-2 sm:mx-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00aa5b] text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0 border-2 border-white">
                🕌
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
                    {selectedBiroForStore.name}
                  </h1>
                  <span className="w-4 h-4 rounded-full bg-[#00aa5b] text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                    Official Store PPIU
                  </span>
                </div>
                {selectedBiroForStore.tagline && (
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    &ldquo;{selectedBiroForStore.tagline}&rdquo;
                  </p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                  <span>📍 Kantor: <strong>{selectedBiroForStore.city}</strong></span>
                  <span>&bull;</span>
                  <span>📜 No. SK: <strong>{selectedBiroForStore.skKemenag}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMapBiro(selectedBiroForStore)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Peta Lokasi</span>
              </button>
              <a
                href={`https://wa.me/6281299001122?text=Assalamu'alaikum%20${encodeURIComponent(selectedBiroForStore.name)},%20saya%20ingin%20konsultasi%20paket%20umroh.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00aa5b] hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <span>💬 Chat Biro</span>
              </a>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3 sm:gap-6 text-xs text-slate-600 flex-wrap">
            <span className="flex items-center gap-1">
              ⭐ <strong>{selectedBiroForStore.rating} / 5.0</strong> Rating
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              👥 <strong>{selectedBiroForStore.jamaahTotal}</strong> Jamaah
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              📦 <strong>{biroPackages.length > 0 ? biroPackages.length : selectedBiroForStore.packagesCount}</strong> Paket Aktif
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              🛡️ <strong>{selectedBiroForStore.accreditation || 'Akreditasi A'}</strong>
            </span>
          </div>
        </div>

        {/* Katalog Paket dari Biro Ini */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Paket Umroh Tersedia ({biroPackages.length > 0 ? biroPackages.length : packages.slice(0, 3).length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Garansi 5 Pasti Kemenag RI
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            {(biroPackages.length > 0 ? biroPackages : packages.slice(0, 3)).map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs p-2.5 sm:p-3 flex items-stretch gap-2.5 sm:gap-3 transition-all cursor-pointer group"
              >
                <div className="relative w-[104px] h-[104px] shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-1 left-1 bg-[#00aa5b] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs tracking-wider z-10">
                    PROMO
                  </span>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                  <div>
                    <h3 className="font-bold text-[12.5px] text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {pkg.title}
                    </h3>
                    <p className="text-[9.5px] text-slate-500 mt-1">
                      ⏱️ {pkg.durationDays} Hari &bull; 📍 {pkg.departureCity} &bull; ✈️ {pkg.airline.split(' ')[0]}
                    </p>
                  </div>
                  <div className="pt-1 border-t border-dashed border-slate-200 flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-emerald-800">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 group-hover:underline">
                      Lihat Detail &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN VIEW: DIREKTORI BIRO PPIU (SESUAI SCREENSHOT UMROHPEDIA)
  // =========================================================================
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 1. Header Section ala Umrohpedia */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-[#00aa5b] shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                Direktori Biro PPIU
              </h1>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] sm:text-[10.5px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] whitespace-nowrap">
                ✓ Kemenag RI
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
              Biro resmi terdaftar Kemenag RI
            </p>
          </div>
        </div>

        {/* Right Action: Peta Biro Button & Count Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => (onNavigateMap ? onNavigateMap() : setIsAllMapOpen(true))}
            title="Buka Peta Lokasi Seluruh Biro PPIU"
            className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 text-[10.5px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>🗺️ Peta Biro</span>
            <span>&rsaquo;</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] whitespace-nowrap shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{filteredBiroList.length} Biro</span>
          </span>
        </div>
      </div>

      {/* 2. Live Search Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari nama biro travel, kota, atau nomor izin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 placeholder-slate-400 font-medium focus:border-emerald-600 focus:outline-hidden shadow-2xs transition-all"
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

      {/* 3. Horizontal Scrollable City Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CITY_CHIPS.map((c) => {
          const isActive = selectedCity === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCity(c.key)}
              className={`px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#00aa5b] text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:border-emerald-500 hover:bg-emerald-50/40'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 4. Biro Directory Cards List */}
      {filteredBiroList.length > 0 ? (
        <div className="space-y-2 sm:space-y-2.5">
          {filteredBiroList.map((biro) => (
            <div
              key={biro.id}
              onClick={() => setSelectedBiroForStore(biro)}
              className="bg-white rounded-xl border border-slate-100/90 hover:border-emerald-500/50 shadow-2xs hover:shadow-xs p-2.5 sm:p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer group"
            >
              {/* Left Side: Avatar & Information */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Mosque Avatar with Verified Pin */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] text-[#047857] flex items-center justify-center text-xl sm:text-2xl border border-emerald-500/15 shadow-2xs">
                    🕌
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00aa5b] text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-xs"
                    title="Biro Terverifikasi Kemenag RI"
                  >
                    ✓
                  </span>
                </div>

                {/* Biro Body Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className="font-bold text-[12.5px] sm:text-[13.5px] text-slate-900 group-hover:text-emerald-700 transition-colors truncate"
                      title={biro.name}
                    >
                      {biro.name}
                    </h3>
                  </div>

                  {/* SK Number Badge */}
                  <div className="my-0.5">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#065f46] bg-[#d1fae5] px-1.5 py-0.2 rounded">
                      🛡️ {biro.skKemenag}
                    </span>
                  </div>

                  {/* Stats Meta Row */}
                  <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span>📍 {biro.city}</span>
                    <span className="text-slate-300">•</span>
                    <span>👥 {biro.jamaahTotal}</span>
                    <span className="text-slate-300">•</span>
                    <span>📦 {biro.packagesCount} Paket</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMapBiro(biro);
                  }}
                  title="Lihat titik lokasi biro di peta"
                  className="px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-[10.5px] sm:text-xs font-semibold shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>Peta</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBiroForStore(biro);
                  }}
                  className="px-2.5 sm:px-3 py-1 rounded-lg border border-emerald-500/80 bg-white hover:bg-emerald-50/60 text-[#00aa5b] text-[10.5px] sm:text-xs font-bold shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Lihat</span>
                  <span>&rsaquo;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2.5">
          <div className="text-3xl">🔍</div>
          <h4 className="font-bold text-xs text-slate-800">Biro tidak ditemukan</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian lain atau pilih tab Semua Kota.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('all');
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* 5. Link B2B Travel Owner Portal */}
      {onOpenOwnerDashboard && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenOwnerDashboard}
            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            💼 Pemilik Biro Travel? Masuk ke Dashboard Manajemen PPIU &rarr;
          </button>
        </div>
      )}

      {/* =======================================================================
          MODAL: PETA LOKASI BIRO (SINGLE BIRO ATAU SELURUH BIRO)
         ======================================================================= */}
      {(activeMapBiro || isAllMapOpen) && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3"
          onClick={() => {
            setActiveMapBiro(null);
            setIsAllMapOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 space-y-3.5 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeMapBiro ? activeMapBiro.name : 'Peta Persebaran Biro PPIU'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {activeMapBiro ? activeMapBiro.city : 'Tersebar di kota-kota besar Indonesia'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveMapBiro(null);
                  setIsAllMapOpen(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Map Frame Visual Simulator */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-emerald-50/50 p-4 space-y-2.5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl shadow-xs">
                🕌
              </div>
              {activeMapBiro ? (
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800">
                    {activeMapBiro.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed px-2">
                    {activeMapBiro.address}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-mono font-semibold pt-1">
                    Koordinat: {activeMapBiro.lat}, {activeMapBiro.lng}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800">
                    7 Biro Resmi Terverifikasi Kemenag
                  </h4>
                  <p className="text-[11px] text-slate-600 px-2">
                    Jakarta, Surabaya, Bandung, Semarang, Makassar, Medan
                  </p>
                </div>
              )}
            </div>

            {/* CTA Buka di Google Maps */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <a
                href={
                  activeMapBiro
                    ? activeMapBiro.gmapsUrl
                    : 'https://maps.google.com/?q=PPIU+Kemenag+Indonesia'
                }
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00aa5b] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
