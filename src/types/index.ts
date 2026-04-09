export type RootStackParamList = {
  Login: undefined;
  VerifyOTP: { phone: string };
  Home: undefined;
  StoreSelector: undefined;
  Profile: undefined;
  TransactionHistory: undefined;
};

export type Store = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  customerId: string;
};

export type Reward = {
  id: string;
  name: string;
  cost: string;
  redeemable: boolean;
  status: string | null;
};

export type PointType = {
  name: string;
  balance: number;
  displayBalance: string;
  rewards: Reward[];
};

export type LoyaltyData = {
  welcomeMessage: string | null;
  pointTypes: PointType[];
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

export type LineItem = {
  name: string;
  quantity: number;
  price: number;
  displayPrice: string;
};

export type TenderLine = {
  type: string;
  amount: number;
  displayAmount: string;
};

export type PointChange = {
  pointType: string;
  change: number;
  displayChange: string;
  reason: string | null;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  type: 'purchase' | 'reward' | 'adjustment';
  lineItems: LineItem[];
  subtotal: number | null;
  displaySubtotal: string | null;
  salesTax: number | null;
  displaySalesTax: string | null;
  grandTotal: number | null;
  displayGrandTotal: string | null;
  tenders: TenderLine[];
  pointChanges: PointChange[];
};

