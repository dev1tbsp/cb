import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { ConfirmDialog } from './ConfirmDialog';

type Inquiry = { id: string; name: string; email: string; phone?: string; subject?: string; message: string; status: string; reply?: string; created_at: string };

const STATUSES = ['new', 'replied', 'resolved'];

export function InquiriesPanel() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.get('/admin/inquiries', true)); }
    catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? items : items.filter((x) => x.status === filter);

  const updateStatus = async (id: string, status: string, replyText?: string) => {
    await api.put(`/admin/inquiries/${id}`, { status, reply: replyText }, true);
    setReply(''); setExpanded(null);
    await load();
  };

  const del = async (id: string) => { await api.del(`/admin/inquiries/${id}`, true); setConfirmId(null); await load(); };

  return (
    <View style={{ gap: 16 }}>
      <View style={s.head}>
        <View>
          <Text style={s.title}>Inquiries</Text>
          <Text style={s.subtitle}>{items.length} total · {items.filter((x) => x.status === 'new').length} new</Text>
        </View>
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
          {filtered.length === 0 && <Text style={s.empty}>No inquiries to show.</Text>}
          {filtered.map((inq) => {
            const isOpen = expanded === inq.id;
            return (
              <View key={inq.id} style={s.card} testID={`inq-row-${inq.id}`}>
                <TouchableOpacity onPress={() => { setExpanded(isOpen ? null : inq.id); setReply(inq.reply || ''); }} style={s.cardTap}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={s.name}>{inq.name}</Text>
                      <StatusBadge status={inq.status} />
                    </View>
                    <Text style={s.meta}>{inq.email}{inq.phone ? ` · ${inq.phone}` : ''} · {fmtDate(inq.created_at)}</Text>
                    {inq.subject && <Text style={s.subj}>{inq.subject}</Text>}
                    <Text style={s.msg} numberOfLines={isOpen ? undefined : 2}>{inq.message}</Text>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>

                {isOpen && (
                  <View style={s.expand}>
                    <Input label="Internal Reply / Notes" value={reply} onChangeText={setReply} placeholder="Note your follow-up here..." multiline numberOfLines={3} style={{ minHeight: 70, textAlignVertical: 'top' }} />
                    <View style={s.actRow}>
                      <Button label="Mark Replied" icon="checkmark" onPress={() => updateStatus(inq.id, 'replied', reply)} />
                      <Button label="Resolve" icon="checkmark-done" variant="outline" onPress={() => updateStatus(inq.id, 'resolved', reply)} />
                    </View>
                    <View style={s.actRow}>
                      <Button label="Email" icon="mail" variant="outline" onPress={() => Linking.openURL(`mailto:${inq.email}`)} />
                      {!!inq.phone && <Button label="WhatsApp" icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(`https://wa.me/${inq.phone?.replace(/\D/g, '')}`)} />}
                      <Button label="Delete" icon="trash" variant="ghost" onPress={() => setConfirmId(inq.id)} />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {confirmId && <ConfirmDialog title="Delete inquiry?" message="This action cannot be undone." onCancel={() => setConfirmId(null)} onConfirm={() => del(confirmId)} />}
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { new: theme.colors.danger, replied: theme.colors.primary, resolved: theme.colors.success };
  const c = colors[status] || theme.colors.textMuted;
  return (
    <View style={[s.badge, { borderColor: c }]}>
      <Text style={[s.badgeText, { color: c }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

function fmtDate(iso: string) { try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; } }

const s = StyleSheet.create({
  head: { gap: 4 },
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
  meta: { color: theme.colors.textMuted, fontSize: 11 },
  subj: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  msg: { color: theme.colors.text, fontSize: 13, lineHeight: 19, marginTop: 4, opacity: 0.9 },
  expand: { padding: 14, paddingTop: 0, gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
});
