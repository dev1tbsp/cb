import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '@/src/theme';
import { ImagePickerField } from './ImagePickerField';

export function MediaPanel() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={s.title}>Media Library</Text>
        <Text style={s.subtitle}>Upload images for menu, packages and content. Stored in MongoDB as base64.</Text>
      </View>

      <View style={s.card}>
        <ImagePickerField label="Upload a new image" value={last} onChange={setLast} />
        {last && (
          <View style={s.urlBox}>
            <Text style={s.urlLabel}>Stored URL (copy &amp; paste anywhere)</Text>
            <Text style={s.url} selectable>{last}</Text>
          </View>
        )}
      </View>

      <View style={s.tipCard}>
        <Text style={s.tipTitle}>How it works</Text>
        <Text style={s.tipText}>• Upload up to 2MB images directly from your device.{'\n'}• Or paste any public image URL.{'\n'}• The URL/data is reusable across menu items and packages.{'\n'}• Uploaded files are stored on the backend as base64 data URLs.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 12 },
  urlBox: { padding: 12, backgroundColor: theme.colors.surfaceAlt, borderRadius: 4, gap: 6, borderWidth: 1, borderColor: theme.colors.border },
  urlLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  url: { color: theme.colors.text, fontSize: 11, fontFamily: 'monospace' as any },
  tipCard: { padding: 18, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: 'rgba(230,176,77,0.06)', gap: 6 },
  tipTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  tipText: { color: theme.colors.text, fontSize: 13, lineHeight: 21 },
});
