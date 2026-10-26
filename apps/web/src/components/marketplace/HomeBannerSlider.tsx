'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ShieldCheck, ChevronLeft, ChevronRight, Sparkles, Star, Users, ArrowRight } from 'lucide-react';

interface BannerSlide {
  id: string;
  badgeIcon: React.ReactNode;
  badgeText: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaAction: () => void;
  imageUrl: string;
  overlayGradient: string;
}

interface HomeBannerSliderProps {
  onNavigateView: (view: 'marketplace' | 'biro' | 'schedule' | 'account' | 'orders' | 'escrow') => void;
  onFilterCategory?: (category: string) => void;
}

export function HomeBannerSlider({ onNavigateView, onFilterCategory }: HomeBannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides: BannerSlide[] = [
    {
      id: 'banner-escrow',
      badgeIcon: <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />,
      badgeText: 'Jaminan 5 Pasti Kemenag RI',
      badgeColor: 'bg-emerald-600/90 text-white border-emerald-400/40',
      title: 'Ibadah Tenang, Dana 100% Aman di Bank Syariah',
      subtitle: 'Semua biro berizin SK Kemenag RI resmi dengan proteksi rekening bersama (Escrow).',
      ctaText: 'Cek Biro PPIU Resmi',
      ctaAction: () => onNavigateView('biro'),
      imageUrl: 'https://images.unsplash.com/photo-1565552684305-7e8e7a080824?auto=format&fit=crop&w=1800&q=85',
      overlayGradient: 'from-emerald-950/95 via-emerald-950/80 to-transparent',
    },
    {
      id: 'banner-ramadhan',
      badgeIcon: <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />,
      badgeText: 'Spesial Awal Ramadhan 1448H',
      badgeColor: 'bg-amber-600/90 text-white border-amber-400/40',
      title: 'Raih Berkah Lailatul Qadar di Tanah Suci',
      subtitle: 'Hotel bintang 5 dekat pelataran Masjid Nabawi & Ka’bah dengan kepastian jadwal terbang.',
      ctaText: 'Lihat Paket Ramadhan',
      ctaAction: () => {
        if (onFilterCategory) onFilterCategory('ramadhan');
      },
      imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1800&q=85',
      overlayGradient: 'from-slate-950/95 via-emerald-950/75 to-transparent',
    },
    {
      id: 'banner-manasik',
      badgeIcon: <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300" />,
      badgeText: 'Bimbingan Sesuai Sunnah',
      badgeColor: 'bg-sky-600/90 text-white border-sky-400/40',
      title: 'Didampingi Muthawif & Tour Leader Berlisensi',
      subtitle: 'Fasilitas manasik intensif, panduan doa digital offline, dan perlindungan WNI 24/7.',
      ctaText: 'Jadwal & Manasik',
      ctaAction: () => onNavigateView('schedule'),
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1800&q=85',
      overlayGradient: 'from-stone-950/95 via-emerald-950/80 to-transparent',
    },
  ];

  // Auto-play interval slider (4.5 detik)
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full aspect-[3/1] min-h-[130px] sm:min-h-[175px] md:min-h-[210px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-slate-900 group select-none"
    >
      {/* Slides Container */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentSlide;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image (3:1 Aspect Fill) */}
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              unoptimized
              priority={idx === 0}
              className="object-cover object-center transform scale-100 group-hover:scale-102 transition-transform duration-1000"
            />

            {/* Dark & Brand Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient}`} />

            {/* Slide Content */}
            <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-7 md:px-10 max-w-xl sm:max-w-2xl space-y-1 sm:space-y-1.5 md:space-y-2.5">
              {/* Badge */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold border shadow-xs ${slide.badgeColor}`}
                >
                  {slide.badgeIcon}
                  <span>{slide.badgeText}</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] text-white/60 font-mono">
                  0{idx + 1}/0{slides.length}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xs sm:text-lg md:text-2xl font-black text-white leading-tight sm:leading-snug line-clamp-2 drop-shadow-xs">
                {slide.title}
              </h2>

              {/* Subtitle */}
              <p className="text-[9.5px] sm:text-xs md:text-sm text-emerald-100/90 line-clamp-1 sm:line-clamp-2 leading-relaxed drop-shadow-xs">
                {slide.subtitle}
              </p>

              {/* CTA Button */}
              <div className="pt-0.5 sm:pt-1">
                <button
                  type="button"
                  onClick={slide.ctaAction}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#00aa5b] hover:bg-[#008f4c] text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer group/btn"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows (Visible on Desktop / Hover) */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Slide Sebelumnya"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Slide Selanjutnya"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Pagination Dots (Bottom Right) */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 right-3.5 sm:right-6 z-30 flex items-center gap-1.5">
        {slides.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            onClick={() => setCurrentSlide(dotIdx)}
            aria-label={`Ke slide ${dotIdx + 1}`}
            className={`transition-all rounded-full cursor-pointer ${
              dotIdx === currentSlide
                ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[#00aa5b] shadow-xs'
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
