import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Linking } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, BUSINESS } from '@/src/theme';

const LINKS = [
  { route: '/', label: 'Home' },
  { route: '/about', label: 'About' },
  { route: '/services', label: 'Services' },
  { route: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <View style={[styles.header, isWide && styles.headerWide]}>
      <TouchableOpacity onPress={() => router.push('/')} style={styles.brandRow} testID="site-brand">
        <Text style={styles.brandMark}>✦</Text>
        <View>
          <Text style={styles.brandName}>{BUSINESS.name}</Text>
          {isWide && <Text style={styles.brandTag}>Pure Vegetarian Catering</Text>}
        </View>
      </TouchableOpacity>

      {isWide && (
        <View style={styles.nav}>
          {LINKS.map((l) => {
            const active = pathname === l.route;
            return (
              <TouchableOpacity
                key={l.route}
                onPress={() => router.push(l.route as any)}
                testID={`site-nav-${l.label.toLowerCase()}`}
              >
                <Text style={[styles.navText, active && styles.navTextActive]}>{l.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push('/auth/login')}
          testID="site-signin"
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quoteBtn}
          onPress={() => router.push('/get-quote')}
          testID="site-cta-quote"
        >
          <Ionicons name="flash" size={14} color={theme.colors.background} />
          {isWide && <Text style={styles.quoteText}>Get Quote</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SiteFooter() {
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  return (
    <View style={fStyles.footer}>
      <View style={[fStyles.row, isWide && fStyles.rowWide]}>
        <View style={fStyles.col}>
          <View style={fStyles.brandRow}>
            <Text style={fStyles.brandMark}>✦</Text>
            <Text style={fStyles.brandName}>{BUSINESS.name}</Text>
          </View>
          <Text style={fStyles.tagline}>{BUSINESS.tagline}</Text>
          <Text style={fStyles.muted}>
            Pure-vegetarian catering for birthdays, house parties, housewarmings,
            pre-wedding events, corporate gatherings and festive celebrations.
          </Text>
        </View>

        <View style={fStyles.col}>
          <Text style={fStyles.colTitle}>Explore</Text>
          {LINKS.map((l) => (
            <Text key={l.route} style={fStyles.link}>{l.label}</Text>
          ))}
        </View>

        <View style={fStyles.col}>
          <Text style={fStyles.colTitle}>Contact</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${BUSINESS.phone}`)}>
            <Text style={fStyles.link}>{BUSINESS.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${BUSINESS.email}`)}>
            <Text style={fStyles.link}>{BUSINESS.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`)}>
            <Text style={fStyles.link}>WhatsApp Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${BUSINESS.instagram}`)}>
            <Text style={fStyles.link}>@{BUSINESS.instagram}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={fStyles.bottom}>
        <Text style={fStyles.copyright}>© {new Date().getFullYear()} Cosmic Bites · All rights reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
    zIndex: 10,
  },
  headerWide: { paddingHorizontal: 48 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { color: theme.colors.primary, fontSize: 26 },
  brandName: { color: theme.colors.text, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
  brandTag: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },
  nav: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  navText: { color: theme.colors.text, fontSize: 14, fontWeight: '500', opacity: 0.8 },
  navTextActive: { color: theme.colors.primary, fontWeight: '700', opacity: 1 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  signInBtn: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4 },
  signInText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  quoteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 4,
  },
  quoteText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
});

const fStyles = StyleSheet.create({
  footer: { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, marginTop: 32 },
  row: { gap: 24 },
  rowWide: { flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1200, alignSelf: 'center', width: '100%', gap: 48 },
  col: { flex: 1, gap: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { color: theme.colors.primary, fontSize: 22 },
  brandName: { color: theme.colors.text, fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
  tagline: { color: theme.colors.primary, fontSize: 11, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  muted: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  colTitle: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  link: { color: theme.colors.text, fontSize: 13, paddingVertical: 4 },
  bottom: { marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  copyright: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1 },
});
