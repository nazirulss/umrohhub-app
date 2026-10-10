export type DocumentStatus = 
  | 'BELUM_LENGKAP'
  | 'MENUNGGU_VERIFIKASI'
  | 'TERVERIFIKASI'
  | 'PERLU_REVISI';

export type PassportValidityStatus = 
  | 'EMPTY'
  | 'INVALID'
  | 'EXPIRED'
  | 'LESS_THAN_7_MONTHS'
  | 'VALID';

export interface PassportDocument {
  id: string;
  bookingId: string;
  paxIndex: number;
  fullName: string;
  passportNumber: string;
  birthDate: string;
  gender: 'M' | 'F' | '';
  issuingOffice: string;
  issuingDate: string;
  expiryDate: string;
  passportScanUrl?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PassportValidationResult {
  isValid: boolean;
  diffMonths: number;
  diffDays: number;
  isCritical: boolean;
  status: PassportValidityStatus;
  message: string;
  departureDate: string;
}

export interface BookingPaxInfo {
  bookingId: string;
  bookingCode: string;
  packageName: string;
  departureDate: string;
  travelName: string;
  totalPax: number;
  paxList: Array<{
    paxIndex: number;
    label: string;
    document?: PassportDocument;
  }>;
}
