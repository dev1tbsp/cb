import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../theme';

type Props = TextInputProps & { label?: string };

export function Input({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, style as any]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  input: { backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text, fontSize: 14 },
});
