'use client';

import React, { useState } from 'react';
import { PackageItem, RoomVariant, DepartureItem } from '@/types/marketplace';
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  Sparkles,
  Plane,
  Building,
  Calendar,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  Plus,
  Minus,
  MessageCircle,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ProductDetailPageProps {
  pkg: PackageItem;
  onBack: () => void;
  onProceedToBooking: (bookingData: {
    pkg: PackageItem;
    paxCount: number;
    roomVariant: RoomVariant;
    departure: DepartureItem;
    totalPrice: number;
  }) => void;
}

export function ProductDetailPage({
  pkg,
  onBack,
  onProceedToBooking,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(pkg.galleryImages[0] || pkg.image);
  const [selectedRoom, setSelectedRoom] = useState<RoomVariant>(
    pkg.roomVariants[0] || { id: 'RM-QUAD', name: 'Quad (Sekamar Ber-4)', paxPerRoom: 4, priceDelta: 0 }
  );
  const [selectedDeparture, setSelectedDeparture] = useState<DepartureItem>(
    pkg.departures[0] || {
      id: 'DEP-1',
      departureCity: pkg.departureCity,
      departureDate: pkg.departureDate,
      airline: pkg.airline,
      quotaTotal: pkg.quotaTotal,
      quotaTaken: pkg.quotaTaken,
    }
  );
  const [paxCount, setPaxCount] = useState(2);
  const [activeTab, setActiveTab] = useState<'detail' | 'hotel' | 'itinerary' | 'syarat'>('detail');

  // Perhitungan Finansial
  const unitPrice = pkg.price + selectedRoom.priceDelta;
  const totalPrice = unitPrice * paxCount;
  const totalCashback = pkg.commissionAffiliate * paxCount;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pkg.title,
        text: `Lihat ${pkg.title} di UmrohHub!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan paket telah disalin ke clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog Paket
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Bagikan
          </button>
        </div>
      </div>

      {/* 3-COLUMN PDP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            KOLOM 1: GALLERY & MEDIA SHOWCASE (KIRI - 4 Kolom)
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={selectedImage}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-800 shadow-xs backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {pkg.skKemenag}
            </span>
          </div>

          {/* Thumbnail Carousel Strip */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {pkg.galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  selectedImage === img
                    ? 'border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Biro Official Store Card Mini */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl shadow-2xs">
                🕋
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                  {pkg.travelName}
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{pkg.skKemenag}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">Toko Resmi Terverifikasi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => alert(`Membuka etalase resmi ${pkg.travelName}`)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors text-center cursor-pointer"
              >
                Kunjungi Toko
              </button>
              <button
                type="button"
                onClick={() => alert(`Membuka obrolan langsung WhatsApp dengan CS ${pkg.travelName}`)}
                className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-800 transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Chat CS
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            KOLOM 2: DETAIL PRODUK, VARIAN & TABS (TENGAH - 5 Kolom)
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Header Info & Title */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {pkg.category}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">Terjual {pkg.soldCount}+ jamaah</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-500 font-bold">★ {pkg.rating} (Ulasan Terverifikasi)</span>
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {pkg.title}
            </h1>

            {/* Price Box */}
            <div className="pt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                Rp {unitPrice.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-500 font-medium">/pax ({selectedRoom.name})</span>
              {pkg.commissionAffiliate > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ml-auto">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Cashback Rp {(pkg.commissionAffiliate / 1000).toLocaleString('id-ID')} Rb
                </span>
              )}
            </div>
          </div>

          {/* Variant Selector Ala Tokopedia */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            {/* Tipe Kamar */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-2">
                Pilih Tipe Kamar: <strong className="text-emerald-700">{selectedRoom.name}</strong>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {pkg.roomVariants.map((rm) => {
                  const isSelected = selectedRoom.id === rm.id;
                  return (
                    <button
                      key={rm.id}
                      type="button"
                      onClick={() => setSelectedRoom(rm)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-2xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">{rm.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {rm.priceDelta > 0 ? `+Rp ${(rm.priceDelta / 1000000).toFixed(1)}Jt` : 'Termasuk'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jadwal Keberangkatan */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 block mb-2">
                Pilih Jadwal Keberangkatan:
              </label>
              <div className="space-y-2">
                {pkg.departures.map((dep) => {
                  const isSelected = selectedDeparture.id === dep.id;
                  return (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => setSelectedDeparture(dep)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-2xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs font-medium">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-slate-900 block">{dep.departureDate}</span>
                          <span className="text-[11px] text-slate-500">{dep.departureCity} • {dep.airline}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-600 font-semibold">
                        Sisa {dep.quotaTotal - dep.quotaTaken} kursi
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Detail Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
              {[
                { id: 'detail', label: 'Detail Paket' },
                { id: 'hotel', label: 'Hotel & Fasilitas' },
                { id: 'itinerary', label: `Itinerary (${pkg.durationDays} Hari)` },
                { id: 'syarat', label: 'Syarat & Paspor' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-800 bg-white font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5 text-xs text-slate-700 leading-relaxed">
              {activeTab === 'detail' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Maskapai</span>
                      <span className="font-bold text-slate-900">{pkg.airline} ({pkg.flightType})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Durasi Ibadah</span>
                      <span className="font-bold text-slate-900">{pkg.durationDays} Hari Perjalanan</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kota Keberangkatan</span>
                      <span className="font-bold text-slate-900">{selectedDeparture.departureCity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tanggal Terbang</span>
                      <span className="font-bold text-slate-900">{selectedDeparture.departureDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">Biaya Sudah Termasuk (Inclusions):</h4>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                      {pkg.inclusions.map((inc, i) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'hotel' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      Hotel Makkah
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{pkg.hotelMakkah}</h5>
                    <p className="text-slate-600 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Jarak: {pkg.hotelMakkahDistance || 'Dekat Masjidil Haram'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                      Hotel Madinah
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{pkg.hotelMadinah}</h5>
                    <p className="text-slate-600 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      Jarak: {pkg.hotelMadinahDistance || 'Dekat Masjid Nabawi'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-3">
                  {pkg.itinerary.map((it) => (
                    <div key={it.day} className="flex gap-3 items-start border-l-2 border-emerald-500 pl-3 py-1">
                      <div className="font-bold text-emerald-800 shrink-0">Hari {it.day}</div>
                      <div>
                        <h5 className="font-bold text-slate-900">{it.title}</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5">{it.description}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">📍 {it.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'syarat' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <strong className="block font-bold">Ketentuan Paspor Kemenag RI (Kepdirjen PHU):</strong>
                    <p className="text-[11px] leading-relaxed">
                      Masa berlaku paspor wajib aktif minimal 7 bulan terhitung dari tanggal terbang ({selectedDeparture.departureDate}). Nama di paspor minimal 3 kata untuk visa umroh.
                    </p>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    <li>Paspor asli yang masih berlaku ≥ 7 bulan.</li>
                    <li>Buku nikah asli bagi suami-istri.</li>
                    <li>Akta lahir bagi anak-anak.</li>
                    <li>Pasfoto terbaru latar belakang putih 4x6 (zoom 80% wajah).</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            KOLOM 3: STICKY BOOKING SUMMARY BOX (KANAN - 3 Kolom)
           ========================================================================= */}
        <div className="lg:col-span-3 sticky top-20 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Ringkasan Booking
            </h3>

            {/* Jumlah Jamaah Counter */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Jumlah Jamaah:</span>
                <span className="text-emerald-700">{paxCount} Pax</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setPaxCount((c) => Math.max(1, c - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer disabled:opacity-40"
                  disabled={paxCount <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-slate-900">{paxCount} Orang</span>
                <button
                  type="button"
                  onClick={() => setPaxCount((c) => Math.min(10, c + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Harga per pax</span>
                <span>Rp {unitPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total ({paxCount} pax)</span>
                <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              {totalCashback > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Potensi Cashback</span>
                  <span>-Rp {totalCashback.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-black text-slate-900 text-sm">
                <span>Total Biaya:</span>
                <span className="text-lg text-emerald-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* CTA Button: Menghubungkan langsung ke Alur Dokumen Paspor! */}
            <button
              type="button"
              onClick={() =>
                onProceedToBooking({
                  pkg,
                  paxCount,
                  roomVariant: selectedRoom,
                  departure: selectedDeparture,
                  totalPrice,
                })
              }
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs tracking-wide uppercase shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lanjut & Lengkapi Paspor</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dana aman dalam perlindungan Escrow Platform.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Biro Berizin Resmi PPIU Kemenag RI (5 Pasti).</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
