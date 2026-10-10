export type PackageCategory = 'Reguler' | 'VIP' | 'Ramadhan' | 'Hemat' | 'Plus Wisata';

export type SortOption = 'recommended' | 'departure_asc' | 'price_asc' | 'price_desc' | 'rating_desc';

export interface DepartureItem {
  id: string;
  departureCity: string;
  departureDate: string;
  airline: string;
  quotaTotal: number;
  quotaTaken: number;
}

export interface RoomVariant {
  id: string;
  name: string;
  paxPerRoom: number;
  priceDelta: number; // Tambahan biaya (misal Triple +2jt, Double +4jt)
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location: string;
}

export interface PackageItem {
  id: string;
  title: string;
  slug: string;
  travelId: string;
  travelName: string;
  skKemenag: string;
  category: PackageCategory;
  price: number;
  durationDays: number;
  departureCity: string;
  departureDate: string;
  airline: string;
  flightType: 'Direct' | 'Transit';
  hotelMakkah: string;
  hotelMakkahDistance?: string;
  hotelMadinah: string;
  hotelMadinahDistance?: string;
  rating: number;
  soldCount: number;
  quotaTotal: number;
  quotaTaken: number;
  commissionAffiliate: number;
  image: string;
  galleryImages: string[];
  departures: DepartureItem[];
  roomVariants: RoomVariant[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
}

export interface MarketplaceFilterState {
  category: string;
  departureCity: string;
  minPrice: number | null;
  maxPrice: number | null;
  airline: string;
  cashbackOnly: boolean;
  sortBy: SortOption;
  searchQuery: string;
  activeTab: 'packages' | 'travels';
}
