import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageShell } from '@/src/components/PageShell';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { useSeo } from '@/src/hooks/useSeo';

export default function PackagesPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 880;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Catering Packages — Cosmic Bites',
    description: 'Browse our catering packages for birthdays, corporate, pre-wedding, festive and live-counter events. Starting from ₹199/plate.',
  });

  useEffect(() => {
    (async () => {
      try { setItems(await api.get('/services')); } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, []);

  return (
    <PageShell>
      <View style={[s.hero, isWide && { paddingVertical: 80, paddingHorizontal: 56 }]}>
        <Text style={s.eyebrow}>Catering Packages</Text>
        <Text style={[s.title, isWide && { fontSize: 48 }]}>Crafted for every event</Text>
        <Text style={s.sub}>From intimate house parties to grand corporate events — each package is fully customisable to your guest count, cuisine preferences and theme.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 40 }} />
      ) : (
        <View style={[s.grid, isWide && { paddingHorizontal: 56 }]}>
          {items.map((p) => (
            <View key={p.id} style={[s.card, isWide && { width: '48.5%' }]} testID={`package-${p.id}`}>
              {p.image && (
                <ImageBackground source={{ uri: p.image }} style={s.img} imageStyle={{ borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                  <View style={s.imgOverlay} />
                  <View style={s.imgContent}>
                    <View style={s.priceBadge}><Text style={s.priceBadgeText}>From ₹{p.starting_price}/plate</Text></View>
                  </View>
                </ImageBackground>
              )}
              <View style={s.body}>
                <View style={s.titleRow}>
                  <View style={s.iconCircle}><Ionicons name={(p.icon || 'restaurant') as any} size={18} color={theme.colors.primary} /></View>
                  <Text style={s.cardTitle}>{p.title}</Text>
                </View>
                <Text style={s.cardDesc}>{p.description}</Text>
                {!!(p.features?.length) && (
                  <View style={s.features}>
                    {p.features.map((f: string, i: number) => (
                      <View key={i} style={s.featureRow}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                        <Text style={s.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={s.footer}>
                  <Button label="Get a Quote" onPress={() => router.push('/contact')} icon="flash" />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[s.ctaBand, isWide && { padding: 56 }]}>
        <Text style={s.ctaLabel}>Custom requirements?</Text>
        <Text style={s.ctaTitle}>Let's design a bespoke menu for you</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button label="Contact Us" icon="mail" onPress={() => router.push('/contact')} />
          <Button label="View Menu" icon="restaurant" variant="outline" onPress={() => router.push('/menu')} />
        </View>
      </View>
    </PageShell>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingVertical: 48, gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 23, maxWidth: 700, marginTop: 8 },

  grid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  card: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  img: { height: 180, justifyContent: 'flex-end' },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.35)' },
  imgContent: { padding: 14, alignItems: 'flex-start' },
  priceBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  priceBadgeText: { color: theme.colors.bg, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  body: { padding: 18, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: theme.colors.text, fontSize: 19, fontWeight: '700', flex: 1 },
  cardDesc: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 21 },
  features: { gap: 8, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: theme.colors.text, fontSize: 13, opacity: 0.9 },
  footer: { marginTop: 8, flexDirection: 'row', gap: 10 },

  ctaBand: { backgroundColor: theme.colors.surface, padding: 32, alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginTop: 40 },
  ctaLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700', textTransform: 'uppercase' },
  ctaTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
});
