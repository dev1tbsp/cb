import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';

type Props = { label?: string; value: string | null; onChange: (v: string | null) => void };

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const res = await api.post('/admin/media', { data_url: dataUrl }, true);
  return res.url;
}

export function ImagePickerField({ label = 'Image', value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const onFile = (file: File) => {
    setErr(null);
    if (file.size > 2_000_000) { setErr('Max 2 MB allowed.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setBusy(true);
        const dataUrl = reader.result as string;
        const stored = await uploadDataUrl(dataUrl);
        onChange(stored);
      } catch (e: any) {
        setErr(e.message || 'Upload failed');
      } finally { setBusy(false); }
    };
    reader.readAsDataURL(file);
  };

  const triggerFile = () => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const f = e.target.files?.[0];
      if (f) onFile(f);
    };
    input.click();
  };

  const useUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
  };

  return (
    <View style={{ gap: 8 }}>
      {label && <Text style={s.label}>{label}</Text>}
      {value && (
        <View style={s.preview}>
          <Image source={{ uri: value }} style={s.previewImg} resizeMode="cover" />
          <TouchableOpacity onPress={() => onChange(null)} style={s.removeBtn}><Ionicons name="close" size={14} color={theme.colors.bg} /></TouchableOpacity>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={triggerFile} disabled={busy} style={s.pickBtn}>
          {busy ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Ionicons name="cloud-upload" size={16} color={theme.colors.primary} />}
          <Text style={s.pickText}>{busy ? 'Uploading...' : 'Upload from device'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <TextInput placeholder="or paste image URL" placeholderTextColor={theme.colors.textMuted} value={urlInput} onChangeText={setUrlInput} style={s.urlInput} />
        <TouchableOpacity onPress={useUrl} style={s.useBtn}><Text style={s.useText}>Use</Text></TouchableOpacity>
      </View>
      {err && <Text style={s.err}>{err}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  label: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  preview: { position: 'relative', alignSelf: 'flex-start' },
  previewImg: { width: 140, height: 100, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt },
  removeBtn: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.danger, alignItems: 'center', justifyContent: 'center' },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.primary, borderStyle: 'dashed', backgroundColor: theme.colors.surfaceAlt },
  pickText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  urlInput: { flex: 1, backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, color: theme.colors.text, fontSize: 12 },
  useBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  useText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  err: { color: theme.colors.danger, fontSize: 11 },
});
