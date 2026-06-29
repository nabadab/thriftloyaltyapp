import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../types';
import { useTheme, Theme } from '../theme';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { GradientButton } from '../components/ui';

type VerifyOTPScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyOTP'>;
  route: RouteProp<RootStackParamList, 'VerifyOTP'>;
};

export const VerifyOTPScreen: React.FC<VerifyOTPScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const s = styles(theme);
  const { phone } = route.params;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (code.length < 4) {
      Toast.show({ type: 'error', text1: 'Please enter the full code' });
      return;
    }

    setLoading(true);
    try {
      const { token } = await ApiService.verifyOTP(phone, code);
      await StorageService.setAuthToken(token);
      navigation.replace('Home');
    } catch (err) {
      console.log('[VerifyOTP] Verification failed:', err);
      Toast.show({ type: 'error', text1: 'Invalid code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await ApiService.requestOTP(phone);
      Toast.show({ type: 'success', text1: 'Code resent!' });
    } catch (err) {
      console.log('[VerifyOTP] Resend failed:', err);
      Toast.show({ type: 'error', text1: 'Failed to resend code' });
    }
  };

  const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');

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
            style={s.iconBadge}
          >
            <Text style={s.iconMark}>✉️</Text>
          </LinearGradient>
          <Text style={s.title}>Enter your code</Text>
          <Text style={s.subtitle}>
            We sent a verification code to{'\n'}
            <Text style={s.phoneText}>{formattedPhone}</Text>
          </Text>
        </View>

        <View style={s.card}>
          <TextInput
            ref={inputRef}
            style={s.codeInput}
            placeholder="000000"
            placeholderTextColor={theme.textTertiary}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
            textAlign="center"
          />

          <GradientButton
            label="Verify"
            onPress={handleVerify}
            loading={loading}
          />

          <TouchableOpacity style={s.resendButton} onPress={handleResend}>
            <Text style={s.resendText}>Resend code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={s.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.backText}>Use a different number</Text>
        </TouchableOpacity>
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
      marginBottom: 28,
    },
    iconBadge: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      ...theme.shadow.hero,
    },
    iconMark: {
      fontSize: 34,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    phoneText: {
      color: theme.text,
      fontWeight: '700',
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border,
      ...theme.shadow.card,
    },
    codeInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      padding: 18,
      fontSize: 30,
      fontWeight: '700',
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
      letterSpacing: 10,
    },
    resendButton: {
      alignItems: 'center',
      marginTop: 18,
    },
    resendText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    backButton: {
      alignItems: 'center',
      marginTop: 24,
    },
    backText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
  });
