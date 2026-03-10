const BASE_URL = 'https://api.thriftloyalty.com';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
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
      }>;
      activeStoreId: string | null;
    }>('/me', {}, token);
  },

  getBalances(token: string, storeId: string) {
    return request<{
      balances: Array<{
        label: string;
        value: number;
        type: string;
        displayValue: string;
      }>;
    }>(`/stores/${storeId}/balances`, {}, token);
  },

  getTransactions(token: string, storeId: string) {
    return request<{
      transactions: Array<{
        id: string;
        date: string;
        description: string;
        amount?: number;
        pointsEarned?: number;
        type: string;
      }>;
    }>(`/stores/${storeId}/transactions`, {}, token);
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
};
