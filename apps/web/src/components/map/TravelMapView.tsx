'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MOCK_BIRO_LIST, BiroItem } from '@/data/mock-biro-directory';
import { MapPin, RotateCcw, ChevronRight, ExternalLink, ShieldCheck, Star, Users, Phone, Building } from 'lucide-react';

interface TravelMapViewProps {
  onNavigateBiro: () => void;
  onSelectBiro?: (biro: BiroItem) => void;
}

const CITY_OPTIONS = [
  { key: 'all', label: 'Semua Kota' },
  { key: 'Jakarta', label: 'Jakarta' },
  { key: 'Surabaya', label: 'Surabaya' },
  { key: 'Bandung', label: 'Bandung' },
  { key: 'Semarang', label: 'Semarang & Demak' },
  { key: 'Solo', label: 'Solo / Surakarta' },
  { key: 'Makassar', label: 'Makassar' },
  { key: 'Medan', label: 'Medan' },
];

export function TravelMapView({ onNavigateBiro, onSelectBiro }: TravelMapViewProps) {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedBiro, setSelectedBiro] = useState<BiroItem | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ id: string; marker: any; lat: number; lng: number }[]>([]);

  // Filtered Biros based on city selection
  const filteredBiros = selectedCity === 'all'
    ? MOCK_BIRO_LIST
    : MOCK_BIRO_LIST.filter(b => b.city.toLowerCase().includes(selectedCity.toLowerCase()));

  // Dynamically load Leaflet script & CSS if not already on window
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      // 1. Add Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 2. Add Leaflet JS if not already present
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      if (isMounted) {
        setMapLoaded(true);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize or re-center Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Clean up previous instance
    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.remove();
      } catch (err) {
        console.error('Error removing leaflet map:', err);
      }
      leafletMapRef.current = null;
      markersRef.current = [];
    }

    // Default center on Java / Indonesia archipelago
    const defaultLat = -2.5;
    const defaultLng = 117.5;
    const zoomLevel = 5;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: zoomLevel,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    leafletMapRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Setup Custom Marker Pins
    const newMarkers: { id: string; marker: any; lat: number; lng: number }[] = [];

    MOCK_BIRO_LIST.forEach((biro) => {
      const customIcon = L.divIcon({
        className: 'custom-map-pin-container',
        html: `<div class="map-pin-bubble" title="${biro.name}">🕌</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36],
      });

      const popupHtml = `
        <div class="map-popup-card">
          <h4 class="map-popup-title">${biro.name} <span style="color:#00aa5b;">✓</span></h4>
          <div class="map-popup-sub">${biro.skKemenag}</div>
          <span class="map-popup-badge">⭐ Rating ${biro.rating} • ${biro.jamaahTotal} Jamaah</span>
          <p class="map-popup-address">📍 ${biro.address}</p>
          <div class="map-popup-actions">
            <button id="btn-biro-${biro.id}" class="map-popup-btn map-popup-btn-primary">
              Lihat Toko
            </button>
            <a href="${biro.gmapsUrl}" target="_blank" rel="noopener noreferrer" class="map-popup-btn map-popup-btn-outline">
              Google Maps ↗
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([biro.lat, biro.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedBiro(biro);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-biro-${biro.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectBiro) {
              onSelectBiro(biro);
            } else {
              onNavigateBiro();
            }
          };
        }
      });

      newMarkers.push({ id: biro.id, marker, lat: biro.lat, lng: biro.lng });
    });

    markersRef.current = newMarkers;

    // Fit bounds to show all pins across Indonesia
    try {
      const group = new L.featureGroup(newMarkers.map((m) => m.marker));
      map.fitBounds(group.getBounds().pad(0.18));
    } catch (e) {
      console.warn('Could not fit bounds on leaflet map:', e);
    }

    // Force map size refresh after container renders
    const timer = setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [mapLoaded]);

  // Handle City Filter Change & Panning
  const handleSelectCity = (cityKey: string) => {
    setSelectedCity(cityKey);
    const L = (window as any).L;
    if (!leafletMapRef.current || !L) return;

    if (cityKey === 'all') {
      try {
        const group = new L.featureGroup(markersRef.current.map((m) => m.marker));
        leafletMapRef.current.fitBounds(group.getBounds().pad(0.18));
      } catch (e) {}
      setSelectedBiro(null);
    } else {
      const matched = markersRef.current.filter((m) => {
        const trv = MOCK_BIRO_LIST.find((t) => t.id === m.id);
        return trv && trv.city.toLowerCase().includes(cityKey.toLowerCase());
      });

      if (matched.length > 0) {
        try {
          const group = new L.featureGroup(matched.map((m) => m.marker));
          leafletMapRef.current.fitBounds(group.getBounds().pad(0.35));
          // Open the first matching popup
          setTimeout(() => {
            matched[0].marker.openPopup();
            const b = MOCK_BIRO_LIST.find((t) => t.id === matched[0].id);
            if (b) setSelectedBiro(b);
          }, 350);
        } catch (e) {}
      }
    }
  };

  // Reset Map View to all points
  const handleResetMap = () => {
    setSelectedCity('all');
    setSelectedBiro(null);
    const L = (window as any).L;
    if (leafletMapRef.current && L && markersRef.current.length > 0) {
      try {
        const group = new L.featureGroup(markersRef.current.map((m) => m.marker));
        leafletMapRef.current.fitBounds(group.getBounds().pad(0.18));
        leafletMapRef.current.closePopup();
      } catch (e) {}
    }
  };

  return (
    <div className="travel-map-page max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-24">
      {/* Embedded CSS for Leaflet Pins and Popups matching Umrohpedia */}
      <style jsx global>{`
        .custom-map-pin-container {
          background: transparent;
          border: none;
        }
        .map-pin-bubble {
          background: #00aa5b;
          color: #ffffff;
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0, 170, 91, 0.45);
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .map-pin-bubble:hover {
          transform: scale(1.18);
        }
        .map-popup-card {
          font-family: inherit;
          min-width: 210px;
          max-width: 250px;
          padding: 2px;
        }
        .map-popup-title {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2px;
          line-height: 1.25;
        }
        .map-popup-sub {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .map-popup-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          background: #dcfce7;
          color: #166534;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .map-popup-address {
          font-size: 10.5px;
          color: #475569;
          line-height: 1.35;
          margin-bottom: 10px;
        }
        .map-popup-actions {
          display: flex;
          gap: 6px;
        }
        .map-popup-btn {
          flex: 1;
          padding: 6px 8px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          transition: background-color 0.15s ease;
        }
        .map-popup-btn-primary {
          background: #00aa5b;
          color: #ffffff;
        }
        .map-popup-btn-primary:hover {
          background: #007a41;
        }
        .map-popup-btn-outline {
          background: #f1f5f9;
          color: #334155;
        }
        .map-popup-btn-outline:hover {
          background: #e2e8f0;
        }
      `}</style>

      {/* Header ala Umrohpedia */}
      <div className="travel-map-header mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-1 self-stretch rounded-full bg-[#00aa5b] min-h-[34px]" />
            <div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                Peta Lokasi Kantor Biro
              </h1>
              <p className="text-[11.5px] text-slate-500 font-medium">
                Sebaran titik kantor resmi biro PPIU di seluruh Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetMap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Pusatkan kembali seluruh titik lokasi di peta"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>↺ Seluruh Titik</span>
            </button>
            <button
              type="button"
              onClick={onNavigateBiro}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-600 hover:bg-slate-50 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Buka Direktori Biro"
            >
              <span>Daftar Biro</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>
      </div>

      {/* City Filter Tabs (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-1 px-1">
        {CITY_OPTIONS.map((city) => (
          <button
            key={city.key}
            type="button"
            onClick={() => handleSelectCity(city.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCity === city.key
                ? 'bg-[#00aa5b] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            {city.label}
          </button>
        ))}
      </div>

      {/* Pure Full Map View (Peta Interaktif) */}
      <div className="pure-map-card w-full rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden relative">
        <div
          id="travel-map-container"
          ref={mapContainerRef}
          className="w-full h-[460px] sm:h-[580px] bg-slate-50 z-10"
        >
          {!mapLoaded && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mb-3 animate-pulse">
                🗺️
              </div>
              <p className="font-bold text-slate-800 text-sm mb-1">
                Memuat Peta Interaktif Biro PPIU...
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Mengunduh data peta OpenStreetMap dan titik koordinat biro resmi Kemenag RI.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Biro Quick Info Box */}
      {selectedBiro && (
        <div className="mt-3 bg-white rounded-2xl border border-emerald-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0">
              🕌
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedBiro.name}
                </h3>
                <span className="text-[#00aa5b] text-xs font-bold" title="Terverifikasi Kemenag">✓</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {selectedBiro.skKemenag} &bull; {selectedBiro.city}
              </p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                📍 {selectedBiro.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <a
              href={selectedBiro.gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <span>Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => {
                if (onSelectBiro) {
                  onSelectBiro(selectedBiro);
                } else {
                  onNavigateBiro();
                }
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-[#00aa5b] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Lihat Profil Biro</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
