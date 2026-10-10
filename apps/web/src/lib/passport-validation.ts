import { PassportValidationResult } from '@/types/document';

/**
 * Validasi masa berlaku paspor sesuai regulasi Kemenag RI & Muassasah Arab Saudi:
 * Paspor wajib memiliki masa berlaku aktif MINIMAL 7 BULAN terhitung dari tanggal keberangkatan penerbangan.
 */
export function validatePassportKemenag(
  expiryDateStr?: string,
  departureDateStr?: string
): PassportValidationResult {
  if (!expiryDateStr || expiryDateStr.trim() === '') {
    return {
      isValid: false,
      diffMonths: 0,
      diffDays: 0,
      isCritical: false,
      status: 'EMPTY',
      message: 'Tanggal habis berlaku (expiry date) paspor belum ditentukan.',
      departureDate: departureDateStr || '',
    };
  }

  const expDate = new Date(expiryDateStr);
  if (isNaN(expDate.getTime())) {
    return {
      isValid: false,
      diffMonths: 0,
      diffDays: 0,
      isCritical: true,
      status: 'INVALID',
      message: 'Format tanggal habis berlaku paspor tidak valid.',
      departureDate: departureDateStr || '',
    };
  }

  let depDate: Date;
  if (departureDateStr && !isNaN(new Date(departureDateStr).getTime())) {
    depDate = new Date(departureDateStr);
  } else {
    // Default reference date jika tanggal belum ditentukan
    depDate = new Date('2026-10-15');
  }

  const diffTime = expDate.getTime() - depDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // 1 bulan rata-rata 30.4375 hari
  const diffMonths = Math.round((diffDays / 30.4375) * 10) / 10;

  if (diffDays < 0) {
    return {
      isValid: false,
      diffMonths,
      diffDays,
      isCritical: true,
      status: 'EXPIRED',
      message: 'Paspor telah kadaluwarsa! Paspor ini tidak dapat digunakan untuk pengurusan visa umroh.',
      departureDate: depDate.toISOString().split('T')[0],
    };
  }

  if (diffMonths < 7) {
    return {
      isValid: false,
      diffMonths,
      diffDays,
      isCritical: true,
      status: 'LESS_THAN_7_MONTHS',
      message: `Peringatan Regulasi Kemenag: Masa berlaku tersisa ${diffMonths} bulan (${diffDays} hari) dari jadwal terbang. Kemenag RI & Muassasah mewajibkan minimal 7 bulan aktif! Segera lakukan penggantian paspor di Kantor Imigrasi sebelum pendaftaran visa.`,
      departureDate: depDate.toISOString().split('T')[0],
    };
  }

  return {
    isValid: true,
    diffMonths,
    diffDays,
    isCritical: false,
    status: 'VALID',
    message: `Memenuhi Syarat: Masa berlaku paspor masih aman (${diffMonths} bulan / ${diffDays} hari dari tanggal terbang, melebihi batas regulasi 7 bulan Kemenag).`,
    departureDate: depDate.toISOString().split('T')[0],
  };
}

/**
 * Format string tanggal ISO ke Bahasa Indonesia
 */
export function formatTanggalIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
