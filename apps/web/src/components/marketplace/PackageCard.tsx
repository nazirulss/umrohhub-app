'use client';

import React from 'react';
import { PackageItem } from '@/types/marketplace';
import {
  Plane,
  Building,
  Calendar,
  CheckCircle2,
  Sparkles,
  MapPin,
  Users,
} from 'lucide-react';

interface PackageCardProps {
  pkg: PackageItem;
  onSelect: (pkg: PackageItem) => void;
}

export function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const quotaRemaining = pkg.quotaTotal - pkg.quotaTaken;
  const quotaPercent = Math.round((pkg.quotaTaken / pkg.quotaTotal) * 100);
  const cashbackK = Math.round(pkg.commissionAffiliate / 1000);

  return (
    <div
      onClick={() => onSelect(pkg)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Top Banner Image with Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-800 backdrop-blur-xs shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {pkg.skKemenag}
          </span>
          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs">
            {pkg.category}
          </span>
        </div>

        {/* Bottom Bar inside Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
          <span className="flex items-center gap-1 drop-shadow-sm">
            <Calendar className="w-3.5 h-3.5" />
            {pkg.durationDays} Hari
          </span>
          <span className="flex items-center gap-1 drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5" />
            {pkg.departureCity.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Title & Travel Info */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {pkg.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="truncate">{pkg.travelName}</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-500 font-bold">★ {pkg.rating}</span>
          </div>
        </div>

        {/* Airline & Hotel Badges */}
        <div className="space-y-1 pt-1 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <Plane className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{pkg.airline} ({pkg.flightType})</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{pkg.hotelMakkah}</span>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Sisa Kuota: <strong className={quotaRemaining <= 10 ? 'text-amber-600' : 'text-slate-700'}>{quotaRemaining} kursi</strong>
            </span>
            <span>{quotaPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${quotaPercent}%` }}
              className={`h-full rounded-full transition-all ${
                quotaRemaining <= 10 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
            />
          </div>
        </div>

        {/* Price & Affiliate Cashback */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Mulai Dari</span>
            <div className="text-base font-extrabold text-slate-900">
              Rp {pkg.price.toLocaleString('id-ID')}
              <span className="text-[10px] font-normal text-slate-500"> /pax</span>
            </div>
          </div>

          {pkg.commissionAffiliate > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Cashback {cashbackK}Rb
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
