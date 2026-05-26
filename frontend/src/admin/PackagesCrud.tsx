import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { ImagePickerField } from './ImagePickerField';
import { ConfirmDialog } from './ConfirmDialog';

type Pkg = { id: string; title: string; description: string; starting_price: number; icon: string; image: string | null; features: string[] };
const BLANK: Omit<Pkg, 'id'> = { title: '', description: '', starting_price: 499, icon: 'restaurant', image: null, features: [] };

export function PackagesCrud() {
  const [items, setItems] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.get('/services')); } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (data: any, id?: string) => {
    if (id) await api.put(`/admin/services/${id}`, data, true);
    else await api.post('/admin/services', data, true);
    setEditing(null); setCreating(false);
    await load();
  };
  const del = async (id: string) => { await api.del(`/admin/services/${id}`, true); setConfirmId(null); await load(); };

  return (
    <View style={{ gap: 16 }}>
      <View style={s.head}>
        <View>
          <Text style={s.title}>Catering Packages</Text>
          <Text style={s.subtitle}>{items.length} packages · Manage offerings</Text>
        </View>
        <Button label="New Package" icon="add" onPress={() => setCreating(true)} testID="pkg-new" />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <View style={s.grid}>
          {items.map((p) => (
            <View key={p.id} style={s.card} testID={`pkg-row-${p.id}`}>
              <View style={s.row}>
                <View style={s.iconBox}><Ionicons name={(p.icon || 'restaurant') as any} size={18} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{p.title}</Text>
                  <Text style={s.desc} numberOfLines={2}>{p.description}</Text>
                </View>
              </View>
              <View style={s.foot}>
                <Text style={s.price}>From ₹{p.starting_price}/plate</Text>
                <View style={s.actions}>
                  <TouchableOpacity onPress={() => setEditing(p)} style={s.actBtn}><Ionicons name="pencil" size={14} color={theme.colors.primary} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmId(p.id)} style={s.actBtn}><Ionicons name="trash" size={14} color={theme.colors.danger} /></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {(creating || editing) && (
        <PkgForm initial={editing ? editing : (BLANK as any)} onCancel={() => { setEditing(null); setCreating(false); }} onSave={(d) => save(d, editing?.id)} />
      )}

      {confirmId && <ConfirmDialog title="Delete package?" message="This will permanently remove the package." onCancel={() => setConfirmId(null)} onConfirm={() => del(confirmId)} />}
    </View>
  );
}

function PkgForm({ initial, onCancel, onSave }: any) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(String(initial.starting_price));
  const [icon, setIcon] = useState(initial.icon || 'restaurant');
  const [image, setImage] = useState<string | null>(initial.image);
  const [features, setFeatures] = useState<string>((initial.features || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null); setSaving(true);
    try {
      await onSave({
        title, description,
        starting_price: parseInt(price) || 0,
        icon: icon || 'restaurant',
        image: image || null,
        features: features.split('\n').map((x) => x.trim()).filter(Boolean),
      });
    } catch (e: any) { setErr(e.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <View style={fs.backdrop}>
      <View style={fs.modal}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <Text style={fs.title}>{initial.id ? 'Edit Package' : 'New Package'}</Text>
          <Input label="Title" value={title} onChangeText={setTitle} testID="pkg-form-title" />
          <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ minHeight: 70, textAlignVertical: 'top' }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Input label="Starting Price" value={price} onChangeText={setPrice} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Input label="Icon (Ionicons)" value={icon} onChangeText={setIcon} placeholder="e.g. gift, restaurant" /></View>
          </View>
          <Input label="Features (one per line)" value={features} onChangeText={setFeatures} multiline numberOfLines={4} style={{ minHeight: 90, textAlignVertical: 'top' }} />
          <ImagePickerField label="Image" value={image} onChange={setImage} />
          {err && <Text style={fs.err}>{err}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Button label="Cancel" variant="outline" onPress={onCancel} />
            <Button label="Save" icon="save" onPress={submit} loading={saving} testID="pkg-form-save" />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: theme.colors.textMuted, fontSize: 13 },
  grid: { gap: 10 },
  card: { backgroundColor: theme.colors.surface, padding: 14, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  name: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  desc: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 8 },
  price: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 6 },
  actBtn: { width: 30, height: 30, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
});
const fs = StyleSheet.create({
  backdrop: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  err: { color: theme.colors.danger, fontSize: 12 },
});
