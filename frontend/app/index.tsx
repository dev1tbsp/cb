import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, useWindowDimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageShell } from '@/src/components/PageShell';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/theme';
import { api } from '@/src/api';
import { useSeo } from '@/src/hooks/useSeo';

const HERO_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/0bec547c94a8a1c6b5cc1c49d641ea25b1b5d44d4c0b0d4340bcb5f081bf8a1d.png';
const SIGNATURE_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/c2969cd9807f501ea73d9328149a8bdd4d3e6d697e5b1f97d5d079a1e3b0944b.png';

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [services, setServices] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [testi, setTesti] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useSeo({
    title: 'Cosmic Bites — Pure Vegetarian Catering for Every Celebration',
    description: 'Premium pure-vegetarian catering. Birthdays, corporate, pre-wedding, festive events. Live counters, 10+ cuisines, 20–500 guests.',
  });

  useEffect(() => {
    (async () => {
      try {
        const [s, m, t, c, cl] = await Promise.all([
          api.get('/services'),
          api.get('/menu'),
          api.get('/testimonials'),
          api.get('/event-categories'),
          api.get('/corporate-clients'),
        ]);
        setServices(s); setMenu(m); setTesti(t); setCats(c); setClients(cl);
      } catch (e) { console.warn(e); }
    })();
  }, []);

  const featured = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Chaat', 'Desserts']
    .map((c) => menu.find((d) => d.category === c)).filter(Boolean);

  return (
    <PageShell>
      {/* HERO */}
      <ImageBackground source={{ uri: HERO_IMG }} style={[s.hero, isWide && { height: 680 }]}>
        <View style={s.heroOverlay} />
        <View style={[s.heroInner, isWide && { paddingHorizontal: 64, maxWidth: 800 }]}>
          <Text style={s.eyebrow}>✰ Pure Vegetarian · Since 2014</Text>
          <Text style={[s.heroTitle, isWide && { fontSize: 64, lineHeight: 72 }]}>Crafted Feasts.{'\n'}Memorable Moments.</Text>
          <Text style={s.heroSub}>From intimate house parties of 20 to corporate galas of 500 — Cosmic Bites delivers elegant, hygienic, pure-vegetarian catering across every Indian celebration.</Text>
          <View style={s.heroCtas}>
            <Button label="Get a Quote" icon="flash" onPress={() => router.push('/contact')} testID="hero-cta-quote" />
            <Button label="View Menu" icon="restaurant" variant="outline" onPress={() => router.push('/menu')} testID="hero-cta-menu" />
          </View>
          <View style={s.heroStats}>
            <Stat label="Events catered" value="500+" />
            <Stat label="Pure veg" value="100%" />
            <Stat label="Guest range" value="20-500" />
          </View>
        </View>
      </ImageBackground>

      {/* TRUST */}
      {clients.length > 0 && (
        <View style={s.trust}>
          <Text style={s.trustLabel}>Trusted by</Text>
          <View style={s.trustLogos}>
            {clients.map((c) => (
              <View key={c.id} style={s.trustLogoBox}>
                <Image source={{ uri: c.logo }} style={s.trustLogo} resizeMode="contain" />
                <Text style={s.trustName}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ABOUT TEASER */}
      <Section eyebrow="Our story" title="A celebration of pure vegetarian cuisine" isWide={isWide}>
        <View style={[s.aboutGrid, isWide && s.aboutGridWide]}>
          <View style={{ flex: 1, gap: 16 }}>
            <Text style={s.bodyText}>Cosmic Bites was born from a simple belief — that vegetarian food can be the most celebrated part of any event. We curate menus drawn from across India and the world, built on fresh ingredients, hygienic kitchens and decades of catering experience.</Text>
            <View style={s.aboutFeatures}>
              <Feature icon="leaf" title="100% Pure Vegetarian" desc="No exceptions, ever." />
              <Feature icon="sparkles" title="Hygiene-first kitchens" desc="FSSAI compliant, audited regularly." />
              <Feature icon="restaurant" title="Fresh ingredients" desc="Sourced daily, prepped on-site." />
              <Feature icon="people" title="Multi-event capability" desc="From 20-pax dinners to 500-pax weddings." />
            </View>
            <TouchableOpacity style={s.linkBtn} onPress={() => router.push('/about')}>
              <Text style={s.linkBtnText}>Read our full story</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: SIGNATURE_IMG }} style={[s.aboutImg, isWide && { width: '45%', height: 480, marginLeft: 32 }]} />
        </View>
      </Section>

      {/* EVENT CATEGORIES */}
      {cats.length > 0 && (
        <Section eyebrow="We cater" title="Every kind of celebration" isWide={isWide}>
          <View style={s.catGrid}>
            {cats.map((c) => (
              <TouchableOpacity key={c.id} style={[s.catCard, isWide && s.catCardWide]} onPress={() => router.push('/contact')}>
                <ImageBackground source={{ uri: c.image }} style={s.catImg} imageStyle={{ borderRadius: 4 }}>
                  <View style={s.catOverlay} />
                  <View style={s.catContent}>
                    <Text style={s.catName}>{c.name}</Text>
                    <Text style={s.catDesc} numberOfLines={2}>{c.description}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </Section>
      )}

      {/* SERVICES TEASER */}
      <Section eyebrow="What we offer" title="Catering packages for every event" isWide={isWide}>
        <View style={s.servGrid}>
          {services.slice(0, 6).map((sv) => (
            <View key={sv.id} style={[s.servCard, isWide && s.servCardWide]}>
              {sv.image && (
                <ImageBackground source={{ uri: sv.image }} style={s.servImg} imageStyle={{ borderRadius: 4 }}>
                  <View style={s.servOverlay} />
                </ImageBackground>
              )}
              <View style={s.servBody}>
                <Text style={s.servTitle}>{sv.title}</Text>
                <Text style={s.servDesc} numberOfLines={3}>{sv.description}</Text>
                <View style={s.servFooter}>
                  <Text style={s.servPrice}>From ₹{sv.starting_price}/plate</Text>
                  <TouchableOpacity onPress={() => router.push('/packages')}><Text style={s.servCta}>Details →</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Button label="View All Packages" variant="outline" onPress={() => router.push('/packages')} icon="arrow-forward" />
        </View>
      </Section>

      {/* SIGNATURE DISHES */}
      <Section eyebrow="Signature dishes" title="A taste of our menu" isWide={isWide}>
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(d: any) => d.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          renderItem={({ item }: any) => (
            <View style={s.dishCard}>
              {item.image && <Image source={{ uri: item.image }} style={s.dishImg} />}
              <View style={s.dishOverlay} />
              <View style={s.dishBadge}><Text style={s.dishBadgeText}>{item.category}</Text></View>
              <View style={s.dishContent}>
                <Text style={s.dishName}>{item.name}</Text>
                <Text style={s.dishPrice}>₹{item.price_min}-{item.price_max}/plate</Text>
              </View>
            </View>
          )}
        />
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Button label="Explore Full Menu" variant="outline" onPress={() => router.push('/menu')} icon="restaurant" />
        </View>
      </Section>

      {/* TESTIMONIALS */}
      {testi.length > 0 && (
        <Section eyebrow="Loved by clients" title="What people say" isWide={isWide}>
          <FlatList
            horizontal
            data={testi}
            keyExtractor={(t: any) => t.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
            renderItem={({ item }: any) => (
              <View style={s.testi}>
                <View style={s.stars}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color={theme.colors.primary} />
                  ))}
                </View>
                <Text style={s.testiText}>“{item.text}”</Text>
                <View style={s.testiAuthor}>
                  <Text style={s.testiName}>{item.name}</Text>
                  <Text style={s.testiRole}>{item.role}</Text>
                </View>
              </View>
            )}
          />
        </Section>
      )}

      {/* CTA BAND */}
      <View style={[s.ctaBand, isWide && { padding: 56 }]}>
        <Text style={s.ctaBandLabel}>Ready when you are</Text>
        <Text style={s.ctaBandTitle}>Let's plan your event</Text>
        <Text style={s.ctaBandSub}>Tell us about your event and our team will reach out within 24 hours.</Text>
        <View style={s.ctaBandBtns}>
          <Button label="Get a Quote" icon="flash" onPress={() => router.push('/contact')} />
          <Button label="Browse Packages" icon="list" variant="outline" onPress={() => router.push('/packages')} />
        </View>
      </View>
    </PageShell>
  );
}

function Stat({ label, value }: any) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ eyebrow, title, children, isWide }: any) {
  return (
    <View style={[s.section, isWide && { paddingVertical: 80 }]}>
      <View style={[s.sectionHead, isWide && { paddingHorizontal: 48 }]}>
        <Text style={s.sectionEyebrow}>{eyebrow}</Text>
        <Text style={[s.sectionTitle, isWide && { fontSize: 36 }]}>{title}</Text>
      </View>
      <View style={isWide ? { paddingHorizontal: 48 } : undefined}>{children}</View>
    </View>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <View style={s.feature}>
      <View style={s.featureIcon}><Ionicons name={icon} size={18} color={theme.colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={s.featureTitle}>{title}</Text>
        <Text style={s.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { height: 580, justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.7)' },
  heroInner: { padding: 24, gap: 14 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  heroTitle: { color: theme.colors.text, fontSize: 42, fontWeight: '700', lineHeight: 48 },
  heroSub: { color: theme.colors.text, opacity: 0.85, fontSize: 15, lineHeight: 23, maxWidth: 620 },
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  heroStats: { flexDirection: 'row', gap: 24, marginTop: 24, flexWrap: 'wrap' },
  stat: { borderLeftWidth: 2, borderLeftColor: theme.colors.primary, paddingLeft: 12 },
  statValue: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  statLabel: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },

  trust: { paddingVertical: 36, paddingHorizontal: 24, backgroundColor: theme.colors.surface, alignItems: 'center', gap: 16 },
  trustLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  trustLogos: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'center' },
  trustLogoBox: { alignItems: 'center', gap: 8 },
  trustLogo: { width: 60, height: 40, tintColor: theme.colors.primary, opacity: 0.9 },
  trustName: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },

  section: { paddingVertical: 48, gap: 24 },
  sectionHead: { paddingHorizontal: 24, gap: 6 },
  sectionEyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  sectionTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '700', maxWidth: 800 },

  aboutGrid: { paddingHorizontal: 24, gap: 24 },
  aboutGridWide: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 },
  aboutImg: { width: '100%', height: 280, borderRadius: 4 },
  bodyText: { color: theme.colors.text, fontSize: 15, lineHeight: 24, opacity: 0.9 },
  aboutFeatures: { gap: 14, marginTop: 12 },
  feature: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  featureIcon: { width: 36, height: 36, borderRadius: 4, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  featureDesc: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  linkBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 },
  linkBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },

  catGrid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: '48%', height: 160 },
  catCardWide: { width: '32%', height: 220 },
  catImg: { flex: 1, justifyContent: 'flex-end' },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.55)', borderRadius: 4 },
  catContent: { padding: 14 },
  catName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  catDesc: { color: theme.colors.text, opacity: 0.85, fontSize: 12, marginTop: 4 },

  servGrid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  servCard: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  servCardWide: { width: '31.5%' },
  servImg: { height: 140, justifyContent: 'flex-end' },
  servOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.35)' },
  servBody: { padding: 16, gap: 10 },
  servTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  servDesc: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  servFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10 },
  servPrice: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  servCta: { color: theme.colors.primary, fontWeight: '700', fontSize: 12, letterSpacing: 1 },

  dishCard: { width: 240, height: 280, borderRadius: 4, overflow: 'hidden', position: 'relative' },
  dishImg: { width: '100%', height: '100%' },
  dishOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.5)' },
  dishBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 3 },
  dishBadgeText: { color: theme.colors.bg, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  dishContent: { position: 'absolute', bottom: 14, left: 14, right: 14 },
  dishName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  dishPrice: { color: theme.colors.primary, fontSize: 12, marginTop: 4 },

  testi: { width: 300, padding: 18, borderRadius: 4, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: 12 },
  stars: { flexDirection: 'row', gap: 2 },
  testiText: { color: theme.colors.text, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
  testiAuthor: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
  testiName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  testiRole: { color: theme.colors.primary, fontSize: 11, marginTop: 2 },

  ctaBand: { backgroundColor: theme.colors.surface, padding: 32, alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginTop: 24 },
  ctaBandLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  ctaBandTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  ctaBandSub: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
  ctaBandBtns: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
});
