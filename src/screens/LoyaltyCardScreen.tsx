import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Store } from '../types';
import { useTheme, Theme } from '../theme';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { bustLogoCache } from '../utils/logoCache';

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
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
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
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroCard}
          >
            {activeStore.logoUrl ? (
              <View style={s.logoChip}>
                <Image
                  source={{ uri: bustLogoCache(activeStore.logoUrl) }}
                  style={s.storeLogo}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <Text style={s.heroStoreName}>{activeStore.name}</Text>
            )}

            <View style={s.qrWrapper}>
              <QRCode
                value={qrValue}
                size={230}
                backgroundColor="#ffffff"
                color="#0d1210"
              />
            </View>

            <Text style={s.customerId}>
              Member ID · {activeStore.customerId}
            </Text>
          </LinearGradient>

          <Text style={s.instruction}>
            Show this code at the register to earn and redeem rewards
          </Text>
        </View>
      ) : (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>🏬</Text>
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
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
    },
    backButton: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.primary,
    },
    cardContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    heroCard: {
      alignItems: 'center',
      borderRadius: 28,
      paddingVertical: 28,
      paddingHorizontal: 24,
      width: '100%',
      ...theme.shadow.hero,
    },
    logoChip: {
      backgroundColor: '#ffffff',
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 22,
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '90%',
    },
    storeLogo: {
      width: 240,
      height: 110,
    },
    heroStoreName: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.onGradient,
      textAlign: 'center',
      marginBottom: 22,
    },
    qrWrapper: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 20,
    },
    customerId: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 18,
      letterSpacing: 0.3,
    },
    instruction: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 24,
      lineHeight: 22,
      marginTop: 24,
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 48,
    },
    emptyEmoji: {
      fontSize: 44,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
  });
