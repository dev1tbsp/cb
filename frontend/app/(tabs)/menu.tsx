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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme } from '@/src/theme';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  spice_level: number;
  is_jain: boolean;
  is_live_counter: boolean;
  image?: string;
}

const CATEGORIES = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Chaat',
  'Snacks',
  'Desserts',
  'Mocktails',
  'Kids Menu',
  'Jain Menu',
];

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('North Indian');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<MenuItem[]>('/menu', { auth: false });
        setItems(data);
      } catch (e) {
        console.warn('menu load', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => items.filter((i) => i.category === activeCat), [items, activeCat]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.label}>Explore our</Text>
        <Text style={styles.title}>Menus</Text>
        <Text style={styles.sub}>Per plate pricing · 10+ cuisines · Veg only</Text>
      </View>

      {/* Category tabs */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        renderItem={({ item }) => {
          const active = item === activeCat;
          return (
            <TouchableOpacity
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveCat(item)}
              testID={`menu-cat-${item.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.length === 0 && (
            <Text style={styles.empty}>No dishes in this category yet.</Text>
          )}
          {filtered.map((dish) => (
            <View key={dish.id} style={styles.card} testID={`menu-item-${dish.id}`}>
              {dish.image && <Image source={{ uri: dish.image }} style={styles.cardImg} />}
              <View style={styles.cardBody}>
                <View style={styles.cardHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{dish.name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{dish.description}</Text>
                  </View>
                  <Text style={styles.price}>₹{dish.price_min}-{dish.price_max}</Text>
                </View>
                <View style={styles.badges}>
                  <View style={styles.vegBadge}>
                    <View style={styles.vegDot} />
                    <Text style={styles.vegText}>VEG</Text>
                  </View>
                  {dish.is_jain && (
                    <View style={styles.jainBadge}>
                      <Text style={styles.jainText}>JAIN</Text>
                    </View>
                  )}
                  {dish.spice_level > 0 && (
                    <View style={styles.spiceBadge}>
                      {Array.from({ length: dish.spice_level }).map((_, i) => (
                        <Ionicons key={i} name="flame" size={11} color={theme.colors.danger} />
                      ))}
                    </View>
                  )}
                  {dish.is_live_counter && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveText}>✦ LIVE COUNTER</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 24, gap: 4 },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  tabBar: { paddingHorizontal: 24, gap: 8, paddingBottom: 12 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  tabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  tabTextActive: { color: theme.colors.background, fontWeight: '700' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 24, paddingTop: 8, gap: 12, paddingBottom: 40 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row', backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 4, overflow: 'hidden',
  },
  cardImg: { width: 100, height: 'auto' as any, minHeight: 110 },
  cardBody: { flex: 1, padding: 14, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  cardDesc: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  price: { color: theme.colors.primary, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  vegBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: theme.colors.success, paddingHorizontal: 6, paddingVertical: 3,
  },
  vegDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.colors.success },
  vegText: { color: theme.colors.success, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  jainBadge: { borderWidth: 1, borderColor: '#A78BFA', paddingHorizontal: 6, paddingVertical: 3 },
  jainText: { color: '#A78BFA', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  spiceBadge: { flexDirection: 'row', gap: 1, paddingHorizontal: 4, paddingVertical: 2 },
  liveBadge: { backgroundColor: 'rgba(230,176,77,0.15)', paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.primary },
  liveText: { color: theme.colors.primary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
});
