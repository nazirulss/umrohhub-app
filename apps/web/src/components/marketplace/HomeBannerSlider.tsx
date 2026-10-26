'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: string;
  title: string;
  imageUrl: string;
  ctaAction: () => void;
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
      title: 'Umrohpedia - Ibadah Tenang, Dana 100% Aman (Jaminan 5 Pasti Kemenag RI)',
      imageUrl: '/banners/banner-escrow.jpg',
      ctaAction: () => onNavigateView('biro'),
    },
    {
      id: 'banner-ramadhan',
      title: 'Umrohpedia - Raih Berkah Lailatul Qadar (Spesial Awal Ramadhan 1448H)',
      imageUrl: '/banners/banner-ramadhan.jpg',
      ctaAction: () => {
        if (onFilterCategory) onFilterCategory('ramadhan');
      },
    },
    {
      id: 'banner-manasik',
      title: 'Umrohpedia - Manasik Eksklusif & Amanah (Bimbingan Sesuai Sunnah)',
      imageUrl: '/banners/banner-manasik.jpg',
      ctaAction: () => onNavigateView('schedule'),
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

  const activeSlide = slides[currentSlide];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={activeSlide.ctaAction}
      className="relative w-full aspect-[3/1] min-h-[120px] sm:min-h-[160px] md:min-h-[200px] lg:min-h-[220px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-slate-950 group select-none cursor-pointer transition-shadow hover:shadow-md"
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
            {/* Banner Graphic Image (3:1 Ratio) */}
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              unoptimized
              priority={idx === 0}
              className="object-cover object-center transform scale-100 group-hover:scale-[1.01] transition-transform duration-700"
            />
          </div>
        );
      })}

      {/* Navigation Arrows (Visible on Desktop / Hover) */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Slide Sebelumnya"
        className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Slide Selanjutnya"
        className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Pagination Dots (Bottom Right) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-2.5 sm:bottom-4 right-3.5 sm:right-6 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10"
      >
        {slides.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            onClick={() => setCurrentSlide(dotIdx)}
            aria-label={`Ke slide ${dotIdx + 1}`}
            className={`transition-all rounded-full cursor-pointer ${
              dotIdx === currentSlide
                ? 'w-5 sm:w-6 h-1.5 bg-[#00aa5b] shadow-xs'
                : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
