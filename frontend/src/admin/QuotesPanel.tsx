import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { Button } from '@/src/components/Button';
import { ConfirmDialog } from './ConfirmDialog';

const STATUSES = ['pending', 'contacted', 'confirmed', 'cancelled'];

export function QuotesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.get('/admin/quotes', true)); }
    catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? items : items.filter((x) => x.status === filter);
  const setStatus = async (id: string, status: string) => { await api.put(`/admin/quotes/${id}`, { status }, true); await load(); };
  const del = async (id: string) => { await api.del(`/admin/quotes/${id}`, true); setConfirmId(null); await load(); };

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={s.title}>Quotes</Text>
        <Text style={s.subtitle}>{items.length} total quote requests</Text>
      </View>

      <View style={s.filters}>
        {['all', ...STATUSES].map((st) => (
          <TouchableOpacity key={st} onPress={() => setFilter(st)} style={[s.chip, filter === st && s.chipActive]}>
            <Text style={[s.chipText, filter === st && s.chipTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
        <View style={s.list}>
          {filtered.length === 0 && <Text style={s.empty}>No quotes to show.</Text>}
          {filtered.map((q) => {
            const isOpen = expanded === q.id;
            return (
              <View key={q.id} style={s.card}>
                <TouchableOpacity onPress={() => setExpanded(isOpen ? null : q.id)} style={s.cardTap}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={s.name}>{q.user_name}</Text>
                      <StatusBadge status={q.status} />
                    </View>
                    <Text style={s.meta}>{q.event_type} · {q.guest_count} pax · {q.event_date || 'TBD'}</Text>
                    <Text style={s.value}>₹{q.estimated_total?.toLocaleString('en-IN')} · ₹{q.estimated_per_plate}/plate</Text>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>

                {isOpen && (
                  <View style={s.expand}>
                    <Field label="Contact" value={`${q.user_email}${q.user_phone ? ' · ' + q.user_phone : ''}`} />
                    {q.location && <Field label="Location" value={q.location} />}
                    {q.cuisines?.length > 0 && <Field label="Cuisines" value={q.cuisines.join(', ')} />}
                    {q.services?.length > 0 && <Field label="Services" value={q.services.join(', ')} />}
                    {q.live_counters?.length > 0 && <Field label="Live counters" value={q.live_counters.join(', ')} />}
                    {q.notes && <Field label="Notes" value={q.notes} />}

                    <View style={{ marginTop: 10 }}>
                      <Text style={s.lbl}>Update status</Text>
                      <View style={s.statusRow}>
                        {STATUSES.map((st) => (
                          <TouchableOpacity key={st} onPress={() => setStatus(q.id, st)} style={[s.statusBtn, q.status === st && s.statusBtnActive]}>
                            <Text style={[s.statusText, q.status === st && s.statusTextActive]}>{st}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={s.actRow}>
                      <Button label="Email" icon="mail" variant="outline" onPress={() => Linking.openURL(`mailto:${q.user_email}`)} />
                      {!!q.user_phone && <Button label="WhatsApp" icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(`https://wa.me/${q.user_phone.replace(/\D/g, '')}`)} />}
                      <Button label="Delete" icon="trash" variant="ghost" onPress={() => setConfirmId(q.id)} />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {confirmId && <ConfirmDialog title="Delete quote?" message="This action cannot be undone." onCancel={() => setConfirmId(null)} onConfirm={() => del(confirmId)} />}
    </View>
  );
}

function Field({ label, value }: any) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={s.lbl}>{label}</Text>
      <Text style={s.fieldVal}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: any) {
  const map: Record<string, string> = { pending: theme.colors.danger, contacted: theme.colors.primary, confirmed: theme.colors.success, cancelled: theme.colors.textMuted };
  const c = map[status] || theme.colors.textMuted;
  return <View style={[s.badge, { borderColor: c }]}><Text style={[s.badgeText, { color: c }]}>{status.toUpperCase()}</Text></View>;
}

const s = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: theme.colors.textMuted, fontSize: 13 },
  filters: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: theme.colors.bg },
  list: { gap: 10 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', padding: 20 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  cardTap: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  name: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: theme.colors.textMuted, fontSize: 12 },
  value: { color: theme.colors.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  expand: { padding: 14, paddingTop: 0, gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border },
  lbl: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  fieldVal: { color: theme.colors.text, fontSize: 13, opacity: 0.9 },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  statusBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  statusText: { color: theme.colors.text, fontSize: 11, textTransform: 'capitalize', fontWeight: '600' },
  statusTextActive: { color: theme.colors.bg },
  actRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
});
