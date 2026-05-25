import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { adminApi, pickImageDataUrl } from '@/src/api/admin';

export type FieldType = 'text' | 'textarea' | 'number' | 'switch' | 'image' | 'list';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
}

interface Props<T extends { id: string }> {
  title: string;
  subtitle?: string;
  fetchList: () => Promise<T[]>;
  create: (body: any) => Promise<T>;
  update: (id: string, body: any) => Promise<T>;
  remove: (id: string) => Promise<any>;
  fields: FieldDef[];
  renderRow: (item: T) => { primary: string; secondary?: string; image?: string; badges?: string[] };
  emptyDefaults?: Record<string, any>;
}

export function CrudList<T extends { id: string }>({
  title,
  subtitle,
  fetchList,
  create,
  update,
  remove,
  fields,
  renderRow,
  emptyDefaults = {},
}: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState<Record<string, boolean>>({});

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchList();
      setItems(data);
    } catch (e: any) {
      Alert.alert('Load failed', e?.message || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const startCreate = () => {
    setForm({ ...emptyDefaults });
    setEditing(null);
    setCreating(true);
  };

  const startEdit = (item: T) => {
    setForm({ ...item });
    setEditing(item);
    setCreating(false);
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
    setForm({});
  };

  const setField = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (key: string) => {
    setImgUploading((u) => ({ ...u, [key]: true }));
    try {
      const dataUrl = await pickImageDataUrl();
      if (!dataUrl) return;
      const res: any = await adminApi.uploadMedia(dataUrl);
      setField(key, res.url);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message || '');
    } finally {
      setImgUploading((u) => ({ ...u, [key]: false }));
    }
  };

  const submit = async () => {
    // Validate required
    for (const f of fields) {
      if (f.required && (form[f.key] === undefined || form[f.key] === '' || form[f.key] === null)) {
        Alert.alert('Validation', `${f.label} is required`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      // Coerce numbers
      fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key] !== undefined && payload[f.key] !== null && payload[f.key] !== '') {
          payload[f.key] = parseInt(String(payload[f.key])) || 0;
        }
        if (f.type === 'list' && typeof payload[f.key] === 'string') {
          payload[f.key] = payload[f.key].split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      });
      delete payload.id;
      if (editing) {
        await update(editing.id, payload);
      } else {
        await create(payload);
      }
      close();
      await refresh();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || '');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (item: T) => {
    const confirm = Platform.OS === 'web'
      ? (typeof window !== 'undefined' && window.confirm('Delete this item?'))
      : true;
    if (!confirm) return;
    (async () => {
      try {
        await remove(item.id);
        await refresh();
      } catch (e: any) {
        Alert.alert('Delete failed', e?.message || '');
      }
    })();
  };

  const showModal = creating || editing !== null;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <View>
          <Text style={styles.label}>Manage</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={startCreate} testID="crud-add-btn">
          <Ionicons name="add" size={18} color={theme.colors.background} />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No items yet — click New to add the first one.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const r = renderRow(item);
            return (
              <View key={item.id} style={styles.row} testID={`crud-row-${item.id}`}>
                {r.image && <Image source={{ uri: r.image }} style={styles.rowImg} />}
                <View style={styles.rowBody}>
                  <Text style={styles.rowPrimary}>{r.primary}</Text>
                  {!!r.secondary && <Text style={styles.rowSecondary}>{r.secondary}</Text>}
                  {r.badges && r.badges.length > 0 && (
                    <View style={styles.rowBadges}>
                      {r.badges.map((b, i) => (
                        <View key={i} style={styles.rowBadge}>
                          <Text style={styles.rowBadgeText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => startEdit(item)} testID={`crud-edit-${item.id}`}>
                    <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => onDelete(item)} testID={`crud-delete-${item.id}`}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</Text>
              <TouchableOpacity onPress={close} testID="crud-close-btn">
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
              {fields.map((f) => (
                <View key={f.key} style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {f.label}{f.required ? ' *' : ''}
                  </Text>
                  {f.type === 'switch' ? (
                    <Switch
                      value={!!form[f.key]}
                      onValueChange={(v) => setField(f.key, v)}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      testID={`field-${f.key}`}
                    />
                  ) : f.type === 'image' ? (
                    <View style={{ gap: 8 }}>
                      <TextInput
                        style={styles.input}
                        placeholder="Paste image URL or upload"
                        placeholderTextColor={theme.colors.textMuted}
                        value={form[f.key] || ''}
                        onChangeText={(v) => setField(f.key, v)}
                        testID={`field-${f.key}`}
                      />
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TouchableOpacity
                          style={styles.uploadBtn}
                          onPress={() => handleImageUpload(f.key)}
                          disabled={imgUploading[f.key]}
                          testID={`upload-${f.key}`}
                        >
                          {imgUploading[f.key] ? (
                            <ActivityIndicator size="small" color={theme.colors.background} />
                          ) : (
                            <>
                              <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.background} />
                              <Text style={styles.uploadText}>Upload</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        {!!form[f.key] && (
                          <Image source={{ uri: form[f.key] }} style={styles.preview} />
                        )}
                      </View>
                    </View>
                  ) : f.type === 'textarea' ? (
                    <TextInput
                      style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                      placeholder={f.placeholder}
                      placeholderTextColor={theme.colors.textMuted}
                      value={form[f.key] || ''}
                      onChangeText={(v) => setField(f.key, v)}
                      multiline
                      testID={`field-${f.key}`}
                    />
                  ) : f.type === 'list' ? (
                    <TextInput
                      style={styles.input}
                      placeholder={f.placeholder || 'Comma-separated'}
                      placeholderTextColor={theme.colors.textMuted}
                      value={Array.isArray(form[f.key]) ? form[f.key].join(', ') : (form[f.key] || '')}
                      onChangeText={(v) => setField(f.key, v)}
                      testID={`field-${f.key}`}
                    />
                  ) : (
                    <TextInput
                      style={styles.input}
                      placeholder={f.placeholder}
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType={f.type === 'number' ? 'number-pad' : 'default'}
                      value={form[f.key] !== undefined && form[f.key] !== null ? String(form[f.key]) : ''}
                      onChangeText={(v) => setField(f.key, v)}
                      testID={`field-${f.key}`}
                    />
                  )}
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={submit}
                disabled={saving}
                testID="crud-save-btn"
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <Text style={styles.saveText}>{editing ? 'Save changes' : 'Create'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 32, gap: 20, maxWidth: 1200, alignSelf: 'stretch' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4,
  },
  addBtnText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  empty: { padding: 40, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted },
  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: theme.colors.surface, padding: 14, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  rowImg: { width: 60, height: 60, borderRadius: 4 },
  rowBody: { flex: 1, gap: 4 },
  rowPrimary: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  rowSecondary: { color: theme.colors.textMuted, fontSize: 12 },
  rowBadges: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  rowBadge: { backgroundColor: 'rgba(230,176,77,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.primary },
  rowBadgeText: { color: theme.colors.primary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  rowActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 36, height: 36, borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  iconBtnDanger: { borderColor: theme.colors.danger },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 600, maxHeight: '90%', backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.primary },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  field: { gap: 6 },
  fieldLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, padding: 12, fontSize: 14, borderRadius: 4 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 4 },
  uploadText: { color: theme.colors.background, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  preview: { width: 60, height: 60, borderRadius: 4 },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  cancelText: { color: theme.colors.text, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 12, borderRadius: 4, backgroundColor: theme.colors.primary, alignItems: 'center' },
  saveText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
