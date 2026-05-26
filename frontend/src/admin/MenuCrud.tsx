import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { ImagePickerField } from './ImagePickerField';
import { ConfirmDialog } from './ConfirmDialog';

type MenuItem = { id: string; name: string; category: string; description: string; price_min: number; price_max: number; spice_level: number; is_jain: boolean; is_live_counter: boolean; image: string | null };

const BLANK: Omit<MenuItem, 'id'> = { name: '', category: 'North Indian', description: '', price_min: 100, price_max: 200, spice_level: 0, is_jain: false, is_live_counter: false, image: null };

export function MenuCrud() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.get('/menu')); }
    catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<MenuItem, 'id'>, id?: string) => {
    if (id) await api.put(`/admin/menu/${id}`, data, true);
    else await api.post('/admin/menu', data, true);
    setEditing(null); setCreating(false);
    await load();
  };
  const handleDelete = async (id: string) => {
    await api.del(`/admin/menu/${id}`, true);
    setConfirmId(null);
    await load();
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={s.head}>
        <View>
          <Text style={s.title}>Menu Items</Text>
          <Text style={s.subtitle}>{items.length} items · Manage your catering menu</Text>
        </View>
        <Button label="New Item" icon="add" onPress={() => setCreating(true)} testID="menu-new" />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <View style={s.grid}>
          {items.map((it) => (
            <View key={it.id} style={s.card} testID={`menu-row-${it.id}`}>
              <View style={s.cardHead}>
                <Text style={s.name}>{it.name}</Text>
                <Text style={s.cat}>{it.category}</Text>
              </View>
              <Text style={s.desc} numberOfLines={2}>{it.description}</Text>
              <View style={s.cardFoot}>
                <Text style={s.price}>₹{it.price_min}-{it.price_max}</Text>
                <View style={s.actions}>
                  <TouchableOpacity onPress={() => setEditing(it)} style={s.actBtn}><Ionicons name="pencil" size={14} color={theme.colors.primary} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmId(it.id)} style={s.actBtn}><Ionicons name="trash" size={14} color={theme.colors.danger} /></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {(creating || editing) && (
        <MenuForm
          initial={editing ? editing : (BLANK as any)}
          onCancel={() => { setEditing(null); setCreating(false); }}
          onSave={(data) => handleSave(data, editing?.id)}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete menu item?"
          message="This will permanently remove the item."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => handleDelete(confirmId)}
        />
      )}
    </View>
  );
}

function MenuForm({ initial, onCancel, onSave }: { initial: any; onCancel: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [description, setDescription] = useState(initial.description);
  const [priceMin, setPriceMin] = useState(String(initial.price_min));
  const [priceMax, setPriceMax] = useState(String(initial.price_max));
  const [spice, setSpice] = useState(initial.spice_level);
  const [isJain, setIsJain] = useState(initial.is_jain);
  const [isLive, setIsLive] = useState(initial.is_live_counter);
  const [image, setImage] = useState<string | null>(initial.image);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null); setSaving(true);
    try {
      await onSave({
        name, category, description,
        price_min: parseInt(priceMin) || 0,
        price_max: parseInt(priceMax) || 0,
        spice_level: parseInt(String(spice)) || 0,
        is_jain: !!isJain,
        is_live_counter: !!isLive,
        image: image || null,
      });
    } catch (e: any) {
      setErr(e.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <View style={fs.backdrop}>
      <View style={fs.modal}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <Text style={fs.title}>{initial.id ? 'Edit Menu Item' : 'New Menu Item'}</Text>
          <Input label="Name" value={name} onChangeText={setName} testID="menu-form-name" />
          <Input label="Category" value={category} onChangeText={setCategory} placeholder="e.g. North Indian, Desserts" testID="menu-form-category" />
          <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ minHeight: 70, textAlignVertical: 'top' }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Input label="Min Price" value={priceMin} onChangeText={setPriceMin} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Input label="Max Price" value={priceMax} onChangeText={setPriceMax} keyboardType="numeric" /></View>
          </View>
          <View>
            <Text style={fs.lbl}>Spice Level</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[0, 1, 2, 3].map((n) => (
                <TouchableOpacity key={n} onPress={() => setSpice(n)} style={[fs.chip, spice === n && fs.chipActive]}>
                  <Text style={[fs.chipText, spice === n && fs.chipTextActive]}>{n === 0 ? 'None' : '🌶'.repeat(n)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Toggle label="Jain" value={isJain} onChange={setIsJain} />
            <Toggle label="Live Counter" value={isLive} onChange={setIsLive} />
          </View>
          <ImagePickerField label="Image" value={image} onChange={setImage} />

          {err && <Text style={fs.err}>{err}</Text>}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Button label="Cancel" variant="outline" onPress={onCancel} />
            <Button label="Save" icon="save" onPress={submit} loading={saving} testID="menu-form-save" />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function Toggle({ label, value, onChange }: any) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={[fs.toggle, value && fs.toggleActive]}>
      <Ionicons name={value ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={value ? theme.colors.bg : theme.colors.textMuted} />
      <Text style={[fs.toggleText, value && { color: theme.colors.bg, fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: theme.colors.textMuted, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '100%', backgroundColor: theme.colors.surface, padding: 14, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, gap: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { color: theme.colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  cat: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  desc: { color: theme.colors.textMuted, fontSize: 12 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 6 },
  actBtn: { width: 30, height: 30, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
});

const fs = StyleSheet.create({
  backdrop: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  lbl: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 12 },
  chipTextActive: { color: theme.colors.bg },
  toggle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  toggleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { color: theme.colors.text, fontSize: 13, fontWeight: '500' },
  err: { color: theme.colors.danger, fontSize: 12 },
});
