import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../types';
import { useTheme, Theme } from '../theme';
import { ApiService } from '../services/api';
import { GradientButton } from '../components/ui';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const s = styles(theme);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      Toast.show({ type: 'error', text1: 'Please enter a valid phone number' });
      return;
    }

    setLoading(true);
    try {
      await ApiService.requestOTP(cleaned);
      navigation.navigate('VerifyOTP', { phone: cleaned });
    } catch (err) {
      console.log('[Login] OTP request failed:', err);
      Toast.show({ type: 'error', text1: 'Failed to send code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.content}
      >
        <View style={s.brandBlock}>
          <LinearGradient
            colors={theme.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.logoBadge}
          >
            <Text style={s.logoMark}>🛍️</Text>
          </LinearGradient>
          <Text style={s.title}>ThriftLoyalty</Text>
          <Text style={s.subtitle}>
            Your points, rewards, and receipts — all in one place.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Phone number</Text>
          <TextInput
            style={s.input}
            placeholder="(555) 123-4567"
            placeholderTextColor={theme.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            editable={!loading}
          />
          <GradientButton
            label="Send Code"
            onPress={handleRequestOTP}
            loading={loading}
            style={s.button}
          />
          <Text style={s.disclaimer}>
            We'll text you a one-time code to sign in.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    brandBlock: {
      alignItems: 'center',
      marginBottom: 36,
    },
    logoBadge: {
      width: 88,
      height: 88,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      ...theme.shadow.hero,
    },
    logoMark: {
      fontSize: 44,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 12,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border,
      ...theme.shadow.card,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      padding: 16,
      fontSize: 17,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
    },
    button: {
      marginTop: 0,
    },
    disclaimer: {
      fontSize: 13,
      color: theme.textTertiary,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 18,
    },
  });
