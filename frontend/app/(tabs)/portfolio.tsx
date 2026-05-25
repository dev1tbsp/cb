import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/src/api/client';
import { theme } from '@/src/theme';

const { width } = Dimensions.get('window');

interface PortfolioItem {
  id: string;
  title: string;
  event_type: string;
  guest_count: number;
  cuisine: string;
  image: string;
  description: string;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'pre_wedding', label: 'Pre-Wedding' },
  { id: 'housewarming', label: 'Housewarming' },
  { id: 'festive', label: 'Festive' },
];

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<PortfolioItem[]>('/portfolio', { auth: false });
        setItems(data);
      } catch (e) {
        console.warn('portfolio load', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.event_type === filter)),
    [items, filter]
  );

  if (selected) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView>
          <Image source={{ uri: selected.image }} style={styles.detailImg} />
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)} testID="case-close">
            <Text style={styles.closeText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.detailBody}>
            <Text style={styles.detailLabel}>{selected.event_type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.detailTitle}>{selected.title}</Text>
            <View style={styles.detailMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Guests</Text>
                <Text style={styles.metaValue}>{selected.guest_count}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Cuisine</Text>
                <Text style={styles.metaValue}>{selected.cuisine}</Text>
              </View>
            </View>
            <Text style={styles.detailDesc}>{selected.description}</Text>
            <View style={styles.caseStudy}>
              <Text style={styles.caseLabel}>Case Study</Text>
              <Text style={styles.caseText}>
                A bespoke {selected.event_type.replace('_', ' ')} catering experience for {selected.guest_count} guests
                featuring our signature {selected.cuisine} spread. Live counters, full-service staff and elegant decor
                made the event unforgettable.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.label}>Our work</Text>
        <Text style={styles.title}>Portfolio</Text>
        <Text style={styles.sub}>Real events. Real plates. Real moments.</Text>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
        renderItem={({ item }) => {
          const active = filter === item.id;
          return (
            <TouchableOpacity
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(item.id)}
              testID={`port-filter-${item.id}`}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filtered.map((item, idx) => {
            // Bento sizing — make some tiles larger
            const isLarge = idx % 5 === 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.tile, isLarge && styles.tileLarge]}
                onPress={() => setSelected(item)}
                testID={`port-tile-${item.id}`}
              >
                <Image source={{ uri: item.image }} style={styles.tileImg} />
                <View style={styles.tileOverlay} />
                <View style={styles.tileContent}>
                  <Text style={styles.tileMeta}>{item.guest_count} PAX · {item.cuisine.toUpperCase()}</Text>
                  <Text style={styles.tileTitle} numberOfLines={2}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const TILE_W = (width - 24 * 2 - 12) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 24, gap: 4 },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  filterBar: { paddingHorizontal: 24, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: theme.colors.background, fontWeight: '700' },
  grid: { padding: 24, paddingTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: TILE_W, height: 180, borderRadius: 4, overflow: 'hidden' },
  tileLarge: { width: '100%', height: 240 },
  tileImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,21,17,0.55)',
  },
  tileContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12,
  },
  tileMeta: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, fontWeight: '700' },
  tileTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700', marginTop: 4 },

  detailImg: { width: '100%', height: 300 },
  closeBtn: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(11,21,17,0.7)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4 },
  closeText: { color: theme.colors.text, fontWeight: '600' },
  detailBody: { padding: 24, gap: 14 },
  detailLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  detailTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  detailMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { backgroundColor: theme.colors.surface, padding: 12, borderRadius: 4, flex: 1, borderWidth: 1, borderColor: theme.colors.border },
  metaLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  metaValue: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  detailDesc: { color: theme.colors.text, fontSize: 14, lineHeight: 22, opacity: 0.85 },
  caseStudy: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4, marginTop: 8, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  caseLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700', marginBottom: 6 },
  caseText: { color: theme.colors.text, fontSize: 13, lineHeight: 20, opacity: 0.85 },
});
