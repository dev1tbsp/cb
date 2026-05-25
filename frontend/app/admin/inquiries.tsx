import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '@/src/api/admin';
import { theme } from '@/src/theme';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  reply?: string | null;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  new: theme.colors.primary,
  replied: '#60A5FA',
  resolved: theme.colors.success,
};

export default function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listInquiries();
      setItems(data);
    } catch (e) {
      console.warn('inquiries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openItem = (q: Inquiry) => {
    setSelected(q);
    setReply(q.reply || '');
  };

  const saveReply = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated: any = await adminApi.updateInquiry(selected.id, {
        reply: reply || null,
        status,
      });
      setSelected(updated);
      await refresh();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || '');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    const ok = Platform.OS === 'web' ? (typeof window !== 'undefined' && window.confirm('Delete this query?')) : true;
    if (!ok) return;
    try {
      await adminApi.deleteInquiry(selected.id);
      setSelected(null);
      await refresh();
    } catch (e: any) {
      Alert.alert('Delete failed', e?.message || '');
    }
  };

  const emailReply = () => {
    if (!selected || !reply) return;
    const subject = encodeURIComponent(`Re: ${selected.subject || 'Your enquiry'} — Cosmic Bites`);
    const body = encodeURIComponent(reply);
    Linking.openURL(`mailto:${selected.email}?subject=${subject}&body=${body}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <View>
          <Text style={styles.label}>Manage</Text>
          <Text style={styles.title}>Queries & Inquiries</Text>
          <Text style={styles.sub}>{items.filter((i) => i.status === 'new').length} new · {items.length} total</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No queries yet. Customers can submit via the home contact form.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={[styles.row, q.status === 'new' && styles.rowUnread]}
              onPress={() => openItem(q)}
              testID={`inquiry-row-${q.id}`}
            >
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[q.status] || theme.colors.border }]} />
              <View style={{ flex: 1 }}>
                <View style={styles.rowHead}>
                  <Text style={styles.rowName}>{q.name}</Text>
                  <Text style={styles.rowDate}>{new Date(q.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.rowSubject}>{q.subject || '(no subject)'}</Text>
                <Text style={styles.rowPreview} numberOfLines={2}>{q.message}</Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: STATUS_COLOR[q.status] }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[q.status] }]}>{q.status.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.backdrop}>
          {selected && (
            <View style={styles.modal}>
              <View style={styles.modalHead}>
                <View>
                  <Text style={styles.modalLabel}>{selected.subject || 'INQUIRY'}</Text>
                  <Text style={styles.modalTitle}>{selected.name}</Text>
                  <Text style={styles.modalSub}>{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)} testID="inquiry-close">
                  <Ionicons name="close" size={22} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalBody}>
                <View style={styles.msgBox}>
                  <Text style={styles.msgLabel}>Message</Text>
                  <Text style={styles.msgText}>{selected.message}</Text>
                </View>

                <Text style={styles.replyLabel}>Your reply / internal note</Text>
                <TextInput
                  style={styles.replyInput}
                  multiline
                  value={reply}
                  onChangeText={setReply}
                  placeholder="Write your response..."
                  placeholderTextColor={theme.colors.textMuted}
                  testID="reply-input"
                />

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary, saving && { opacity: 0.6 }]}
                    onPress={() => saveReply('replied')}
                    disabled={saving}
                    testID="mark-replied"
                  >
                    {saving ? <ActivityIndicator color={theme.colors.background} /> : <Text style={styles.btnPrimaryText}>Save & mark replied</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnOutline]}
                    onPress={() => saveReply('resolved')}
                    testID="mark-resolved"
                  >
                    <Text style={styles.btnOutlineText}>Mark resolved</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnGhost} onPress={emailReply} testID="email-customer">
                    <Ionicons name="mail-outline" size={14} color={theme.colors.primary} />
                    <Text style={styles.btnGhostText}>Email customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnDanger} onPress={onDelete} testID="delete-inquiry">
                    <Ionicons name="trash-outline" size={14} color={theme.colors.danger} />
                    <Text style={styles.btnDangerText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 32, gap: 18, maxWidth: 1000, alignSelf: 'stretch' },
  head: { gap: 4 },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  empty: { padding: 40, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted },
  list: { gap: 10 },
  row: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  rowUnread: { borderColor: theme.colors.primary },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between' },
  rowName: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  rowDate: { color: theme.colors.textMuted, fontSize: 11 },
  rowSubject: { color: theme.colors.primary, fontSize: 12, marginTop: 2, fontWeight: '600' },
  rowPreview: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 620, maxHeight: '90%', backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.primary },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12 },
  modalLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  modalSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  modalBody: { padding: 20, gap: 14 },
  msgBox: { backgroundColor: theme.colors.background, padding: 14, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  msgLabel: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 6 },
  msgText: { color: theme.colors.text, fontSize: 13, lineHeight: 19 },
  replyLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, fontWeight: '700', marginTop: 4 },
  replyInput: { backgroundColor: theme.colors.background, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, padding: 12, minHeight: 100, borderRadius: 4, textAlignVertical: 'top', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4 },
  btnPrimary: { backgroundColor: theme.colors.primary, flex: 1, justifyContent: 'center' },
  btnPrimaryText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  btnOutline: { borderWidth: 1, borderColor: theme.colors.primary, flex: 1, justifyContent: 'center' },
  btnOutlineText: { color: theme.colors.primary, fontWeight: '700', letterSpacing: 1, fontSize: 12 },
  btnGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4 },
  btnGhostText: { color: theme.colors.primary, fontWeight: '600', fontSize: 12 },
  btnDanger: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.danger, marginLeft: 'auto' },
  btnDangerText: { color: theme.colors.danger, fontWeight: '700', fontSize: 12 },
});
