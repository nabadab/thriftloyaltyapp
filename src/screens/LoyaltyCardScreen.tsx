import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Store } from '../types';
import { useTheme, Theme } from '../theme';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

type LoyaltyCardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LoyaltyCard'>;
};

export const LoyaltyCardScreen: React.FC<LoyaltyCardScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const token = await StorageService.getAuthToken();
          if (!token) return;
          const profile = await ApiService.getProfile(token);
          const store = profile.stores.find(
            (st) => st.id === profile.activeStoreId,
          ) ?? profile.stores[0] ?? null;
          setActiveStore(store);
        } catch (err) {
          console.log('[LoyaltyCard] Failed to load profile:', err);
        } finally {
          setLoading(false);
        }
      })();
    }, []),
  );

  const qrValue = activeStore ? `loyapp${activeStore.customerId}` : null;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>My Card</Text>
        <Text style={s.backButton} onPress={() => navigation.goBack()}>
          Done
        </Text>
      </View>

      {activeStore && qrValue ? (
        <View style={s.cardContainer}>
          <Text style={s.storeName}>{activeStore.name}</Text>

          <View style={s.qrWrapper}>
            <QRCode
              value={qrValue}
              size={220}
              backgroundColor="#ffffff"
              color="#000000"
            />
          </View>

          <Text style={s.customerId}>
            Customer ID: {activeStore.customerId}
          </Text>
          <Text style={s.instruction}>
            Show this code at the register to earn and redeem rewards
          </Text>
        </View>
      ) : (
        <View style={s.emptyState}>
          <Text style={s.emptyText}>
            Select a store to view your loyalty card
          </Text>
        </View>
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
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    backButton: {
      fontSize: 17,
      fontWeight: '500',
      color: theme.accent,
    },
    cardContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    storeName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 24,
    },
    qrWrapper: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    customerId: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    instruction: {
      fontSize: 15,
      color: theme.textTertiary,
      textAlign: 'center',
      paddingHorizontal: 32,
      lineHeight: 22,
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 40,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textTertiary,
    },
  });
