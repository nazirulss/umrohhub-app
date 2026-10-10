'use client';

import React, { useState } from 'react';
import { BiroPassportItem, DepartureQuotaItem } from '@/types/travel-dashboard';
import { Plane, Download, Printer, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface FlightManifestGeneratorProps {
  departures: DepartureQuotaItem[];
  passports: BiroPassportItem[];
}

export function FlightManifestGenerator({
  departures,
  passports,
}: FlightManifestGeneratorProps) {
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>(
    departures[0]?.id || ''
  );

  const activeDeparture = departures.find((d) => d.id === selectedDepartureId) || departures[0];

  // Penumpang yang berada di jadwal penerbangan ini
  const flightPassengers = passports.filter((p) => {
    if (!activeDeparture) return true;
    return p.departureDate === activeDeparture.departureDate;
  });

  const totalPax = flightPassengers.length;
  const verifiedPax = flightPassengers.filter((p) => p.status === 'TERVERIFIKASI').length;
  const maleCount = flightPassengers.filter((p) => p.gender === 'M').length;
  const femaleCount = flightPassengers.filter((p) => p.gender === 'F').length;

  const handleExportCSV = () => {
    const headers = ['NO', 'TITLE', 'FULL_NAME', 'PASSPORT_NO', 'GENDER', 'DOB', 'EXPIRY_DATE', 'NATIONALITY', 'STATUS'];
    const rows = flightPassengers.map((p, idx) => [
      idx + 1,
      p.gender === 'M' ? 'MR' : 'MRS',
      `"${p.fullName}"`,
      p.passportNumber,
      p.gender,
      p.birthDate,
      p.expiryDate,
      'IDN',
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FLIGHT_MANIFEST_${activeDeparture?.flightCode.replace(/\s+/g, '_')}_${activeDeparture?.departureDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-5">
      {/* Flight Selector & Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-600" />
            Penerbitan Manifes Penumpang Maskapai (Flight Passenger Manifest)
          </h3>
          <p className="text-xs text-slate-500">
            Dokumen resmi manifes PNR penerbangan umroh sesuai standar IATA & Kemenag RI
          </p>
        </div>

        {/* Departure Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Pilih Penerbangan:</label>
          <select
            value={selectedDepartureId}
            onChange={(e) => setSelectedDepartureId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-emerald-600 cursor-pointer"
          >
            {departures.map((d) => (
              <option key={d.id} value={d.id}>
                {d.flightCode} • {d.departureDate} ({d.departureCity.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flight Detail Strip & Summary */}
      {activeDeparture && (
        <div className="mx-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                FLIGHT {activeDeparture.flightCode}
              </span>
              <span className="text-xs font-extrabold text-slate-900">{activeDeparture.airline}</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Rute: <strong>{activeDeparture.departureCity}</strong> ➔ <strong>Jeddah / Madinah (JED/MED)</strong> • Tanggal:{' '}
              <strong>{activeDeparture.departureDate}</strong>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-normal">Total Penumpang</span>
              <span className="text-sm font-black text-slate-900">{totalPax} Pax</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-normal">Komposisi Gender</span>
              <span className="text-sm font-black text-slate-800">{maleCount} L / {femaleCount} P</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-normal">Status Manifes</span>
              <span className="text-sm font-black text-emerald-700">
                {verifiedPax}/{totalPax} Siap
              </span>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-white text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Manifes
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor CSV Maskapai
            </button>
          </div>
        </div>
      )}

      {/* Manifest Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-3 py-3 rounded-l-xl">No.</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-4 py-3">Nama Jamaah (Sesuai Paspor)</th>
              <th className="px-4 py-3">No. Paspor</th>
              <th className="px-3 py-3">Warga Negara</th>
              <th className="px-4 py-3">Tgl Lahir / Gender</th>
              <th className="px-4 py-3">Masa Berlaku</th>
              <th className="px-4 py-3 text-right rounded-r-xl">Kesiapan Terbang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flightPassengers.length > 0 ? (
              flightPassengers.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-3.5 font-bold text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-3.5 font-bold text-slate-700">
                    {p.gender === 'M' ? 'MR' : 'MRS'}
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">
                    {p.fullName}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                    {p.passportNumber}
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-slate-600">IDN</td>
                  <td className="px-4 py-3.5">
                    {p.birthDate} ({p.gender})
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-800 block">{p.expiryDate}</span>
                    {p.isCritical && (
                      <span className="text-[10px] font-bold text-red-600">
                        ⚠️ &lt; 7 Bulan Kemenag
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {p.status === 'TERVERIFIKASI' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SIAP TERBANG
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> MENUNGGU DOKUMEN
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Belum ada penumpang terdaftar pada jadwal penerbangan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
