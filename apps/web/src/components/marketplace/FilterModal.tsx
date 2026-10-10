'use client';

import React, { useState, useEffect } from 'react';
import { MarketplaceFilterState, SortOption } from '@/types/marketplace';
import { X, Check } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MarketplaceFilterState;
  onApply: (newFilters: Partial<MarketplaceFilterState>) => void;
  onReset: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<MarketplaceFilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Filter Lengkap</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
            >
              Hapus Semua
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section 1: Rentang Harga */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-sm block">
              Rentang Harga (Rp)
            </label>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Harga Minimum</span>
                <input
                  type="number"
                  placeholder="Rp 20.000.000"
                  value={localFilters.minPrice || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      minPrice: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden text-xs font-semibold"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Harga Maksimum</span>
                <input
                  type="number"
                  placeholder="Rp 50.000.000"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kategori Paket */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-sm block">
              Kategori Paket
            </label>
            <div className="flex flex-wrap gap-2">
              {['Reguler', 'VIP', 'Ramadhan', 'Hemat', 'Plus Wisata'].map((cat) => {
                const isSelected = localFilters.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        category: isSelected ? '' : cat,
                      }))
                    }
                    className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Kota Keberangkatan */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-sm block">
              Kota Asal Keberangkatan
            </label>
            <div className="flex flex-wrap gap-2">
              {['Jakarta (CGK)', 'Surabaya (SUB)', 'Solo (SOC)', 'Medan (KNO)', 'Makassar (UPG)'].map((city) => {
                const isSelected = localFilters.departureCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        departureCity: isSelected ? '' : city,
                      }))
                    }
                    className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Maskapai Penerbangan */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-sm block">
              Maskapai Penerbangan
            </label>
            <div className="flex flex-wrap gap-2">
              {['Saudia Airlines', 'Garuda Indonesia', 'Turkish Airlines', 'Lion Air Direct'].map((air) => {
                const isSelected = localFilters.airline === air;
                return (
                  <button
                    key={air}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        airline: isSelected ? '' : air,
                      }))
                    }
                    className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {air}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Urutkan */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-sm block">
              Urutkan Berdasarkan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'recommended', label: '🔥 Paling Sesuai' },
                { id: 'departure_asc', label: '🗓️ Berangkat Terdekat' },
                { id: 'price_asc', label: '💰 Harga Terendah' },
                { id: 'price_desc', label: '💎 Harga Tertinggi' },
              ].map((opt) => {
                const isSelected = localFilters.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: opt.id as SortOption,
                      }))
                    }
                    className={`p-2.5 rounded-xl text-left font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}
