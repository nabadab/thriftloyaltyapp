import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList, Store } from '../types';
import { useTheme, Theme } from '../theme';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { Pill } from '../components/ui';

// Search results aren't joined yet, so they have no customerId.
type SearchResultStore = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  isMember: boolean;
};

type StoreSelectorScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoreSelector'>;
};

const StoreAvatar: React.FC<{
  store: { name: string; logoUrl?: string };
  theme: Theme;
}> = ({ store, theme }) => {
  const s = styles(theme);
  if (store.logoUrl) {
    return (
      <View style={s.avatarChip}>
        <Image
          source={{ uri: store.logoUrl, cache: 'force-cache' }}
          style={s.avatarLogo}
          resizeMode="contain"
        />
      </View>
    );
  }
  return (
    <View style={[s.avatarChip, s.avatarFallback]}>
      <Text style={s.avatarInitial}>
        {store.name.trim().charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
};

export const StoreSelectorScreen: React.FC<StoreSelectorScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  const [myStores, setMyStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultStore[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const isSearching = searchQuery.trim().length > 0;

  const loadMyStores = useCallback(async () => {
    try {
      const token = await StorageService.getAuthToken();
      console.log('[StoreSelector] Auth token from storage:', token ?? 'NULL');
      if (!token) return;
      const profile = await ApiService.getProfile(token);
      setMyStores(profile.stores);
      setActiveStoreId(profile.activeStoreId);
    } catch (err) {
      console.log('[StoreSelector] Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyStores();
  }, [loadMyStores]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const token = await StorageService.getAuthToken();
        if (!token) return;
        const result = await ApiService.searchStores(token, trimmed);
        setSearchResults(result.stores);
      } catch (err) {
        console.log('[StoreSelector] Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectStore = async (store: Store) => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) return;
      await ApiService.setActiveStore(token, store.id);
      await StorageService.setActiveStoreId(store.id);
      navigation.goBack();
    } catch (err) {
      console.log('[StoreSelector] Failed to set active store:', err);
      Toast.show({ type: 'error', text1: 'Failed to switch store' });
    }
  };

  const handleJoinStore = async (store: SearchResultStore) => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) return;
      await ApiService.joinStore(token, store.id);
      Toast.show({ type: 'success', text1: `Joined ${store.name}!` });
      setSearchQuery('');
      await loadMyStores();
    } catch (err) {
      console.log('[StoreSelector] Failed to join store:', err);
      Toast.show({ type: 'error', text1: 'Failed to join store' });
    }
  };

  const handleLeaveStore = (store: Store) => {
    Alert.alert(
      'Leave Store',
      `Remove ${store.name} from your stores? You can always add it back later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await StorageService.getAuthToken();
              if (!token) return;
              await ApiService.leaveStore(token, store.id);
              Toast.show({ type: 'success', text1: `Left ${store.name}` });
              await loadMyStores();
            } catch (err) {
              console.log('[StoreSelector] Failed to leave store:', err);
              Toast.show({ type: 'error', text1: 'Failed to leave store' });
            }
          },
        },
      ],
    );
  };

  const renderMyStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={[s.storeItem, item.id === activeStoreId && s.storeItemActive]}
      onPress={() => handleSelectStore(item)}
      onLongPress={() => handleLeaveStore(item)}
      activeOpacity={0.7}
    >
      <StoreAvatar store={item} theme={theme} />
      <View style={s.storeInfo}>
        <Text style={s.storeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.storeAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      {item.id === activeStoreId && <Pill label="Active" tone="brand" />}
    </TouchableOpacity>
  );

  const renderSearchResultItem = ({ item }: { item: SearchResultStore }) => (
    <View style={s.storeItem}>
      <StoreAvatar store={item} theme={theme} />
      <View style={s.storeInfo}>
        <Text style={s.storeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.storeAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      {item.isMember ? (
        <Pill label="Joined" tone="muted" />
      ) : (
        <TouchableOpacity
          style={s.joinButton}
          onPress={() => handleJoinStore(item)}
          activeOpacity={0.8}
        >
          <Text style={s.joinButtonText}>Join</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Your Stores</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.closeText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchContainer}>
        <View style={s.searchInputWrapper}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search for a store to add..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {isSearching ? (
        <>
          {searching && (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 16 }} />
          )}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResultItem}
            contentContainerStyle={s.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !searching ? (
                <Text style={s.emptyText}>
                  {searchQuery.trim().length < 2
                    ? 'Type at least 2 characters to search'
                    : 'No stores found'}
                </Text>
              ) : null
            }
          />
        </>
      ) : (
        <FlatList
          data={myStores}
          keyExtractor={(item) => item.id}
          renderItem={renderMyStoreItem}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyEmoji}>🏬</Text>
              <Text style={s.emptyTitle}>No stores yet</Text>
              <Text style={s.emptySubtitle}>
                Search above to find and join a store
              </Text>
            </View>
          }
          ListFooterComponent={
            myStores.length > 0 ? (
              <Text style={s.footerHint}>Long press a store to remove it</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
    },
    closeText: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.primary,
    },
    searchContainer: {
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
    },
    searchIcon: {
      fontSize: 15,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.text,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    storeItem: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      ...theme.shadow.card,
    },
    storeItemActive: {
      borderColor: theme.primary,
      borderWidth: 2,
    },
    avatarChip: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      overflow: 'hidden',
    },
    avatarLogo: {
      width: 44,
      height: 44,
    },
    avatarFallback: {
      backgroundColor: theme.primary + '1A',
      borderColor: theme.primary + '33',
    },
    avatarInitial: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.primary,
    },
    storeInfo: {
      flex: 1,
    },
    storeName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 3,
    },
    storeAddress: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    joinButton: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingHorizontal: 18,
      paddingVertical: 9,
      marginLeft: 12,
    },
    joinButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 48,
    },
    emptyEmoji: {
      fontSize: 44,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 15,
      color: theme.textSecondary,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textTertiary,
      textAlign: 'center',
      marginTop: 24,
    },
    footerHint: {
      fontSize: 13,
      color: theme.textTertiary,
      textAlign: 'center',
      marginTop: 20,
    },
  });
