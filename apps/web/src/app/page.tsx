'use client';

import React, { useState } from 'react';
import { PassportDocument, BookingPaxInfo } from '@/types/document';
import { PaxSelectorTabs } from '@/components/documents/PaxSelectorTabs';
import { PassportUploadForm } from '@/components/documents/PassportUploadForm';
import { PassportReviewCard } from '@/components/documents/PassportReviewCard';
import {
  ShieldCheck,
  Calendar,
  Plane,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Info,
  ChevronRight,
  Download,
} from 'lucide-react';

export default function PassportFlowDemoPage() {
  const [departureDate, setDepartureDate] = useState('2026-10-15');
  const [activePaxIndex, setActivePaxIndex] = useState(1);
  const [activeViewMode, setActiveViewMode] = useState<'upload' | 'manifest'>('upload');

  // Dummy Initial Booking dengan 3 Jamaah (Keluarga)
  const [bookingInfo] = useState<BookingPaxInfo>({
    bookingId: 'BKG-7881920',
    bookingCode: 'UH-2026-RAMADHAN',
    packageName: 'Paket Umroh Bintang 5 Awal Ramadhan 1448H',
    departureDate: '2026-10-15',
    travelName: 'PT. Al-Falah Berkah Mandiri (PPIU No. 412/2021)',
    totalPax: 3,
    paxList: [
      { paxIndex: 1, label: 'Jamaah 1 (Ayah)' },
      { paxIndex: 2, label: 'Jamaah 2 (Ibu)' },
      { paxIndex: 3, label: 'Jamaah 3 (Anak)' },
    ],
  });

  // Database dokumen paspor (State multi-pax)
  const [documents, setDocuments] = useState<Record<number, Partial<PassportDocument>>>({
    1: {
      id: 'DOC-001',
      bookingId: 'UH-2026-RAMADHAN',
      paxIndex: 1,
      fullName: 'MUHAMMAD AHMAD FAUZI',
      passportNumber: 'C8192031',
      birthDate: '1984-06-12',
      gender: 'M',
      issuingOffice: 'Kanim Jakarta Selatan',
      issuingDate: '2022-01-10',
      expiryDate: '2032-01-10', // Sangat aman (10 tahun)
      passportScanUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      status: 'TERVERIFIKASI',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
    },
    2: {
      id: 'DOC-002',
      bookingId: 'UH-2026-RAMADHAN',
      paxIndex: 2,
      fullName: 'SITI NUR FATIMAH',
      passportNumber: 'B9920145',
      birthDate: '1987-11-25',
      gender: 'F',
      issuingOffice: 'Kanim Jakarta Timur',
      issuingDate: '2021-03-01',
      expiryDate: '2026-12-01', // Hanya tersisa 1.5 bulan dari keberangkatan (Peringatan Kemenag!)
      passportScanUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      status: 'PERLU_REVISI',
      rejectionReason: 'Masa berlaku paspor tersisa kurang dari 7 bulan pada tanggal terbang (15 Okt 2026). Mohon segera perpanjang di Kantor Imigrasi.',
      createdAt: '2026-10-02T09:00:00Z',
      updatedAt: '2026-10-03T11:00:00Z',
    },
    3: {
      id: 'DOC-003',
      bookingId: 'UH-2026-RAMADHAN',
      paxIndex: 3,
      fullName: '',
      passportNumber: '',
      birthDate: '',
      gender: 'M',
      issuingOffice: '',
      issuingDate: '',
      expiryDate: '',
      passportScanUrl: '',
      status: 'BELUM_LENGKAP',
      createdAt: '2026-10-03T14:00:00Z',
      updatedAt: '2026-10-03T14:00:00Z',
    },
  });

  const handleSaveDoc = (updatedDoc: Partial<PassportDocument>) => {
    setDocuments((prev) => ({
      ...prev,
      [activePaxIndex]: updatedDoc,
    }));
  };

  // Metrik Kelengkapan Dokumen
  const totalPax = bookingInfo.totalPax;
  const docsList = Object.values(documents);
  const verifiedCount = docsList.filter((d) => d.status === 'TERVERIFIKASI').length;
  const pendingCount = docsList.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;
  const revisionCount = docsList.filter((d) => d.status === 'PERLU_REVISI').length;
  const incompleteCount = totalPax - (verifiedCount + pendingCount + revisionCount);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#212121] pb-16">
      {/* Top Navbar Tokopedia-Inspired */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
              UH
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  UmrohHub
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ENTERPRISE v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Marketplace & Portal Umroh Terverifikasi Kemenag RI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Penyelarasan Regulasi</span> Kemenag 7 Bulan
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Beranda</span>
              <ChevronRight className="w-3 h-3" />
              <span>Daftar Transaksi</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-emerald-700">Dokumen Paspor Jamaah</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Paspor & Manifes Penerbangan
            </h1>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveViewMode('upload')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeViewMode === 'upload'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Form Upload Jamaah
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('manifest')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeViewMode === 'manifest'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel Manifes Maskapai ({totalPax} Pax)
            </button>
          </div>
        </div>

        {/* Booking Card & Flight Timeline Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Booking Dikonfirmasi
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {bookingInfo.bookingCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {bookingInfo.packageName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{bookingInfo.travelName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{totalPax} Jamaah Terdaftar</span>
                </div>
              </div>
            </div>

            {/* Flight Departure Simulator Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Plane className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulasi Jadwal Terbang:</span>
              </div>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-emerald-600"
              />
              <p className="text-[10px] text-slate-500">
                Ubah tanggal untuk menguji kalkulator 7 bulan Kemenag.
              </p>
            </div>
          </div>

          {/* Progress Bar Kelengkapan Dokumen */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Progres Kelengkapan Paspor: {verifiedCount} dari {totalPax} Terverifikasi</span>
              <span className="text-emerald-700 font-bold">
                {Math.round((verifiedCount / totalPax) * 100)}% Siap Terbang
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(verifiedCount / totalPax) * 100}%` }}
                className="bg-emerald-600 transition-all duration-300"
              />
              <div
                style={{ width: `${(pendingCount / totalPax) * 100}%` }}
                className="bg-sky-500 transition-all duration-300"
              />
              <div
                style={{ width: `${(revisionCount / totalPax) * 100}%` }}
                className="bg-amber-500 transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Terverifikasi: {verifiedCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Review Biro: {pendingCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Perlu Revisi: {revisionCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Belum Diisi: {incompleteCount}
              </span>
            </div>
          </div>
        </div>

        {activeViewMode === 'upload' ? (
          /* View 1: Form & Reviewer */
          <div className="space-y-6">
            {/* Multi-Pax Selector Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <PaxSelectorTabs
                totalPax={totalPax}
                activePaxIndex={activePaxIndex}
                documents={documents}
                onSelectPax={setActivePaxIndex}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: Form Upload Utama */}
              <div className="lg:col-span-8">
                <PassportUploadForm
                  paxIndex={activePaxIndex}
                  totalPax={totalPax}
                  bookingCode={bookingInfo.bookingCode}
                  departureDate={departureDate}
                  initialData={documents[activePaxIndex]}
                  onSave={handleSaveDoc}
                />
              </div>

              {/* Kolom Kanan: Summary Preview & Panduan Kemenag */}
              <div className="lg:col-span-4 space-y-5">
                {/* Preview Kartu Dokumen Saat Ini */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                    Preview Kartu Jamaah {activePaxIndex}
                  </h3>
                  {documents[activePaxIndex]?.fullName ? (
                    <PassportReviewCard
                      document={documents[activePaxIndex] as PassportDocument}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 space-y-2">
                      <Users className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-medium">
                        Belum ada data paspor untuk Jamaah {activePaxIndex}. Silakan isi form di samping.
                      </p>
                    </div>
                  )}
                </div>

                {/* Panduan Resmi Kemenag Card */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Ketentuan Paspor Umroh Resmi</span>
                  </div>
                  <ul className="space-y-2 text-emerald-900/90 leading-relaxed list-disc list-inside">
                    <li>
                      <strong>Aturan 7 Bulan:</strong> Paspor wajib masih berlaku minimal 7 bulan terhitung sejak tanggal keberangkatan.
                    </li>
                    <li>
                      <strong>Nama 3 Suku Kata:</strong> Paspor dianjurkan memuat 3 kata (cth: <em>Ahmad Fauzi Ridwan</em>) untuk kelancaran penerbitan visa Saudi.
                    </li>
                    <li>
                      <strong>Kualitas Foto:</strong> Seluruh teks halaman identitas harus terbaca tajam tanpa pantulan cahaya flash.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Manifest Maskapai Table View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Manifes Paspor Penerbangan Maskapai
                </h3>
                <p className="text-xs text-slate-500">
                  Format standar PNR maskapai & Siskopatuh Kemenag RI
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert('Manifes siap diekspor ke PDF / Excel.')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                Ekspor Manifes (CSV/PDF)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Pax</th>
                    <th className="px-4 py-3">Nama Jamaah (Sesuai Paspor)</th>
                    <th className="px-4 py-3">No. Paspor</th>
                    <th className="px-4 py-3">Gender / Lahir</th>
                    <th className="px-4 py-3">Masa Berlaku</th>
                    <th className="px-4 py-3">Status Verifikasi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingInfo.paxList.map((pax) => {
                    const doc = documents[pax.paxIndex];
                    return (
                      <tr key={pax.paxIndex} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          #{pax.paxIndex}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {doc?.fullName || <span className="text-slate-400 font-normal">Belum diisi</span>}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                          {doc?.passportNumber || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          {doc?.gender ? (doc.gender === 'M' ? 'L' : 'P') : '-'} • {doc?.birthDate || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          {doc?.expiryDate ? (
                            <span className="font-semibold text-slate-800">
                              {doc.expiryDate}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {doc?.status === 'TERVERIFIKASI' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                            </span>
                          )}
                          {doc?.status === 'PERLU_REVISI' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Perlu Revisi
                            </span>
                          )}
                          {doc?.status === 'MENUNGGU_VERIFIKASI' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                              Review Biro
                            </span>
                          )}
                          {(!doc || doc.status === 'BELUM_LENGKAP') && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              Belum Lengkap
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePaxIndex(pax.paxIndex);
                              setActiveViewMode('upload');
                            }}
                            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
