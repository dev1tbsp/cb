import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';

const CARDS: { key: string; label: string; icon: string; color: string; nav?: string }[] = [
  { key: 'total_quotes', label: 'Total Quotes', icon: 'document-text', color: '#E6B04D' },
  { key: 'pending_quotes', label: 'Pending Quotes', icon: 'time', color: '#C99536', nav: 'quotes' },
  { key: 'new_inquiries', label: 'New Inquiries', icon: 'mail-unread', color: '#D1503F', nav: 'inquiries' },
  { key: 'customers', label: 'Customers', icon: 'people', color: '#4FA37A' },
  { key: 'menu_items', label: 'Menu Items', icon: 'restaurant', color: '#6A2E5E', nav: 'menu' },
  { key: 'portfolio_items', label: 'Portfolio', icon: 'images', color: '#E6B04D' },
];

export function Dashboard({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  useEffect(() => {
    (async () => {
      try { setStats(await api.get('/admin/stats', true)); }
      catch (e: any) { setErr(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 40 }} />;
  if (err) return <Text style={s.err}>{err}</Text>;

  return (
    <View style={{ gap: 24 }}>
      <View style={s.head}>
        <Text style={s.title}>Dashboard</Text>
        <Text style={s.subtitle}>Operational overview</Text>
      </View>

      <View style={[s.grid, isWide && s.gridWide]}>
        {CARDS.map((c) => (
          <TouchableOpacity
            key={c.key}
            disabled={!c.nav}
            onPress={() => c.nav && onNavigate?.(c.nav)}
            style={[s.card, isWide && s.cardWide]}
          >
            <View style={[s.icon, { backgroundColor: `${c.color}22` }]}>
              <Ionicons name={c.icon as any} size={20} color={c.color} />
            </View>
            <Text style={s.value}>{stats?.[c.key] ?? 0}</Text>
            <Text style={s.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.pipelineCard}>
        <View>
          <Text style={s.pipelineLabel}>Pipeline value</Text>
          <Text style={s.pipelineValue}>₹{(stats?.total_pipeline_value || 0).toLocaleString('en-IN')}</Text>
        </View>
        <Ionicons name="trending-up" size={36} color={theme.colors.success} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  head: { gap: 4 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: theme.colors.textMuted, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { gap: 16 },
  card: { width: '48%', backgroundColor: theme.colors.surface, padding: 18, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, gap: 8 },
  cardWide: { width: '31.5%' },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  value: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  label: { color: theme.colors.textMuted, fontSize: 12, letterSpacing: 0.5 },
  pipelineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22, borderRadius: 6, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  pipelineLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  pipelineValue: { color: theme.colors.text, fontSize: 30, fontWeight: '700', marginTop: 4 },
  err: { color: theme.colors.danger, padding: 20 },
});
