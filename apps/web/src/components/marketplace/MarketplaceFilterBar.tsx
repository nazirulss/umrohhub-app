'use client';

import React from 'react';
import { MarketplaceFilterState, SortOption } from '@/types/marketplace';
import {
  SlidersHorizontal,
  Flame,
  Calendar,
  ArrowDownUp,
  Star,
  Sparkles,
  X,
  MapPin,
  Tag,
  RotateCcw,
} from 'lucide-react';

interface MarketplaceFilterBarProps {
  filters: MarketplaceFilterState;
  onFilterChange: (newFilters: Partial<MarketplaceFilterState>) => void;
  onOpenFilterModal: () => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function MarketplaceFilterBar({
  filters,
  onFilterChange,
  onOpenFilterModal,
  onResetFilters,
  totalResults,
}: MarketplaceFilterBarProps) {
  const activeFiltersCount = [
    Boolean(filters.category),
    Boolean(filters.departureCity),
    filters.minPrice !== null,
    filters.maxPrice !== null,
    Boolean(filters.airline),
    filters.cashbackOnly,
    filters.sortBy !== 'recommended',
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Sub-Tabs: Semua Paket vs Biro Travel PPIU */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => onFilterChange({ activeTab: 'packages' })}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            filters.activeTab === 'packages'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Paket Umroh ({totalResults})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ activeTab: 'travels' })}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            filters.activeTab === 'travels'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Biro Travel PPIU Kemenag
        </button>
      </div>

      {/* Segmented Quick Sort Pills ala Kuliner Demak */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              sortBy: 'recommended',
              cashbackOnly: false,
              category: '',
            })
          }
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filters.sortBy === 'recommended' && !filters.cashbackOnly && !filters.category
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Paling Sesuai
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ sortBy: 'departure_asc' })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filters.sortBy === 'departure_asc'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Berangkat Terdekat
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ sortBy: 'price_asc' })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filters.sortBy === 'price_asc'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          Harga Terendah
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ category: filters.category === 'VIP' ? '' : 'VIP' })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filters.category === 'VIP'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          VIP Bintang 5
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ cashbackOnly: !filters.cashbackOnly })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filters.cashbackOnly
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ada Cashback
        </button>
      </div>

      {/* Quick Filter Strip (Scrollable Tokopedia Style) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {/* Tombol Buka Modal Filter Lengkap */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
            activeFiltersCount > 0
              ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Quick Dropdown: Kota Asal */}
        <select
          value={filters.departureCity}
          onChange={(e) => onFilterChange({ departureCity: e.target.value })}
          className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-emerald-600 cursor-pointer"
        >
          <option value="">📍 Semua Kota Asal</option>
          <option value="Jakarta (CGK)">Jakarta (CGK)</option>
          <option value="Surabaya (SUB)">Surabaya (SUB)</option>
          <option value="Solo (SOC)">Solo (SOC)</option>
          <option value="Medan (KNO)">Medan (KNO)</option>
          <option value="Makassar (UPG)">Makassar (UPG)</option>
        </select>

        {/* Quick Dropdown: Kategori */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-emerald-600 cursor-pointer"
        >
          <option value="">🏷️ Semua Kategori</option>
          <option value="Reguler">Reguler</option>
          <option value="VIP">VIP Bintang 5</option>
          <option value="Ramadhan">Ramadhan</option>
          <option value="Hemat">Hemat</option>
          <option value="Plus Wisata">Plus Wisata</option>
        </select>

        {/* Quick Reset All */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Filter Aktif:</span>

          {filters.departureCity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <MapPin className="w-3 h-3" />
              {filters.departureCity}
              <button
                type="button"
                onClick={() => onFilterChange({ departureCity: '' })}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Tag className="w-3 h-3" />
              {filters.category}
              <button
                type="button"
                onClick={() => onFilterChange({ category: '' })}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.cashbackOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Ada Cashback
              <button
                type="button"
                onClick={() => onFilterChange({ cashbackOnly: false })}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
