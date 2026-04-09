import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Transaction } from '../types';
import { useTheme, Theme } from '../theme';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

type TransactionHistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionHistory'>;
};

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadTransactions = useCallback(async (offset = 0) => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) return;
      const profile = await ApiService.getProfile(token);
      const storeId = profile.activeStoreId ?? profile.stores[0]?.id;
      if (!storeId) return;

      const data = await ApiService.getTransactions(token, storeId, offset);
      console.log('[TransactionHistory] Raw response:', JSON.stringify(data, null, 2));

      if (offset === 0) {
        setTransactions(data.transactions);
      } else {
        setTransactions((prev) => [...prev, ...data.transactions]);
      }
      setTotal(data.total);
    } catch (err) {
      console.log('[TransactionHistory] Failed to load:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTransactions(0);
    }, [loadTransactions]),
  );

  const handleLoadMore = () => {
    if (loadingMore || transactions.length >= total) return;
    setLoadingMore(true);
    loadTransactions(transactions.length);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={s.txnCard}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={s.txnSummary}>
          <View style={s.txnInfo}>
            <Text style={s.txnDescription}>{item.description}</Text>
            <Text style={s.txnDate}>
              {formatDate(item.date)} at {formatTime(item.date)}
            </Text>
          </View>
          {item.grandTotal != null && (
            <Text style={s.txnTotal}>{item.displayGrandTotal}</Text>
          )}
        </View>

        {isExpanded && (
          <View style={s.txnDetails}>
            {item.lineItems.length > 0 && (
              <View style={s.detailSection}>
                <Text style={s.detailSectionTitle}>Items</Text>
                {item.lineItems.map((li, i) => (
                  <View key={i} style={s.detailRow}>
                    <Text style={s.detailLabel} numberOfLines={1}>
                      {li.quantity > 1 ? `${li.quantity}x ` : ''}{li.name}
                    </Text>
                    <Text style={s.detailValue}>{li.displayPrice}</Text>
                  </View>
                ))}
              </View>
            )}

            {(item.subtotal != null || item.salesTax != null || item.grandTotal != null) && (
              <View style={s.detailSection}>
                <Text style={s.detailSectionTitle}>Totals</Text>
                {item.displaySubtotal != null && (
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Subtotal</Text>
                    <Text style={s.detailValue}>{item.displaySubtotal}</Text>
                  </View>
                )}
                {item.displaySalesTax != null && (
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Sales Tax</Text>
                    <Text style={s.detailValue}>{item.displaySalesTax}</Text>
                  </View>
                )}
                {item.displayGrandTotal != null && (
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Grand Total</Text>
                    <Text style={s.totalValue}>{item.displayGrandTotal}</Text>
                  </View>
                )}
              </View>
            )}

            {item.tenders.length > 0 && (
              <View style={s.detailSection}>
                <Text style={s.detailSectionTitle}>Payment</Text>
                {item.tenders.map((t, i) => (
                  <View key={i} style={s.detailRow}>
                    <Text style={s.detailLabel}>{t.type}</Text>
                    <Text style={s.detailValue}>{t.displayAmount}</Text>
                  </View>
                ))}
              </View>
            )}

            {item.pointChanges.length > 0 && (
              <View style={s.detailSection}>
                <Text style={s.detailSectionTitle}>Points</Text>
                {item.pointChanges.map((pc, i) => (
                  <View key={i} style={s.detailRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.detailLabel}>{pc.pointType}</Text>
                      {pc.reason && (
                        <Text style={s.pointReason}>{pc.reason}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        s.detailValue,
                        { color: pc.change >= 0 ? theme.success : theme.error },
                      ]}
                    >
                      {pc.displayChange}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <Text style={s.expandHint}>
          {isExpanded ? 'Tap to collapse' : 'Tap for details'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>History</Text>
          <Text style={s.backButton} onPress={() => navigation.goBack()}>
            Done
          </Text>
        </View>
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>History</Text>
        <Text style={s.backButton} onPress={() => navigation.goBack()}>
          Done
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={s.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={theme.accent} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No transaction history yet</Text>
          </View>
        }
      />
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
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    txnCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    txnSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    txnInfo: {
      flex: 1,
    },
    txnDescription: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 4,
    },
    txnDate: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    txnTotal: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 12,
    },
    txnDetails: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    detailSection: {
      marginBottom: 12,
    },
    detailSectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 4,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
      marginRight: 12,
    },
    detailValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      marginTop: 4,
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    totalValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    pointReason: {
      fontSize: 12,
      color: theme.textTertiary,
      marginTop: 2,
    },
    expandHint: {
      fontSize: 12,
      color: theme.textTertiary,
      textAlign: 'center',
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
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
