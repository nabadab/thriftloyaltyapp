import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'brand' | 'coral';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/** Primary call-to-action with the brand gradient and a soft glow. */
export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'brand',
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const colors =
    variant === 'coral' ? theme.gradients.coral : theme.gradients.button;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.wrapper,
        {
          shadowColor: variant === 'coral' ? theme.coral : theme.primary,
        },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.label, textStyle]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

/** A small rounded "pill" badge — used for active store, status chips, etc. */
export const Pill: React.FC<{
  label: string;
  tone?: 'brand' | 'coral' | 'muted';
}> = ({ label, tone = 'brand' }) => {
  const theme = useTheme();
  const map = {
    brand: { bg: theme.primary + '1A', fg: theme.primary },
    coral: { bg: theme.coral + '1A', fg: theme.coralDark },
    muted: { bg: theme.textSecondary + '1A', fg: theme.textSecondary },
  } as const;
  const { bg, fg } = map[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
