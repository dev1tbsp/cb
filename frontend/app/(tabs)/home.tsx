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
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme, BUSINESS } from '@/src/theme';
import { useAuth } from '@/src/context/AuthContext';

const { width } = Dimensions.get('window');

interface EventCategory { id: string; name: string; icon: string; image: string; description: string; }
interface Testimonial { id: string; name: string; role: string; rating: number; text: string; event_type: string; }
interface PortfolioItem { id: string; title: string; event_type: string; guest_count: number; cuisine: string; image: string; description: string; }
interface CorporateClient { id: string; name: string; logo: string; }

const HERO_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/0bec547c94a8a1c6b5cc1c49d641ea25b1b5d44d4c0b0d4340bcb5f081bf8a1d.png';
const SIGNATURE_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/c2969cd9807f501ea73d9328149a8bdd4d3e6d697e5b1f97d5d079a1e3b0944b.png';
const LIVE_COUNTER_IMG = 'https://static.prod-images.emergentagent.com/jobs/c2086a8e-9ca7-4684-a00f-3d11ee3410f9/images/cb48ccb579fd6d36baeaff403d662ac1e76e09f70a73ce51f5e08d5df20b709d.png';

const SIGNATURE_DISHES = [
  { id: 's1', name: 'Royal Paneer Tikka', img: SIGNATURE_IMG, tag: 'Chef Pick' },
  { id: 's2', name: 'Live Pasta Counter', img: LIVE_COUNTER_IMG, tag: 'Live' },
  { id: 's3', name: 'Heritage Thali', img: SIGNATURE_IMG, tag: 'Bestseller' },
  { id: 's4', name: 'Marigold Mocktail Bar', img: LIVE_COUNTER_IMG, tag: 'Live' },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Tell us your event', desc: 'Share type, count & date' },
  { num: '02', title: 'Pick your menu', desc: 'Curated chef recommendations' },
  { num: '03', title: 'Get instant quote', desc: 'Transparent per-plate pricing' },
  { num: '04', title: 'We cater the magic', desc: 'On-time, hygienic, delicious' },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [clients, setClients] = useState<CorporateClient[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, t, p, cl] = await Promise.all([
          api.get<EventCategory[]>('/event-categories', { auth: false }),
          api.get<Testimonial[]>('/testimonials', { auth: false }),
          api.get<PortfolioItem[]>('/portfolio', { auth: false }),
          api.get<CorporateClient[]>('/corporate-clients', { auth: false }),
        ]);
        setCategories(c);
        setTestimonials(t);
        setPortfolio(p);
        setClients(cl);
      } catch (e) {
        console.warn('Home data fetch failed', e);
      }
    })();
  }, []);

  const openWhatsApp = () => {
    const msg = encodeURIComponent("Hi Cosmic Bites! I'd like to enquire about catering.");
    Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}?text=${msg}`);
  };
  const callNow = () => Linking.openURL(`tel:${BUSINESS.phone}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brandSmall}>✦ {BUSINESS.name}</Text>
            <Text style={styles.greet}>Hi, {user?.name?.split(' ')[0] || 'guest'}</Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={callNow} style={styles.iconBtn} testID="top-call-btn">
              <Ionicons name="call" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openWhatsApp} style={styles.iconBtn} testID="top-whatsapp-btn">
              <Ionicons name="logo-whatsapp" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <ImageBackground source={{ uri: HERO_IMG }} style={styles.hero} imageStyle={styles.heroImg}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Pure Vegetarian Catering</Text>
            <Text style={styles.heroTitle}>Crafted Feasts.{'\n'}Memorable Moments.</Text>
            <Text style={styles.heroSubtitle}>
              From intimate house parties to 500-guest corporate galas — Cosmic Bites brings the celebration.
            </Text>
            <View style={styles.heroCtas}>
              <TouchableOpacity
                style={styles.ctaPrimary}
                onPress={() => router.push('/quote')}
                testID="hero-cta-quote"
              >
                <Ionicons name="flash" size={16} color={theme.colors.background} />
                <Text style={styles.ctaPrimaryText}>Get Instant Quote</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ctaSecondary}
                onPress={() => router.push('/menu')}
                testID="hero-cta-menus"
              >
                <Text style={styles.ctaSecondaryText}>View Menus</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.ctaGhost} onPress={openWhatsApp} testID="hero-cta-consult">
              <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.primary} />
              <Text style={styles.ctaGhostText}>Book a free consultation</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Event Categories */}
        <Section label="Plan your event" title="Event Categories">
          <View style={styles.catGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.catCard}
                onPress={() => router.push({ pathname: '/quote', params: { event: c.id } })}
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

        {/* Signature Dishes Carousel */}
        <Section label="From our kitchen" title="Signature Dishes">
          <FlatList
            horizontal
            data={SIGNATURE_DISHES}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
            renderItem={({ item }) => (
              <View style={styles.dishCard} testID={`dish-${item.id}`}>
                <Image source={{ uri: item.img }} style={styles.dishImg} />
                <View style={styles.dishOverlay} />
                <View style={styles.dishBadge}>
                  <Text style={styles.dishBadgeText}>{item.tag}</Text>
                </View>
                <Text style={styles.dishName}>{item.name}</Text>
              </View>
            )}
          />
        </Section>

        {/* Live Counter showcase */}
        <Section label="Crowd favourite" title="Live Counters">
          <TouchableOpacity
            style={styles.liveCard}
            onPress={() => router.push('/services')}
            testID="live-counter-card"
          >
            <ImageBackground source={{ uri: LIVE_COUNTER_IMG }} style={styles.liveImg} imageStyle={{ borderRadius: 4 }}>
              <View style={styles.liveOverlay} />
              <View style={styles.liveContent}>
                <Text style={styles.liveBadge}>✦ LIVE STATIONS</Text>
                <Text style={styles.liveTitle}>Chaat · Pasta · Dosa · Tandoor</Text>
                <Text style={styles.liveSub}>The chef performs. Guests dine fresh. Pure spectacle.</Text>
                <View style={styles.liveCta}>
                  <Text style={styles.liveCtaText}>Explore counters</Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.background} />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </Section>

        {/* Process Flow */}
        <Section label="How it works" title="Four simple steps">
          <View style={styles.processWrap}>
            {PROCESS_STEPS.map((s, idx) => (
              <View key={s.num} style={styles.processCard}>
                <Text style={styles.processNum}>{s.num}</Text>
                <Text style={styles.processTitle}>{s.title}</Text>
                <Text style={styles.processDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Portfolio Teaser */}
        <Section
          label="Recent work"
          title="From our portfolio"
          action={() => router.push('/portfolio')}
          actionLabel="View all"
        >
          <FlatList
            horizontal
            data={portfolio.slice(0, 6)}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.portCard} testID={`port-teaser-${item.id}`}>
                <Image source={{ uri: item.image }} style={styles.portImg} />
                <View style={styles.portInfo}>
                  <Text style={styles.portTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.portMeta}>{item.guest_count} pax · {item.cuisine}</Text>
                </View>
              </View>
            )}
          />
        </Section>

        {/* Testimonials */}
        <Section label="Loved by clients" title="What people say">
          <FlatList
            horizontal
            data={testimonials}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
            renderItem={({ item }) => (
              <View style={styles.testiCard} testID={`testi-${item.id}`}>
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

        {/* Corporate Clients */}
        <Section label="Trusted by" title="Corporate clients">
          <View style={styles.clientsRow}>
            {clients.map((c) => (
              <View key={c.id} style={styles.clientBox} testID={`client-${c.id}`}>
                <Image source={{ uri: c.logo }} style={styles.clientLogo} resizeMode="contain" />
                <Text style={styles.clientName}>{c.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Contact CTA */}
        <View style={styles.contactBlock}>
          <Text style={styles.contactLabel}>Ready when you are</Text>
          <Text style={styles.contactTitle}>Let's plan your event</Text>
          <View style={styles.contactBtns}>
            <TouchableOpacity style={styles.contactBtn} onPress={openWhatsApp} testID="contact-whatsapp">
              <Ionicons name="logo-whatsapp" size={18} color={theme.colors.background} />
              <Text style={styles.contactBtnText}>WhatsApp Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtnOutline} onPress={callNow} testID="contact-call">
              <Ionicons name="call" size={18} color={theme.colors.primary} />
              <Text style={styles.contactBtnOutlineText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  label,
  title,
  children,
  action,
  actionLabel,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionLabel}>{label}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {action && (
          <TouchableOpacity onPress={action}>
            <Text style={styles.sectionAction}>{actionLabel} →</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 32 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  brandSmall: { color: theme.colors.primary, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  greet: { color: theme.colors.text, fontSize: 18, fontWeight: '600', marginTop: 2 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  hero: {
    marginHorizontal: 24, height: 480, marginTop: 8, justifyContent: 'flex-end',
  },
  heroImg: { borderRadius: 6 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,21,17,0.65)',
    borderRadius: 6,
  },
  heroContent: { padding: 24, gap: 12 },
  heroLabel: {
    color: theme.colors.primary,
    fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700',
  },
  heroTitle: {
    color: theme.colors.text, fontSize: 34, fontWeight: '700', lineHeight: 40,
  },
  heroSubtitle: {
    color: theme.colors.text, opacity: 0.8, fontSize: 14, lineHeight: 21, marginTop: 4,
  },
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  ctaPrimary: {
    backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4,
  },
  ctaPrimaryText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  ctaSecondary: {
    borderWidth: 1, borderColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 18,
    borderRadius: 4,
  },
  ctaSecondaryText: { color: theme.colors.primary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  ctaGhost: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  ctaGhostText: { color: theme.colors.primary, fontSize: 13 },

  section: { marginTop: 32, gap: 16 },
  sectionHead: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  sectionLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  sectionTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 4 },
  sectionAction: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },

  catGrid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: (width - 24 * 2 - 12) / 2, height: 140 },
  catImg: { flex: 1, justifyContent: 'flex-end' },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.55)', borderRadius: 4 },
  catContent: { padding: 12 },
  catName: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  catDesc: { color: theme.colors.text, opacity: 0.75, fontSize: 11, marginTop: 2 },

  dishCard: {
    width: 220, height: 260, borderRadius: 4, overflow: 'hidden',
    backgroundColor: theme.colors.surface, position: 'relative',
  },
  dishImg: { width: '100%', height: '100%' },
  dishOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,21,17,0.45)',
  },
  dishBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 3,
  },
  dishBadgeText: { color: theme.colors.background, fontSize: 9, letterSpacing: 1.5, fontWeight: '700', textTransform: 'uppercase' },
  dishName: {
    position: 'absolute', bottom: 14, left: 14, right: 14,
    color: theme.colors.text, fontSize: 18, fontWeight: '700',
  },

  liveCard: { marginHorizontal: 24, height: 220, borderRadius: 4, overflow: 'hidden' },
  liveImg: { flex: 1, justifyContent: 'flex-end' },
  liveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,21,17,0.6)',
  },
  liveContent: { padding: 18, gap: 6 },
  liveBadge: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2.5, fontWeight: '700' },
  liveTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  liveSub: { color: theme.colors.text, opacity: 0.8, fontSize: 13 },
  liveCta: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 4,
  },
  liveCtaText: { color: theme.colors.background, fontWeight: '700', fontSize: 12, letterSpacing: 1 },

  processWrap: { paddingHorizontal: 24, gap: 12 },
  processCard: {
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4,
    borderLeftWidth: 3, borderLeftColor: theme.colors.primary,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  processNum: { color: theme.colors.primary, fontSize: 22, fontWeight: '700', width: 40 },
  processTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  processDesc: { color: theme.colors.textMuted, fontSize: 12 },

  portCard: { width: 220, backgroundColor: theme.colors.surface, borderRadius: 4, overflow: 'hidden' },
  portImg: { width: '100%', height: 130 },
  portInfo: { padding: 12 },
  portTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  portMeta: { color: theme.colors.primary, fontSize: 11, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },

  testiCard: {
    width: 280, padding: 18, borderRadius: 4,
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    gap: 12,
  },
  stars: { flexDirection: 'row', gap: 2 },
  testiText: { color: theme.colors.text, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
  testiAuthor: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
  testiName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  testiRole: { color: theme.colors.primary, fontSize: 11, marginTop: 2 },

  clientsRow: { paddingHorizontal: 24, flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  clientBox: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4 },
  clientLogo: { width: 50, height: 50, opacity: 0.9, tintColor: theme.colors.primary },
  clientName: { color: theme.colors.text, fontSize: 12, marginTop: 8, fontWeight: '600' },

  contactBlock: {
    marginHorizontal: 24, marginTop: 36,
    backgroundColor: theme.colors.surface, padding: 24, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', gap: 12,
  },
  contactLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' },
  contactTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  contactBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  contactBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 4,
  },
  contactBtnText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, fontSize: 12, textTransform: 'uppercase' },
  contactBtnOutline: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 4,
  },
  contactBtnOutlineText: { color: theme.colors.primary, fontWeight: '700', letterSpacing: 1, fontSize: 12, textTransform: 'uppercase' },
});
