import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../types';
import { useTheme, Theme } from '../theme';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

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
        <Text style={s.title}>Enter Code</Text>
        <Text style={s.subtitle}>
          We sent a verification code to {formattedPhone}
        </Text>

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

        <TouchableOpacity
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.resendButton} onPress={handleResend}>
          <Text style={s.resendText}>Resend Code</Text>
        </TouchableOpacity>

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
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    codeInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 28,
      fontWeight: '600',
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
      letterSpacing: 8,
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '600',
    },
    resendButton: {
      alignItems: 'center',
      marginTop: 24,
    },
    resendText: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '500',
    },
    backButton: {
      alignItems: 'center',
      marginTop: 16,
    },
    backText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
  });
