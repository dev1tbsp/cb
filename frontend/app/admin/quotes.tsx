import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '@/src/api/admin';
import { theme, BUSINESS } from '@/src/theme';

interface Quote {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string | null;
  event_type: string;
  guest_count: number;
  event_date?: string | null;
  location?: string | null;
  cuisines: string[];
  services: string[];
  live_counters: string[];
  needs_staff: boolean;
  needs_decor: boolean;
  notes?: string | null;
  estimated_total: number;
  estimated_per_plate: number;
  status: string;
  created_at: string;
}

const STATUSES = ['pending', 'contacted', 'confirmed', 'cancelled'];
const STATUS_COLOR: Record<string, string> = {
  pending: theme.colors.primary,
  contacted: '#60A5FA',
  confirmed: theme.colors.success,
  cancelled: theme.colors.danger,
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Quote | null>(null);
  const [updating, setUpdating] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await adminApi.listQuotes(filter === 'all' ? undefined : filter);
      setQuotes(list);
    } catch (e) {
      console.warn('quotes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [filter]);

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const updated: any = await adminApi.updateQuoteStatus(selected.id, status);
      setSelected(updated);
      await refresh();
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || '');
    } finally {
      setUpdating(false);
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    const ok = Platform.OS === 'web' ? (typeof window !== 'undefined' && window.confirm('Delete this quote?')) : true;
    if (!ok) return;
    try {
      await adminApi.deleteQuote(selected.id);
      setSelected(null);
      await refresh();
    } catch (e: any) {
      Alert.alert('Delete failed', e?.message || '');
    }
  };

  const openWhatsApp = () => {
    if (!selected) return;
    const msg = encodeURIComponent(
      `Hi ${selected.user_name}, this is Cosmic Bites following up on your ${selected.event_type} quote for ${selected.guest_count} guests (₹${selected.estimated_total.toLocaleString('en-IN')}). When would be a good time to chat?`
    );
    const number = (selected.user_phone || '').replace(/\D/g, '') || BUSINESS.whatsapp;
    Linking.openURL(`https://wa.me/${number}?text=${msg}`);
  };

  const callCustomer = () => {
    if (!selected?.user_phone) return;
    Linking.openURL(`tel:${selected.user_phone}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <View>
          <Text style={styles.label}>Manage</Text>
          <Text style={styles.title}>Quote Inquiries</Text>
          <Text style={styles.sub}>{quotes.length} {filter === 'all' ? 'total' : filter} quotes</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {['all', ...STATUSES].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filter, filter === s && styles.filterActive]}
            onPress={() => setFilter(s)}
            testID={`quote-filter-${s}`}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : quotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No quotes in this status.</Text>
        </View>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 2 }]}>Customer</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Event</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Guests</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Estimated</Text>
            <Text style={[styles.th, { flex: 1 }]}>Status</Text>
          </View>
          {quotes.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.tableRow}
              onPress={() => setSelected(q)}
              testID={`quote-row-${q.id}`}
            >
              <View style={{ flex: 2 }}>
                <Text style={styles.cellPrimary}>{q.user_name}</Text>
                <Text style={styles.cellMuted}>{q.user_email}</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.cellPrimary}>{q.event_type.replace('_', ' ')}</Text>
                <Text style={styles.cellMuted}>{new Date(q.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.cellPrimary, { flex: 1, textAlign: 'right' }]}>{q.guest_count}</Text>
              <Text style={[styles.cellPrimary, { flex: 1.5, textAlign: 'right', color: theme.colors.primary, fontWeight: '700' }]}>
                ₹{q.estimated_total.toLocaleString('en-IN')}
              </Text>
              <View style={{ flex: 1 }}>
                <View style={[styles.statusBadge, { borderColor: STATUS_COLOR[q.status] || theme.colors.border }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[q.status] || theme.colors.text }]}>
                    {q.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quote detail modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.backdrop}>
          {selected && (
            <View style={styles.modal}>
              <View style={styles.modalHead}>
                <View>
                  <Text style={styles.modalLabel}>{selected.event_type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.modalTitle}>{selected.user_name}</Text>
                  <Text style={styles.modalSub}>{selected.user_email} {selected.user_phone ? `· ${selected.user_phone}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)} testID="quote-detail-close">
                  <Ionicons name="close" size={22} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Estimated total</Text>
                  <Text style={styles.priceVal}>₹{selected.estimated_total.toLocaleString('en-IN')}</Text>
                  <Text style={styles.priceSub}>₹{selected.estimated_per_plate}/plate · {selected.guest_count} guests</Text>
                </View>

                <View style={styles.metaGrid}>
                  <Meta label="Event Date" value={selected.event_date || '—'} />
                  <Meta label="Location" value={selected.location || '—'} />
                  <Meta label="Cuisines" value={selected.cuisines.join(', ') || '—'} />
                  <Meta label="Services" value={selected.services.join(', ') || '—'} />
                  <Meta label="Live Counters" value={selected.live_counters.join(', ') || '—'} />
                  <Meta label="Extras" value={[selected.needs_staff && 'Staff', selected.needs_decor && 'Decor'].filter(Boolean).join(', ') || '—'} />
                </View>

                {selected.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Customer notes</Text>
                    <Text style={styles.notesText}>{selected.notes}</Text>
                  </View>
                )}

                <Text style={styles.statusLabel}>Update status</Text>
                <View style={styles.statusRow}>
                  {STATUSES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBtn,
                        selected.status === s && { backgroundColor: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] },
                      ]}
                      onPress={() => updateStatus(s)}
                      disabled={updating}
                      testID={`set-status-${s}`}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          selected.status === s && { color: theme.colors.background },
                        ]}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={openWhatsApp} testID="quote-whatsapp">
                    <Ionicons name="logo-whatsapp" size={16} color={theme.colors.background} />
                    <Text style={styles.actionBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                  {!!selected.user_phone && (
                    <TouchableOpacity style={styles.actionBtn} onPress={callCustomer} testID="quote-call">
                      <Ionicons name="call" size={16} color={theme.colors.background} />
                      <Text style={styles.actionBtnText}>Call</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} testID="quote-delete">
                    <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                    <Text style={styles.deleteText}>Delete</Text>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 32, gap: 16, maxWidth: 1200, alignSelf: 'stretch' },
  head: { gap: 4 },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  filterActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: theme.colors.background, fontWeight: '700' },

  empty: { padding: 40, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted },

  table: { backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', padding: 14, backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  th: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  tableRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border, alignItems: 'center', gap: 8 },
  cellPrimary: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  cellMuted: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 700, maxHeight: '92%', backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.primary },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12 },
  modalLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  modalTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 4 },
  modalSub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  modalBody: { padding: 20, gap: 16 },
  priceCard: { backgroundColor: theme.colors.background, padding: 20, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center' },
  priceLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  priceVal: { color: theme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 4 },
  priceSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { flex: 1, minWidth: '47%', backgroundColor: theme.colors.background, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  metaLabel: { color: theme.colors.primary, fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  metaValue: { color: theme.colors.text, fontSize: 13, marginTop: 4 },
  notesBox: { backgroundColor: theme.colors.background, padding: 14, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  notesLabel: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  notesText: { color: theme.colors.text, fontSize: 13, lineHeight: 19 },
  statusLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, fontWeight: '700', marginTop: 4 },
  statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  statusBtnText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4 },
  actionBtnText: { color: theme.colors.background, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.colors.danger, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4, marginLeft: 'auto' },
  deleteText: { color: theme.colors.danger, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
});
