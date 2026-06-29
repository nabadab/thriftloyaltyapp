import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme, Theme } from '../theme';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

type BootstrapScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Bootstrap'>;
};

/**
 * Decides where to send the user on launch.
 *
 * Sessions are meant to persist basically forever: if a token is stored we
 * keep the user signed in. We only bounce them to Login when there is no
 * token at all, or when the server explicitly rejects the token (401/403).
 * Transient/offline errors keep the user signed in and let Home retry.
 */
export const BootstrapScreen: React.FC<BootstrapScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await StorageService.getAuthToken();
      if (cancelled) return;

      if (!token) {
        navigation.replace('Login');
        return;
      }

      try {
        await ApiService.getProfile(token);
        if (!cancelled) navigation.replace('Home');
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        const isAuthError = msg.includes('401') || msg.includes('403');
        if (isAuthError) {
          await StorageService.clearAll();
          if (!cancelled) navigation.replace('Login');
        } else {
          // Network/transient hiccup — stay signed in, Home will retry.
          if (!cancelled) navigation.replace('Home');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <LinearGradient
      colors={theme.gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.container}
    >
      <View style={s.logoBadge}>
        <Text style={s.logoMark}>🛍️</Text>
      </View>
      <Text style={s.wordmark}>ThriftLoyalty</Text>
      <ActivityIndicator color="#ffffff" style={s.spinner} />
    </LinearGradient>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoBadge: {
      width: 96,
      height: 96,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    logoMark: {
      fontSize: 48,
    },
    wordmark: {
      fontSize: 28,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: 0.3,
    },
    spinner: {
      marginTop: 28,
    },
  });
