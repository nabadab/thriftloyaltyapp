import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ACTIVE_STORE_ID: 'active_store_id',
} as const;

export const StorageService = {
  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },

  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },

  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  async getActiveStoreId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.ACTIVE_STORE_ID);
  },

  async setActiveStoreId(storeId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACTIVE_STORE_ID, storeId);
  },

  async getUserData<T>(): Promise<T | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async setUserData<T>(data: T): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
