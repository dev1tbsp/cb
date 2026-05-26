import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageShell } from '@/src/components/PageShell';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { useSeo } from '@/src/hooks/useSeo';

export default function MenuPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 880;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('All');

  useSeo({
    title: 'Menu — Cosmic Bites Catering',
    description: 'Explore our pure-vegetarian catering menu — North Indian, South Indian, Chinese, Italian, Chaat, Desserts and more. 10+ cuisines.',
  });

  useEffect(() => {
    (async () => {
      try { setItems(await api.get('/menu')); } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = active === 'All' ? items : items.filter((i) => i.category === active);

  return (
    <PageShell>
      <View style={[s.hero, isWide && { paddingVertical: 80, paddingHorizontal: 56 }]}>
        <Text style={s.eyebrow}>Our Kitchen</Text>
        <Text style={[s.title, isWide && { fontSize: 48 }]}>The Menu</Text>
        <Text style={s.sub}>10+ cuisines crafted by our chefs. Mix and match across categories for your event. All items are 100% pure vegetarian and can be customised as Jain on request.</Text>
      </View>

      {/* Filters */}
      <View style={[s.filters, isWide && { paddingHorizontal: 56 }]}>
        {categories.map((c) => (
          <TouchableOpacity key={c} onPress={() => setActive(c)} style={[s.chip, active === c && s.chipActive]} testID={`menu-cat-${c}`}>
            <Text style={[s.chipText, active === c && s.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 40 }} />
      ) : (
        <View style={[s.grid, isWide && { paddingHorizontal: 56 }]}>
          {filtered.map((it) => (
            <View key={it.id} style={[s.card, isWide && { width: '31.5%' }]} testID={`menu-item-${it.id}`}>
              {it.image && <Image source={{ uri: it.image }} style={s.img} />}
              <View style={s.body}>
                <View style={s.cardHead}>
                  <Text style={s.name}>{it.name}</Text>
                  <Text style={s.price}>₹{it.price_min}-{it.price_max}</Text>
                </View>
                <Text style={s.cat}>{it.category}</Text>
                <Text style={s.desc}>{it.description}</Text>
                <View style={s.badges}>
                  {it.is_jain && <Badge icon="leaf" label="Jain" />}
                  {it.is_live_counter && <Badge icon="flame" label="Live Counter" />}
                  {it.spice_level > 0 && (
                    <View style={s.spice}>
                      {Array.from({ length: it.spice_level }).map((_, i) => (
                        <Ionicons key={i} name="flame" size={10} color={theme.colors.danger} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </PageShell>
  );
}

function Badge({ icon, label }: any) {
  return (
    <View style={s.badge}>
      <Ionicons name={icon} size={10} color={theme.colors.primary} />
      <Text style={s.badgeText}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingVertical: 48, gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 23, maxWidth: 700, marginTop: 8 },

  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24, marginBottom: 24 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: theme.colors.bg },

  grid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  img: { width: '100%', height: 160 },
  body: { padding: 14, gap: 6 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  price: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  cat: { color: theme.colors.textMuted, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  desc: { color: theme.colors.text, opacity: 0.85, fontSize: 13, lineHeight: 19, marginTop: 4 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 3, backgroundColor: 'rgba(230,176,77,0.15)' },
  badgeText: { color: theme.colors.primary, fontSize: 10, fontWeight: '700' },
  spice: { flexDirection: 'row', gap: 1, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 3, backgroundColor: 'rgba(209,80,63,0.15)' },
});
