import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  testID?: string;
};

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, full, testID }: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        (disabled || loading) && { opacity: 0.6 },
        full && { alignSelf: 'stretch' },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={isPrimary ? theme.colors.bg : theme.colors.primary} />
        ) : (
          icon && <Ionicons name={icon} size={16} color={isPrimary ? theme.colors.bg : theme.colors.primary} />
        )}
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textAlt]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: theme.colors.primary },
  outline: { borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  textPrimary: { color: theme.colors.bg },
  textAlt: { color: theme.colors.primary },
});
