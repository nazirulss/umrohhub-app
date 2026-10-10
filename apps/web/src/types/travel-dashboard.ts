import { DocumentStatus } from '@/types/document';

export interface TravelStats {
  totalJamaah: number;
  activePackages: number;
  pendingPassportReview: number;
  readyToFlyCount: number;
  totalSeatsTotal: number;
  totalSeatsBooked: number;
}

export type DepartureStatus = 'OPEN' | 'ALMOST_FULL' | 'FULL' | 'CLOSED';

export interface DepartureQuotaItem {
  id: string;
  packageTitle: string;
  departureDate: string;
  departureCity: string;
  airline: string;
  flightCode: string;
  quotaTotal: number;
  quotaTaken: number;
  pricePerPax: number;
  status: DepartureStatus;
}

export interface BiroPassportItem {
  id: string;
  bookingCode: string;
  packageTitle: string;
  departureDate: string;
  paxIndex: number;
  fullName: string;
  passportNumber: string;
  birthDate: string;
  gender: 'M' | 'F';
  issuingOffice: string;
  expiryDate: string;
  passportScanUrl: string;
  status: DocumentStatus;
  rejectionReason?: string;
  diffMonths: number;
  diffDays: number;
  isCritical: boolean;
  uploadedAt: string;
}
