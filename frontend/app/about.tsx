import { View, Text, ScrollView, StyleSheet, Image, useWindowDimensions, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, BUSINESS } from '@/src/theme';
import { useSeo } from '@/src/hooks/use-seo';
import { SiteHeader, SiteFooter } from '@/src/components/SiteShell';

const HERO_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/c2969cd9807f501ea73d9328149a8bdd4d3e6d697e5b1f97d5d079a1e3b0944b.png';

const VALUES = [
  { icon: 'leaf', title: 'Pure Vegetarian', desc: '100% vegetarian — always. No exceptions, no compromises.' },
  { icon: 'sparkles', title: 'Hygiene First', desc: 'FSSAI-licensed kitchens, audited regularly, on-site sanitation.' },
  { icon: 'flame', title: 'Fresh Ingredients', desc: 'Sourced daily from trusted local vendors and prepped on-site.' },
  { icon: 'people', title: 'Multi-Event Mastery', desc: 'From intimate 20-pax dinners to 500-pax wedding spreads.' },
];

const MILESTONES = [
  { year: '2018', text: 'Cosmic Bites founded as a boutique caterer for house parties.' },
  { year: '2019', text: 'First corporate client onboarded; expanded to live counters.' },
  { year: '2021', text: 'Crossed 100 events catered; introduced festive packages.' },
  { year: '2023', text: 'Trusted partner for Kotak, Barclays, Network18 daily catering.' },
  { year: '2025', text: 'Launched mobile app for instant quotes and reorders.' },
];

export default function AboutPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  useSeo({
    title: 'About Cosmic Bites — Pure Vegetarian Catering Story',
    description:
      'Cosmic Bites is a premium pure-vegetarian catering brand serving birthdays, corporate, weddings and festive events. Hygienic, fresh, multi-cuisine.',
  });

  return (
    <ScrollView style={styles.page}>
      <SiteHeader />

      <View style={[styles.head, isWide && { paddingHorizontal: 48 }]}>
        <Text style={styles.eyebrow}>About us</Text>
        <Text style={[styles.title, isWide && { fontSize: 56 }]}>The story of Cosmic Bites</Text>
        <Text style={styles.lede}>
          We exist to prove that vegetarian food can be the most celebrated part of any event.
          Every dish is crafted with respect, every plate served with care.
        </Text>
      </View>

      <Image source={{ uri: HERO_IMG }} style={[styles.cover, isWide && styles.coverWide]} />

      <View style={[styles.section, isWide && styles.sectionWide]}>
        <Text style={styles.h2}>Our promise</Text>
        <Text style={styles.body}>
          Cosmic Bites was born in 2018 with a singular mission — to make pure-vegetarian catering
          feel premium, joyful and unmistakably ours. From small house parties to 500-guest galas,
          we treat every event as if it were our own celebration. Our chefs craft menus drawn from
          ten cuisines including North Indian, South Indian, Italian, Chinese, Chaat, Snacks,
          Desserts, Mocktails, Kids and Jain — all 100% vegetarian.
        </Text>
      </View>

      <View style={[styles.values, isWide && styles.valuesWide]}>
        {VALUES.map((v) => (
          <View key={v.title} style={[styles.valueCard, isWide && { flex: 1 }]}>
            <View style={styles.valueIcon}>
              <Ionicons name={v.icon as any} size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.valueTitle}>{v.title}</Text>
            <Text style={styles.valueDesc}>{v.desc}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, isWide && styles.sectionWide]}>
        <Text style={styles.h2}>Milestones</Text>
        <View style={styles.timeline}>
          {MILESTONES.map((m) => (
            <View key={m.year} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineYear}>{m.year}</Text>
              <Text style={styles.timelineText}>{m.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.ctaBlock, isWide && { padding: 48 }]}>
        <Text style={styles.ctaTitle}>Ready to celebrate with us?</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <TouchableOpacity style={styles.ctaPrimary} onPress={() => router.push('/get-quote')} testID="about-cta-quote">
            <Text style={styles.ctaPrimaryText}>Get Instant Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaSecondary} onPress={() => Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`)} testID="about-cta-whatsapp">
            <Ionicons name="logo-whatsapp" size={16} color={theme.colors.primary} />
            <Text style={styles.ctaSecondaryText}>WhatsApp Us</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SiteFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  head: { padding: 24, paddingTop: 48, gap: 10 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700', lineHeight: 42 },
  lede: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 24, maxWidth: 720 },
  cover: { width: '100%', height: 280 },
  coverWide: { height: 480 },
  section: { padding: 24, paddingVertical: 36, gap: 14 },
  sectionWide: { paddingHorizontal: 48, paddingVertical: 56 },
  h2: { color: theme.colors.text, fontSize: 26, fontWeight: '700' },
  body: { color: theme.colors.text, fontSize: 15, lineHeight: 25, opacity: 0.88 },
  values: { padding: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  valuesWide: { paddingHorizontal: 48, gap: 18 },
  valueCard: { width: '100%', backgroundColor: theme.colors.surface, padding: 20, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, gap: 10 },
  valueIcon: { width: 44, height: 44, borderRadius: 4, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  valueTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  valueDesc: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 20 },
  timeline: { gap: 16, marginTop: 12 },
  timelineItem: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary, marginTop: 8 },
  timelineYear: { color: theme.colors.primary, fontWeight: '700', fontSize: 14, width: 50 },
  timelineText: { color: theme.colors.text, fontSize: 14, flex: 1, lineHeight: 21 },
  ctaBlock: { backgroundColor: theme.colors.surface, padding: 32, alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  ctaTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  ctaPrimary: { backgroundColor: theme.colors.primary, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 4 },
  ctaPrimaryText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
  ctaSecondary: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 4 },
  ctaSecondaryText: { color: theme.colors.primary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
});
