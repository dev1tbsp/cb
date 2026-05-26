import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/theme';

type Props = { title: string; message?: string; onCancel: () => void; onConfirm: () => void };

export function ConfirmDialog({ title, message, onCancel, onConfirm }: Props) {
  return (
    <View style={s.backdrop}>
      <View style={s.modal}>
        <Text style={s.title}>{title}</Text>
        {message && <Text style={s.msg}>{message}</Text>}
        <View style={s.row}>
          <Button label="Cancel" variant="outline" onPress={onCancel} />
          <Button label="Delete" icon="trash" onPress={onConfirm} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 },
  modal: { width: '100%', maxWidth: 400, backgroundColor: theme.colors.surface, padding: 22, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 12 },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  msg: { color: theme.colors.textMuted, fontSize: 13 },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
