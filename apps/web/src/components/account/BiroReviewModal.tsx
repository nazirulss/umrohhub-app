'use client';

import React, { useState } from 'react';
import { X, Star, Sparkles, ShieldCheck, Heart, ThumbsUp, Send } from 'lucide-react';

interface BiroReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  travelName: string;
  packageName: string;
  onSubmitReview: (reviewData: {
    bookingCode: string;
    ratings: {
      muthawif: number;
      hotel: number;
      catering: number;
      bus: number;
    };
    overall: number;
    comment: string;
    recommended: boolean;
  }) => void;
}

export function BiroReviewModal({
  isOpen,
  onClose,
  bookingCode,
  travelName,
  packageName,
  onSubmitReview,
}: BiroReviewModalProps) {
  const [muthawifRating, setMuthawifRating] = useState(5);
  const [hotelRating, setHotelRating] = useState(5);
  const [cateringRating, setCateringRating] = useState(5);
  const [busRating, setBusRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recommended, setRecommended] = useState(true);

  if (!isOpen) return null;

  const averageRating = Math.round(
    ((muthawifRating + hotelRating + cateringRating + busRating) / 4) * 10
  ) / 10;

  const renderStarPicker = (
    value: number,
    onChange: (val: number) => void,
    label: string,
    icon: string
  ) => {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-bold text-slate-800">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-transform cursor-pointer"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview({
      bookingCode,
      ratings: {
        muthawif: muthawifRating,
        hotel: hotelRating,
        catering: cateringRating,
        bus: busRating,
      },
      overall: averageRating,
      comment,
      recommended,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#005B31] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm shadow-inner">
              ⭐
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Ulasan Layanan Ibadah</h3>
              <p className="text-[10px] text-emerald-200">Bantu jamaah lain memilih biro terbaik</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-slate-800 text-xs">
          {/* Info Singkat Biro */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-0.5">
            <span className="text-[10px] text-emerald-800 font-semibold block">
              Biro Penyelenggara:
            </span>
            <h4 className="text-xs font-bold text-slate-900">{travelName}</h4>
            <p className="text-[10.5px] text-slate-600">{packageName}</p>
          </div>

          {/* Rating Dimensions */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 block text-xs">
              Beri Penilaian Pengalaman Anda:
            </label>
            {renderStarPicker(
              muthawifRating,
              setMuthawifRating,
              'Bimbingan Ibadah & Muthawif',
              '🕋'
            )}
            {renderStarPicker(
              hotelRating,
              setHotelRating,
              'Kebersihan & Fasilitas Hotel',
              '🏨'
            )}
            {renderStarPicker(
              cateringRating,
              setCateringRating,
              'Katering Menu Nusantara',
              '🍱'
            )}
            {renderStarPicker(
              busRating,
              setBusRating,
              'Kenyamanan Bus Antar Kota',
              '🚌'
            )}
          </div>

          {/* Ulasan Bebas Textarea */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block text-xs">
              Tulis Ulasan atau Pengalaman Spiritual Anda:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Contoh: Alhamdulillah pelayanan travel sangat amanah, ustadz pembimbing sangat sabar, dan lokasi hotel sangat dekat dengan Masjidil Haram..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 bg-slate-50 resize-none"
            />
          </div>

          {/* Checkbox Rekomendasi */}
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
            <input
              type="checkbox"
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Saya merekomendasikan biro ini untuk keluarga &amp; jamaah lain
            </span>
          </label>
        </form>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dapatkan <strong>+500 Poin Berkah</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[#03AC0E] hover:bg-[#029b0c] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Ulasan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
