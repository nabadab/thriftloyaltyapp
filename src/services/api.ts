const BASE_URL = 'https://thriftloyalty.com/api';
const API_KEY = 'THRIFTLOYALTY_APP_2026';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    'X-Client-Platform': 'thriftloyalty-app',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method ?? 'GET'} ${path}`, JSON.stringify(headers, null, 2));

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    console.log(`[API] ${response.status} ${path}:`, body);
    throw new Error(`API error ${response.status}: ${body}`);
  }

  return response.json();
}

export const ApiService = {
  requestOTP(phone: string) {
    return request<{ success: boolean }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyOTP(phone: string, code: string) {
    return request<{ token: string }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  },

  getProfile(token: string) {
    return request<{
      id: string;
      phone: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      stores: Array<{
        id: string;
        name: string;
        address: string;
        phone?: string;
        logoUrl?: string;
        customerId: string;
      }>;
      activeStoreId: string | null;
    }>('/me', {}, token);
  },

  getBalances(token: string, storeId: string) {
    return request<{
      welcomeMessage: string | null;
      pointTypes: Array<{
        name: string;
        balance: number;
        displayBalance: string;
        rewards: Array<{
          id: string;
          name: string;
          cost: string;
          redeemable: boolean;
          status: string | null;
        }>;
      }>;
    }>(`/stores/${storeId}/balances`, {}, token);
  },

  getTransactions(token: string, storeId: string, offset = 0, limit = 20) {
    return request<{
      transactions: Array<{
        id: string;
        date: string;
        description: string;
        type: string;
        lineItems: Array<{
          name: string;
          quantity: number;
          price: number;
          displayPrice: string;
        }>;
        subtotal: number | null;
        displaySubtotal: string | null;
        salesTax: number | null;
        displaySalesTax: string | null;
        grandTotal: number | null;
        displayGrandTotal: string | null;
        tenders: Array<{
          type: string;
          amount: number;
          displayAmount: string;
        }>;
        pointChanges: Array<{
          pointType: string;
          change: number;
          displayChange: string;
          reason: string | null;
        }>;
      }>;
      total: number;
      limit: number;
      offset: number;
    }>(`/stores/${storeId}/transactions?limit=${limit}&offset=${offset}`, {}, token);
  },

  getOffers(token: string, storeId: string) {
    return request<{
      offers: Array<{
        id: string;
        title: string;
        description: string;
        expiresAt?: string;
        imageUrl?: string;
      }>;
    }>(`/stores/${storeId}/offers`, {}, token);
  },

  updateProfile(
    token: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ) {
    return request<{ success: boolean }>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  setActiveStore(token: string, storeId: string) {
    return request<{ success: boolean }>('/me/active-store', {
      method: 'PUT',
      body: JSON.stringify({ storeId }),
    }, token);
  },

  searchStores(token: string, query: string) {
    return request<{
      stores: Array<{
        id: string;
        name: string;
        address: string;
        phone?: string;
        logoUrl?: string;
        isMember: boolean;
      }>;
    }>(`/stores/search?q=${encodeURIComponent(query)}`, {}, token);
  },

  joinStore(token: string, storeId: string) {
    return request<{ success: boolean }>(`/stores/${storeId}/join`, {
      method: 'POST',
    }, token);
  },

  leaveStore(token: string, storeId: string) {
    return request<{ success: boolean }>(`/stores/${storeId}/leave`, {
      method: 'POST',
    }, token);
  },
};
