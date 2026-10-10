export type UserRole = 'CUSTOMER' | 'TRAVEL' | 'SUPER_ADMIN' | 'ADMIN' | 'AFFILIATE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  // Travel Specific Metadata (jika role TRAVEL)
  travelId?: string;
  travelName?: string;
  travelSlug?: string;
  skKemenag?: string;
  verificationStatus?: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
}

export interface LoginPayload {
  email: string;
  password?: string;
  roleHint?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'CUSTOMER' | 'TRAVEL';
  // Form tambahan khusus Biro Travel
  travelName?: string;
  skKemenag?: string;
  city?: string;
  province?: string;
}

export interface AuthSessionResponse {
  success: boolean;
  user: AuthUser | null;
  message?: string;
}
