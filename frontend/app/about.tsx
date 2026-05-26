import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageShell } from '@/src/components/PageShell';
import { theme } from '@/src/theme';
import { useSeo } from '@/src/hooks/useSeo';

const HERO = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/c2969cd9807f501ea73d9328149a8bdd4d3e6d697e5b1f97d5d079a1e3b0944b.png';

const VALUES = [
  { icon: 'leaf', title: 'Pure Vegetarian', desc: 'Our kitchens have never served non-vegetarian food. Trusted by Jain & Hindu families across India.' },
  { icon: 'sparkles', title: 'Hygiene First', desc: 'FSSAI compliant, ISO-audited kitchens. Daily temperature logs, staff health screenings, sealed transport.' },
  { icon: 'restaurant', title: 'Fresh Ingredients', desc: 'Sourced daily from trusted vendors. No frozen produce, no shortcuts — just authentic flavours.' },
  { icon: 'people', title: 'Multi-Event Mastery', desc: 'From a 20-pax birthday to a 500-pax corporate gala, our team scales seamlessly with you.' },
];

const MILESTONES = [
  { year: '2014', event: 'Cosmic Bites founded in Mumbai with a single ambition — elevate pure-vegetarian catering.' },
  { year: '2016', event: 'First corporate client: Kotak. Daily lunch service kicks off.' },
  { year: '2019', event: 'Expanded to live-counter catering. Pasta, dosa & tandoor stations debut.' },
  { year: '2022', event: 'Crossed 500 events. Partnered with Barclays and Network18.' },
  { year: '2024', event: 'Launched our digital quote builder and admin console.' },
];

export default function AboutPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 880;

  useSeo({
    title: 'About Us — Cosmic Bites Catering',
    description: 'Founded in 2014, Cosmic Bites is a premium pure-vegetarian catering brand trusted by Kotak, Barclays, Network18 and 500+ events.',
  });

  return (
    <PageShell>
      {/* Hero */}
      <View style={[s.hero, isWide && s.heroWide]}>
        <View style={[s.heroText, isWide && { flex: 1, paddingRight: 32 }]}>
          <Text style={s.eyebrow}>Our Story</Text>
          <Text style={[s.title, isWide && { fontSize: 48 }]}>A decade of pure-veg craft</Text>
          <Text style={s.body}>Cosmic Bites began in 2014 as a passion project — two friends from Mumbai who believed that vegetarian food deserved to be the highlight of every celebration, not an afterthought.</Text>
          <Text style={s.body}>Today, we cater 500+ events a year across birthdays, corporate galas, pre-wedding functions, festive feasts and intimate house parties. We've earned the trust of brands like Kotak, Barclays and Network18 — and more importantly, of hundreds of families who keep coming back.</Text>
        </View>
        <Image source={{ uri: HERO }} style={[s.heroImg, isWide && { flex: 1, height: 480 }]} />
      </View>

      {/* Values */}
      <View style={[s.section, isWide && { paddingHorizontal: 56 }]}>
        <Text style={s.sectionEyebrow}>What we stand for</Text>
        <Text style={[s.sectionTitle, isWide && { fontSize: 36 }]}>Our promise to you</Text>
        <View style={[s.valuesGrid, isWide && s.valuesGridWide]}>
          {VALUES.map((v) => (
            <View key={v.title} style={[s.valueCard, isWide && { width: '48%' }]}>
              <View style={s.valueIcon}><Ionicons name={v.icon as any} size={20} color={theme.colors.primary} /></View>
              <Text style={s.valueTitle}>{v.title}</Text>
              <Text style={s.valueDesc}>{v.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Milestones */}
      <View style={[s.section, isWide && { paddingHorizontal: 56 }]}>
        <Text style={s.sectionEyebrow}>Our journey</Text>
        <Text style={[s.sectionTitle, isWide && { fontSize: 36 }]}>Milestones</Text>
        <View style={s.timeline}>
          {MILESTONES.map((m, i) => (
            <View key={m.year} style={s.mileRow}>
              <View style={s.mileLeft}>
                <View style={s.dot} />
                {i < MILESTONES.length - 1 && <View style={s.line} />}
              </View>
              <View style={s.mileBody}>
                <Text style={s.mileYear}>{m.year}</Text>
                <Text style={s.mileText}>{m.event}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={[s.statsBand, isWide && { padding: 56, flexDirection: 'row' }]}>
        <Stat value="500+" label="Events catered" />
        <Stat value="100%" label="Pure vegetarian" />
        <Stat value="10+" label="Cuisines mastered" />
        <Stat value="10y" label="Of catering craft" />
      </View>
    </PageShell>
  );
}

function Stat({ value, label }: any) {
  return (
    <View style={s.statBox}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { padding: 24, paddingTop: 48, gap: 24 },
  heroWide: { flexDirection: 'row', padding: 56, paddingTop: 80, alignItems: 'center' },
  heroText: { gap: 14 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700' },
  body: { color: theme.colors.text, fontSize: 15, lineHeight: 24, opacity: 0.9 },
  heroImg: { width: '100%', height: 280, borderRadius: 6 },

  section: { padding: 24, gap: 16, paddingVertical: 48 },
  sectionEyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  sectionTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },

  valuesGrid: { gap: 14, marginTop: 12 },
  valuesGridWide: { flexDirection: 'row', flexWrap: 'wrap', gap: '4%' as any },
  valueCard: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, gap: 10, marginBottom: 14 },
  valueIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  valueTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  valueDesc: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 21 },

  timeline: { marginTop: 12 },
  mileRow: { flexDirection: 'row', gap: 16, minHeight: 80 },
  mileLeft: { alignItems: 'center', width: 24 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.primary, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: theme.colors.border, marginTop: 6 },
  mileBody: { flex: 1, paddingBottom: 18, gap: 4 },
  mileYear: { color: theme.colors.primary, fontSize: 18, fontWeight: '700' },
  mileText: { color: theme.colors.text, fontSize: 14, lineHeight: 21, opacity: 0.9 },

  statsBand: { backgroundColor: theme.colors.surface, padding: 24, gap: 24, borderTopWidth: 1, borderTopColor: theme.colors.border, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginTop: 24 },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { color: theme.colors.primary, fontSize: 36, fontWeight: '700' },
  statLbl: { color: theme.colors.textMuted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
});
