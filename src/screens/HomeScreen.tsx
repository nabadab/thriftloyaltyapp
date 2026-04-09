import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActionSheetIOS,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList, LoyaltyData, PointType, Store } from '../types';
import { useTheme, Theme } from '../theme';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const s = styles(theme);

  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= 500;

  const [refreshing, setRefreshing] = useState(false);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);

  const loadData = useCallback(async () => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) return;

      const profile = await ApiService.getProfile(token);
      const store = profile.stores.find(
        (st) => st.id === profile.activeStoreId,
      ) ?? profile.stores[0] ?? null;
      setActiveStore(store);

      if (store) {
        const data = await ApiService.getBalances(token, store.id);
        console.log('[Home] Raw balances response:', JSON.stringify(data, null, 2));
        setLoyaltyData(data);
      } else {
        setLoyaltyData(null);
      }
    } catch (err) {
      console.log('[Home] Failed to load data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await StorageService.clearAll();
    navigation.replace('Login');
  };

  const handleProfileMenu = () => {
    const options = ['Refresh', 'Log Out', 'Cancel'];
    const destructiveIndex = 1;
    const cancelIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex: destructiveIndex, cancelButtonIndex: cancelIndex },
        (index) => {
          if (index === 0) {
            Toast.show({ type: 'info', text1: 'Refreshing...' });
            onRefresh();
          } else if (index === 1) {
            handleLogout();
          }
        },
      );
    } else {
      Alert.alert('Account', undefined, [
        {
          text: 'Refresh',
          onPress: () => {
            Toast.show({ type: 'info', text1: 'Refreshing...' });
            onRefresh();
          },
        },
        { text: 'Log Out', style: 'destructive', onPress: handleLogout },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const renderPointType = (pt: PointType, index: number) => (
    <View key={index} style={s.pointTypeCard}>
      <View style={s.pointTypeHeader}>
        <Text style={s.pointTypeName}>{pt.name}</Text>
        <Text style={s.pointTypeBalance}>{pt.displayBalance}</Text>
      </View>

      {pt.rewards.length > 0 && (
        <View style={s.rewardsList}>
          {pt.rewards.map((reward) => (
            <View
              key={reward.id}
              style={[s.rewardRow, !reward.redeemable && s.rewardRowDimmed]}
            >
              <View style={s.rewardInfo}>
                <Text
                  style={[
                    s.rewardName,
                    !reward.redeemable && s.rewardTextDimmed,
                  ]}
                >
                  {reward.name}
                </Text>
                <Text
                  style={[
                    s.rewardCost,
                    !reward.redeemable && s.rewardTextDimmed,
                  ]}
                >
                  {reward.cost}
                </Text>
              </View>
              {reward.status && (
                <Text style={s.rewardStatus}>{reward.status}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('StoreSelector')}>
            <Text style={s.storeName}>
              {activeStore?.name ?? 'Select Store'} ▾
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleProfileMenu}>
          <Text style={s.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeStore && (
          <View style={s.cardSection}>
            <View style={[s.cardRow, !isWide && s.cardRowNarrow]}>
              {activeStore.logoUrl && (
                <Image
                  source={{ uri: activeStore.logoUrl, cache: 'force-cache' }}
                  style={[s.storeLogo, !isWide && s.storeLogoNarrow]}
                  resizeMode="contain"
                />
              )}
              <View style={s.qrWrapper}>
                <QRCode
                  value={`loyapp${activeStore.customerId}`}
                  size={isWide ? 160 : 140}
                  backgroundColor="#ffffff"
                  color="#000000"
                />
              </View>
            </View>
            <Text style={s.qrLabel}>
              Show at register to earn & redeem rewards
            </Text>
          </View>
        )}

        {loyaltyData?.welcomeMessage && (
          <View style={s.welcomeBanner}>
            <Text style={s.welcomeText}>{loyaltyData.welcomeMessage}</Text>
          </View>
        )}

        {loyaltyData && loyaltyData.pointTypes.length > 0 ? (
          loyaltyData.pointTypes.map(renderPointType)
        ) : activeStore ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No loyalty data available</Text>
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>Select a store to view your balances</Text>
          </View>
        )}

        <TouchableOpacity
          style={s.historyButton}
          onPress={() => navigation.navigate('TransactionHistory')}
        >
          <Text style={s.historyButtonText}>View Transaction History</Text>
        </TouchableOpacity>
      </ScrollView>
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
    storeName: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
    },
    profileIcon: {
      fontSize: 24,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    welcomeBanner: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    welcomeText: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    pointTypeCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      marginHorizontal: 24,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    pointTypeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
    },
    pointTypeName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    pointTypeBalance: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.success,
    },
    rewardsList: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    rewardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    rewardRowDimmed: {
      opacity: 0.5,
    },
    rewardInfo: {
      flex: 1,
    },
    rewardName: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 2,
    },
    rewardCost: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    rewardTextDimmed: {
      color: theme.textTertiary,
    },
    rewardStatus: {
      fontSize: 12,
      color: theme.error,
      fontWeight: '500',
      marginLeft: 12,
      flexShrink: 0,
      maxWidth: 140,
      textAlign: 'right',
    },
    cardSection: {
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    },
    cardRowNarrow: {
      flexDirection: 'column',
    },
    storeLogo: {
      width: 120,
      height: 120,
      borderRadius: 12,
    },
    storeLogoNarrow: {
      marginBottom: 16,
    },
    qrWrapper: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 16,
    },
    qrLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 10,
    },
    historyButton: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginTop: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    historyButtonText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.accent,
    },
    emptyState: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 24,
      marginHorizontal: 24,
      marginTop: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textTertiary,
    },
  });
