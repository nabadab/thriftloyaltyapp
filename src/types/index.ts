export type RootStackParamList = {
  Login: undefined;
  VerifyOTP: { phone: string };
  Home: undefined;
  StoreSelector: undefined;
  Profile: undefined;
  TransactionHistory: undefined;
  Offers: undefined;
  LoyaltyCard: undefined;
};

export type Store = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  logoUrl?: string;
};

export type LoyaltyBalance = {
  storeId: string;
  label: string;
  value: number;
  type: 'dollar' | 'points' | 'visits' | 'custom';
  displayValue: string;
};

export type User = {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  stores: Store[];
  activeStoreId: string | null;
};

export type Transaction = {
  id: string;
  storeId: string;
  date: string;
  description: string;
  amount?: number;
  pointsEarned?: number;
  type: 'purchase' | 'reward' | 'adjustment';
};

export type Offer = {
  id: string;
  storeId: string;
  title: string;
  description: string;
  expiresAt?: string;
  imageUrl?: string;
};
