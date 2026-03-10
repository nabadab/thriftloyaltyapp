import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { RootStackParamList, LoyaltyBalance, Store } from '../types';
import { useTheme, Theme } from '../theme';
import { StorageService } from '../services/storage';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const s = styles(theme);

  const [refreshing, setRefreshing] = useState(false);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [balances, setBalances] = useState<LoyaltyBalance[]>([]);

  const loadData = useCallback(async () => {
    // TODO: Fetch balances from API
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
        {balances.length > 0 ? (
          balances.map((balance, index) => (
            <View key={index} style={s.balanceCard}>
              <Text style={s.balanceLabel}>{balance.label}</Text>
              <Text style={s.balanceAmount}>{balance.displayValue}</Text>
            </View>
          ))
        ) : (
          <View style={s.balanceCard}>
            <Text style={s.balanceLabel}>Your Balance</Text>
            <Text style={s.balanceAmount}>--</Text>
          </View>
        )}

        <View style={s.actionsRow}>
          <TouchableOpacity
            style={s.actionButton}
            onPress={() => navigation.navigate('LoyaltyCard')}
          >
            <Text style={s.actionIcon}>📱</Text>
            <Text style={s.actionLabel}>My Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionButton}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Text style={s.actionIcon}>📋</Text>
            <Text style={s.actionLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionButton}
            onPress={() => navigation.navigate('Offers')}
          >
            <Text style={s.actionIcon}>🏷️</Text>
            <Text style={s.actionLabel}>Offers</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No recent activity</Text>
          </View>
        </View>
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
    balanceCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 24,
      marginTop: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    balanceLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
      marginBottom: 8,
    },
    balanceAmount: {
      fontSize: 40,
      fontWeight: '700',
      color: theme.success,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 24,
      marginTop: 24,
    },
    actionButton: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      flex: 1,
      marginHorizontal: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionIcon: {
      fontSize: 24,
      marginBottom: 6,
    },
    actionLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.text,
    },
    section: {
      paddingHorizontal: 24,
      marginTop: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    emptyState: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textTertiary,
    },
  });
