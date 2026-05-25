import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminApi } from '@/src/api/admin';
import { useAuth } from '@/src/context/AuthContext';
import { theme } from '@/src/theme';

interface Stats {
  total_quotes: number;
  pending_quotes: number;
  customers: number;
  menu_items: number;
  portfolio_items: number;
  new_inquiries: number;
  total_pipeline_value: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await adminApi.stats();
        setStats(s);
      } catch (e) {
        console.warn('stats', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <View>
          <Text style={styles.label}>Welcome back</Text>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.sub}>Signed in as {user?.email}</Text>
        </View>
        <View style={styles.headActions}>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.smallBtn} testID="dash-open-app">
            <Ionicons name="open-outline" size={14} color={theme.colors.text} />
            <Text style={styles.smallBtnText}>Open App</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={doLogout} style={[styles.smallBtn, { borderColor: theme.colors.danger }]} testID="dash-logout">
            <Text style={[styles.smallBtnText, { color: theme.colors.danger }]}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading || !stats ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard icon="receipt" label="Total Quotes" value={stats.total_quotes} accent={false} testID="stat-total-quotes" />
            <StatCard icon="hourglass" label="Pending" value={stats.pending_quotes} accent testID="stat-pending" />
            <StatCard icon="people" label="Customers" value={stats.customers} testID="stat-customers" />
            <StatCard icon="mail" label="New Queries" value={stats.new_inquiries} accent={stats.new_inquiries > 0} testID="stat-queries" />
            <StatCard icon="restaurant" label="Menu Items" value={stats.menu_items} testID="stat-menu" />
            <StatCard icon="images" label="Portfolio" value={stats.portfolio_items} testID="stat-portfolio" />
          </View>

          <View style={styles.pipelineCard}>
            <Text style={styles.pipelineLabel}>Total Pipeline Value</Text>
            <Text style={styles.pipelineValue}>
              ₹{stats.total_pipeline_value.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.pipelineSub}>Across {stats.total_quotes} submitted quote{stats.total_quotes !== 1 ? 's' : ''}</Text>
          </View>

          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard label="View Quotes" icon="receipt" onPress={() => router.push('/admin/quotes')} />
            <ActionCard label="Reply to Queries" icon="chatbubble-ellipses" onPress={() => router.push('/admin/inquiries')} />
            <ActionCard label="Add Menu Item" icon="add-circle" onPress={() => router.push('/admin/menu')} />
            <ActionCard label="Add Portfolio" icon="images" onPress={() => router.push('/admin/portfolio')} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, accent, testID }: any) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]} testID={testID}>
      <View style={[styles.statIcon, accent && styles.statIconAccent]}>
        <Ionicons name={icon} size={18} color={accent ? theme.colors.background : theme.colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ label, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Text style={styles.actionText}>{label}</Text>
      <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 32, gap: 24, maxWidth: 1200, alignSelf: 'stretch' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 4 },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  headActions: { flexDirection: 'row', gap: 8 },
  smallBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: theme.colors.border,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4,
  },
  smallBtnText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  statCard: {
    backgroundColor: theme.colors.surface, padding: 18, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border, minWidth: 170, flex: 1, gap: 12,
  },
  statCardAccent: { borderColor: theme.colors.primary },
  statIcon: {
    width: 36, height: 36, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(230,176,77,0.15)',
  },
  statIconAccent: { backgroundColor: theme.colors.primary },
  statValue: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  statLabel: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },

  pipelineCard: {
    backgroundColor: theme.colors.surface, padding: 24, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.primary, gap: 6,
  },
  pipelineLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  pipelineValue: { color: theme.colors.text, fontSize: 40, fontWeight: '700' },
  pipelineSub: { color: theme.colors.textMuted, fontSize: 13 },

  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border, flex: 1, minWidth: 220,
  },
  actionText: { color: theme.colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
});
