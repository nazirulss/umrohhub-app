'use client';

import React from 'react';
import Image from 'next/image';
import { PackageItem } from '@/types/marketplace';
import {
  Plane,
  Building,
  Building2,
  Calendar,
  Clock,
  Gift,
  Check,
  MapPin,
  Star,
} from 'lucide-react';

interface PackageCardProps {
  pkg: PackageItem;
  onSelect: (pkg: PackageItem) => void;
}

export function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const quotaRemaining = pkg.quotaTotal - pkg.quotaTaken;

  // Format tanggal keberangkatan: DD/MM/YY (contoh: 14/10/26)
  const formatDateShort = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Format cashback dalam ribuan (contoh: Rp 750 Rb)
  const formatCashback = (amount: number) => {
    const rb = Math.round(amount / 1000);
    return `Rp ${rb.toLocaleString('id-ID')} Rb`;
  };

  return (
    <div
      onClick={() => onSelect(pkg)}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all duration-300 p-2 sm:p-3 flex flex-row gap-2.5 sm:gap-3.5 cursor-pointer"
    >
      {/* Gambar di Sisi Kiri dengan Badge PROMO & Verifikasi (archive/index.html) */}
      <div className="relative w-[104px] h-[104px] sm:w-[125px] sm:h-[125px] shrink-0 rounded-lg overflow-hidden bg-slate-100">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 110px, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
        />

        {/* Badge PROMO / Kategori */}
        <div className="absolute top-1 left-1 z-10">
          <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black bg-[#00aa5b] text-white tracking-wider shadow-xs uppercase">
            {pkg.category === 'Hemat' ? 'PROMO' : pkg.category}
          </span>
        </div>

        {/* Lingkaran Centang Hijau Verifikasi PPIU di Sudut Kanan Bawah Gambar */}
        <div className="absolute bottom-1 right-1 z-10">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#00aa5b] text-white flex items-center justify-center shadow-sm border-[1.5px] border-white">
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Info Produk di Sisi Kanan (archive/index.html) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Judul & Nama Biro Travel */}
        <div>
          <h3 className="text-[12.5px] sm:text-[14px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {pkg.title}
          </h3>

          <div className="flex items-center gap-1 text-[10.5px] sm:text-xs text-slate-600 font-semibold mt-0.5">
            <Building2 className="w-3 h-3 text-[#00aa5b] shrink-0" />
            <span className="truncate text-slate-800">{pkg.travelName}</span>
            <span className="text-[#00aa5b] font-bold shrink-0 text-[9px] sm:text-xs">✓</span>
            <div className="ml-auto shrink-0 flex items-center gap-0.5 text-amber-500 text-[10px] sm:text-xs font-bold">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              <span>{pkg.rating}</span>
            </div>
          </div>
        </div>

        {/* Baris Meta Info: Tanggal, Durasi, Kota Asal, Maskapai */}
        <div className="pt-0.5">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0 text-[9.5px] sm:text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-0.5" title="Tanggal Keberangkatan">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              <span>{formatDateShort(pkg.departureDate)}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-0.5" title="Durasi Perjalanan">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              <span>{pkg.durationDays} Hari</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-0.5" title="Kota Keberangkatan">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              <span>{pkg.departureCity.split(' ')[0]}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-0.5" title="Maskapai Penerbangan">
              <Plane className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              <span>{pkg.airline.split(' ')[0]}</span>
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{pkg.hotelMakkah}</span>
          </div>
        </div>

        {/* Baris Bawah: Harga, Badge Cashback, dan Sisa Kuota */}
        <div className="mt-auto pt-1.5 border-t border-dashed border-slate-200 flex items-center justify-between gap-1 sm:gap-2">
          <div className="text-[13.5px] sm:text-[16px] font-extrabold text-[#007a41] whitespace-nowrap">
            Rp {pkg.price.toLocaleString('id-ID')}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {pkg.commissionAffiliate > 0 && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                {formatCashback(pkg.commissionAffiliate)}
              </span>
            )}

            <span className="text-[9.5px] sm:text-xs text-slate-500 whitespace-nowrap font-medium">
              Sisa <span className={quotaRemaining <= 10 ? 'text-amber-600 font-bold' : 'text-slate-700 font-semibold'}>{quotaRemaining}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
