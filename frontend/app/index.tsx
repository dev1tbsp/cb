import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme, BUSINESS } from '@/src/theme';
import { useSeo } from '@/src/hooks/use-seo';
import { SiteHeader, SiteFooter } from '@/src/components/SiteShell';

const HERO_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/0bec547c94a8a1c6b5cc1c49d641ea25b1b5d44d4c0b0d4340bcb5f081bf8a1d.png';
const SIGNATURE_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/c2969cd9807f501ea73d9328149a8bdd4d3e6d697e5b1f97d5d079a1e3b0944b.png';
const LIVE_COUNTER_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/cb48ccb579fd6d36baeaff403d662ac1e76e09f70a73ce51f5e08d5df20b709d.png';
const CORPORATE_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/a195994895d680a9168a969cbd37b0a4f60d66a9b0f077572e033b02958c3645.png';

const PROCESS = [
  { num: '01', title: 'Tell us your event', desc: 'Share type, date and guest count' },
  { num: '02', title: 'Curate the menu', desc: 'Our chefs craft a tailored spread' },
  { num: '03', title: 'Get instant quote', desc: 'Transparent per-plate pricing' },
  { num: '04', title: 'We cater the magic', desc: 'On-time, hygienic, delicious' },
];

export default function PublicLanding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);

  useSeo({
    title: 'Cosmic Bites — Pure Vegetarian Catering for Birthdays, Corporate & Weddings',
    description:
      'Premium pure-vegetarian catering by Cosmic Bites. Birthday, house, corporate, pre-wedding & festive events. Live counters, 10+ cuisines, 20–500 guests. Get an instant quote.',
  });

  useEffect(() => {
    (async () => {
      try {
        const [c, s, t, p, cl, m] = await Promise.all([
          api.get('/event-categories', { auth: false }),
          api.get('/services', { auth: false }),
          api.get('/testimonials', { auth: false }),
          api.get('/portfolio', { auth: false }),
          api.get('/corporate-clients', { auth: false }),
          api.get('/menu', { auth: false }),
        ]);
        setCategories(c); setServices(s); setTestimonials(t); setPortfolio(p); setClients(cl); setMenu(m);
      } catch (e) { console.warn(e); }
    })();
  }, []);

  const openWhatsApp = () => Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`);
  const callNow = () => Linking.openURL(`tel:${BUSINESS.phone}`);

  // Featured menu samples (1 per cuisine)
  const cuisines = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Chaat', 'Desserts'];
  const featuredMenu = cuisines.map((c) => menu.find((m) => m.category === c)).filter(Boolean);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scroll}>
      <SiteHeader />

      {/* HERO */}
      <ImageBackground source={{ uri: HERO_IMG }} style={[styles.hero, isWide && styles.heroWide]} imageStyle={styles.heroImg}>
        <View style={styles.heroOverlay} />
        <View style={[styles.heroContent, isWide && { maxWidth: 720, paddingHorizontal: 64 }]}>
          <Text style={styles.heroEyebrow}>✦ Pure Vegetarian · Est. Cosmic Bites</Text>
          <Text style={[styles.heroTitle, isWide && { fontSize: 64, lineHeight: 72 }]}>
            Crafted Feasts.{'\n'}Memorable Moments.
          </Text>
          <Text style={styles.heroSub}>
            From intimate house parties of 20 to corporate galas of 500 — Cosmic Bites delivers
            elegant, hygienic, pure-vegetarian catering across every Indian celebration.
          </Text>
          <View style={styles.heroCtas}>
            <TouchableOpacity style={styles.ctaPrimary} onPress={() => router.push('/get-quote')} testID="hero-cta-quote">
              <Ionicons name="flash" size={16} color={theme.colors.background} />
              <Text style={styles.ctaPrimaryText}>Get Instant Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondary} onPress={openWhatsApp} testID="hero-cta-whatsapp">
              <Ionicons name="logo-whatsapp" size={16} color={theme.colors.primary} />
              <Text style={styles.ctaSecondaryText}>WhatsApp Us</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroStats}>
            <Stat label="Events catered" value="500+" />
            <Stat label="Pure veg" value="100%" />
            <Stat label="Guest range" value="20-500" />
          </View>
        </View>
      </ImageBackground>

      {/* CORPORATE TRUST STRIP */}
      <View style={[styles.trust, isWide && { paddingHorizontal: 48 }]}>
        <Text style={styles.trustLabel}>Trusted by</Text>
        <View style={styles.trustLogos}>
          {clients.map((c) => (
            <View key={c.id} style={styles.trustLogoBox}>
              <Image source={{ uri: c.logo }} style={styles.trustLogo} resizeMode="contain" />
              <Text style={styles.trustName}>{c.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ABOUT TEASER */}
      <Section eyebrow="Our story" title="A celebration of pure vegetarian cuisine" isWide={isWide}>
        <View style={[styles.aboutGrid, isWide && styles.aboutGridWide]}>
          <View style={styles.aboutText}>
            <Text style={styles.bodyText}>
              Cosmic Bites was born from a simple belief — that vegetarian food can be the most
              celebrated part of any event. We curate menus drawn from across India and the world,
              built on fresh ingredients, hygienic kitchens and decades of catering experience.
            </Text>
            <View style={styles.aboutFeatures}>
              <Feature icon="leaf" title="100% Pure Vegetarian" desc="No exceptions, ever." />
              <Feature icon="sparkles" title="Hygiene-first kitchens" desc="FSSAI compliant, audited regularly." />
              <Feature icon="restaurant" title="Fresh ingredients" desc="Sourced daily, prepped on-site." />
              <Feature icon="people" title="Multi-event capability" desc="From 20-pax dinners to 500-pax weddings." />
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/about')} testID="about-cta">
              <Text style={styles.linkBtnText}>Read our full story</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: SIGNATURE_IMG }} style={[styles.aboutImg, isWide && styles.aboutImgWide]} />
        </View>
      </Section>

      {/* EVENT CATEGORIES */}
      <Section eyebrow="We cater" title="Every kind of celebration" isWide={isWide}>
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catCard, isWide && styles.catCardWide]}
              onPress={() => router.push({ pathname: '/get-quote', params: { event: c.id } })}
              testID={`event-cat-${c.id}`}
            >
              <ImageBackground source={{ uri: c.image }} style={styles.catImg} imageStyle={{ borderRadius: 4 }}>
                <View style={styles.catOverlay} />
                <View style={styles.catContent}>
                  <Text style={styles.catName}>{c.name}</Text>
                  <Text style={styles.catDesc} numberOfLines={2}>{c.description}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* SERVICES */}
      <Section eyebrow="What we offer" title="Catering Services" isWide={isWide}>
        <View style={styles.servGrid}>
          {services.map((s) => (
            <View key={s.id} style={[styles.servCard, isWide && styles.servCardWide]} testID={`service-${s.id}`}>
              {s.image && (
                <ImageBackground source={{ uri: s.image }} style={styles.servImg} imageStyle={{ borderRadius: 4 }}>
                  <View style={styles.servOverlay} />
                </ImageBackground>
              )}
              <View style={styles.servBody}>
                <Text style={styles.servTitle}>{s.title}</Text>
                <Text style={styles.servDesc} numberOfLines={3}>{s.description}</Text>
                <View style={styles.servFooter}>
                  <Text style={styles.servPrice}>From ₹{s.starting_price}/plate</Text>
                  <TouchableOpacity onPress={() => router.push('/get-quote')}>
                    <Text style={styles.servCta}>Get quote →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Section>

      {/* MENU SAMPLE */}
      <Section eyebrow="Signature dishes" title="A taste of our menu" isWide={isWide}>
        <FlatList
          horizontal
          data={featuredMenu}
          keyExtractor={(d: any) => d.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          renderItem={({ item }: any) => (
            <View style={styles.dishCard}>
              {item.image && <Image source={{ uri: item.image }} style={styles.dishImg} />}
              <View style={styles.dishOverlay} />
              <View style={styles.dishBadge}><Text style={styles.dishBadgeText}>{item.category}</Text></View>
              <View style={styles.dishContent}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.dishPrice}>₹{item.price_min}-{item.price_max}/plate</Text>
              </View>
            </View>
          )}
        />
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={styles.helperText}>
            10+ cuisines available · North Indian · South Indian · Chinese · Italian · Chaat · Snacks · Desserts · Mocktails · Kids · Jain
          </Text>
        </View>
      </Section>

      {/* PROCESS */}
      <Section eyebrow="How it works" title="Four simple steps" isWide={isWide}>
        <View style={[styles.processGrid, isWide && styles.processGridWide]}>
          {PROCESS.map((p) => (
            <View key={p.num} style={[styles.processCard, isWide && { flex: 1 }]}>
              <Text style={styles.processNum}>{p.num}</Text>
              <Text style={styles.processTitle}>{p.title}</Text>
              <Text style={styles.processDesc}>{p.desc}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* PORTFOLIO TEASER */}
      <Section eyebrow="Recent events" title="From our portfolio" isWide={isWide}>
        <View style={styles.portGrid}>
          {portfolio.slice(0, 6).map((p, idx) => (
            <View key={p.id} style={[styles.portTile, isWide && idx === 0 && styles.portTileBig]}>
              <Image source={{ uri: p.image }} style={styles.portImg} />
              <View style={styles.portOverlay} />
              <View style={styles.portContent}>
                <Text style={styles.portMeta}>{p.guest_count} PAX · {p.cuisine.toUpperCase()}</Text>
                <Text style={styles.portTitle}>{p.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      {/* TESTIMONIALS */}
      <Section eyebrow="Loved by clients" title="What people say" isWide={isWide}>
        <FlatList
          horizontal
          data={testimonials}
          keyExtractor={(t: any) => t.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          renderItem={({ item }: any) => (
            <View style={styles.testiCard}>
              <View style={styles.stars}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color={theme.colors.primary} />
                ))}
              </View>
              <Text style={styles.testiText}>“{item.text}”</Text>
              <View style={styles.testiAuthor}>
                <Text style={styles.testiName}>{item.name}</Text>
                <Text style={styles.testiRole}>{item.role}</Text>
              </View>
            </View>
          )}
        />
      </Section>

      {/* CTA BAND */}
      <View style={[styles.ctaBand, isWide && { padding: 56 }]}>
        <Text style={styles.ctaBandLabel}>Ready when you are</Text>
        <Text style={styles.ctaBandTitle}>Let's plan your event</Text>
        <Text style={styles.ctaBandSub}>Get a free, transparent quote in under 2 minutes.</Text>
        <View style={styles.ctaBandBtns}>
          <TouchableOpacity style={styles.ctaPrimary} onPress={() => router.push('/get-quote')} testID="band-cta-quote">
            <Ionicons name="flash" size={16} color={theme.colors.background} />
            <Text style={styles.ctaPrimaryText}>Get Instant Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaSecondary} onPress={() => router.push('/contact')} testID="band-cta-contact">
            <Ionicons name="mail" size={16} color={theme.colors.primary} />
            <Text style={styles.ctaSecondaryText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SiteFooter />
    </ScrollView>
  );
}

function Stat({ label, value }: any) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ eyebrow, title, children, isWide }: any) {
  return (
    <View style={[styles.section, isWide && styles.sectionWide]}>
      <View style={[styles.sectionHead, isWide && { paddingHorizontal: 48 }]}>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={[styles.sectionTitle, isWide && { fontSize: 36 }]}>{title}</Text>
      </View>
      <View style={isWide ? { paddingHorizontal: 48 } : undefined}>{children}</View>
    </View>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 0 },

  hero: { height: 580, justifyContent: 'center' },
  heroWide: { height: 680 },
  heroImg: {},
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.7)' },
  heroContent: { padding: 24, gap: 14 },
  heroEyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  heroTitle: { color: theme.colors.text, fontSize: 42, fontWeight: '700', lineHeight: 48 },
  heroSub: { color: theme.colors.text, opacity: 0.85, fontSize: 15, lineHeight: 23, maxWidth: 600 },
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  ctaPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 4 },
  ctaPrimaryText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
  ctaSecondary: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 4 },
  ctaSecondaryText: { color: theme.colors.primary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
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
  sectionWide: { paddingVertical: 80 },
  sectionHead: { paddingHorizontal: 24, gap: 6 },
  sectionEyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  sectionTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '700', maxWidth: 800 },

  aboutGrid: { paddingHorizontal: 24, gap: 24 },
  aboutGridWide: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 },
  aboutText: { flex: 1, gap: 16 },
  aboutImg: { width: '100%', height: 280, borderRadius: 4 },
  aboutImgWide: { width: '45%', height: 480, marginLeft: 32 },
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
  catDesc: { color: theme.colors.text, opacity: 0.8, fontSize: 12, marginTop: 4 },

  servGrid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  servCard: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  servCardWide: { width: '31%' },
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
  dishBadgeText: { color: theme.colors.background, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  dishContent: { position: 'absolute', bottom: 14, left: 14, right: 14 },
  dishName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  dishPrice: { color: theme.colors.primary, fontSize: 12, marginTop: 4 },
  helperText: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },

  processGrid: { paddingHorizontal: 24, gap: 12 },
  processGridWide: { flexDirection: 'row', gap: 16 },
  processCard: { backgroundColor: theme.colors.surface, padding: 18, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: theme.colors.primary, gap: 6 },
  processNum: { color: theme.colors.primary, fontSize: 24, fontWeight: '700' },
  processTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  processDesc: { color: theme.colors.textMuted, fontSize: 12 },

  portGrid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  portTile: { width: '48%', height: 180, borderRadius: 4, overflow: 'hidden' },
  portTileBig: { width: '100%', height: 280 },
  portImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  portOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.5)' },
  portContent: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  portMeta: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, fontWeight: '700' },
  portTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700', marginTop: 4 },

  testiCard: { width: 300, padding: 18, borderRadius: 4, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: 12 },
  stars: { flexDirection: 'row', gap: 2 },
  testiText: { color: theme.colors.text, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
  testiAuthor: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
  testiName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  testiRole: { color: theme.colors.primary, fontSize: 11, marginTop: 2 },

  ctaBand: { backgroundColor: theme.colors.surface, padding: 32, alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  ctaBandLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  ctaBandTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  ctaBandSub: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
  ctaBandBtns: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
});
