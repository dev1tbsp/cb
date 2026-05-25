import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, useWindowDimensions, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme, BUSINESS } from '@/src/theme';
import { useSeo } from '@/src/hooks/use-seo';
import { SiteHeader, SiteFooter } from '@/src/components/SiteShell';

const EVENT_TYPES = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'house_party', label: 'House Party' },
  { id: 'housewarming', label: 'Housewarming' },
  { id: 'pre_wedding', label: 'Pre-Wedding' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'festive', label: 'Festive' },
];
const CUISINES = [
  { id: 'north_indian', label: 'North Indian' },
  { id: 'south_indian', label: 'South Indian' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'italian', label: 'Italian' },
  { id: 'chaat', label: 'Chaat' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'mocktails', label: 'Mocktails' },
  { id: 'kids', label: 'Kids' },
  { id: 'jain', label: 'Jain' },
];
const SERVICES = [
  { id: 'only_food', label: 'Only Food' },
  { id: 'full_catering', label: 'Full Catering' },
  { id: 'live_counters', label: 'Live Counters' },
];
const LIVE_COUNTERS = ['chaat', 'pasta', 'dosa', 'tandoor', 'mocktail', 'dessert'];

export default function GetQuotePage() {
  const params = useLocalSearchParams<{ event?: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  useSeo({
    title: 'Get Instant Catering Quote — Cosmic Bites',
    description: 'Build a custom catering quote for your event in 2 minutes. Pure vegetarian. 20–500 guests. Birthday, corporate, weddings.',
  });

  const [eventType, setEventType] = useState(params.event || 'birthday');
  const [guests, setGuests] = useState('100');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState<string[]>(['north_indian']);
  const [services, setServices] = useState<string[]>(['full_catering']);
  const [liveCounters, setLiveCounters] = useState<string[]>([]);
  const [needsStaff, setNeedsStaff] = useState(false);
  const [needsDecor, setNeedsDecor] = useState(false);
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [estimate, setEstimate] = useState<{ per_plate: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const toggle = (arr: string[], setter: any, id: string) =>
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const refreshEstimate = useCallback(async () => {
    try {
      const g = parseInt(guests) || 0;
      if (g < 20) return;
      const data = await api.post(
        '/quotes/estimate',
        {
          event_type: eventType,
          guest_count: g,
          cuisines,
          services,
          live_counters: liveCounters,
          needs_staff: needsStaff,
          needs_decor: needsDecor,
        },
        { auth: false }
      );
      setEstimate(data);
    } catch (e) { console.warn(e); }
  }, [eventType, guests, cuisines, services, liveCounters, needsStaff, needsDecor]);

  useEffect(() => {
    const t = setTimeout(refreshEstimate, 300);
    return () => clearTimeout(t);
  }, [refreshEstimate]);

  const submit = async () => {
    if (!contactName || !contactEmail) {
      Alert.alert('Required', 'Please share your name and email');
      return;
    }
    const g = parseInt(guests) || 0;
    if (g < 20 || g > 500) {
      Alert.alert('Guest count', 'Must be between 20 and 500');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/quotes/public', {
        event_type: eventType,
        guest_count: g,
        event_date: eventDate || null,
        location: location || null,
        cuisines,
        services,
        live_counters: liveCounters,
        needs_staff: needsStaff,
        needs_decor: needsDecor,
        notes,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
      }, { auth: false });
      setSubmitted(res);
    } catch (e: any) {
      Alert.alert('Submission failed', e?.message || '');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi Cosmic Bites! I just submitted a quote for my ${eventType} event (${guests} guests). Quote ID: ${submitted?.id || ''}`
    );
    Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}?text=${msg}`);
  };

  if (submitted) {
    return (
      <ScrollView style={styles.page}>
        <SiteHeader />
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={42} color={theme.colors.background} />
          </View>
          <Text style={styles.successEyebrow}>Quote received</Text>
          <Text style={styles.successTitle}>We'll be in touch within 2 hours</Text>
          <View style={styles.successBox}>
            <Text style={styles.successBoxLabel}>Estimated total</Text>
            <Text style={styles.successBoxValue}>₹{submitted.estimated_total.toLocaleString('en-IN')}</Text>
            <Text style={styles.successBoxSub}>₹{submitted.estimated_per_plate}/plate · {guests} guests</Text>
          </View>
          <TouchableOpacity style={styles.successCta} onPress={openWhatsApp} testID="quote-success-whatsapp">
            <Ionicons name="logo-whatsapp" size={18} color={theme.colors.background} />
            <Text style={styles.successCtaText}>Continue on WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.successLink}>← Back to home</Text>
          </TouchableOpacity>
        </View>
        <SiteFooter />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page}>
      <SiteHeader />
      <View style={[styles.head, isWide && { paddingHorizontal: 48 }]}>
        <Text style={styles.eyebrow}>Instant Quote</Text>
        <Text style={[styles.title, isWide && { fontSize: 48 }]}>Build your catering quote</Text>
        <Text style={styles.lede}>Customize, see live pricing, submit in 2 minutes. No signup needed.</Text>
      </View>

      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <View style={[styles.formCol, isWide && { flex: 2 }]}>
          <Block title="Event type">
            <View style={styles.chips}>
              {EVENT_TYPES.map((e) => {
                const active = eventType === e.id;
                return (
                  <TouchableOpacity key={e.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setEventType(e.id)} testID={`q-event-${e.id}`}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{e.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Block>

          <Block title="Guest count & details">
            <TextInput
              style={styles.bigInput}
              keyboardType="number-pad"
              value={guests}
              onChangeText={setGuests}
              testID="q-guests"
            />
            <Text style={styles.hint}>Min 20 · Max 500</Text>
            <View style={isWide ? { flexDirection: 'row', gap: 12 } : { gap: 12 }}>
              <TextInput style={[styles.input, isWide && { flex: 1 }]} value={eventDate} onChangeText={setEventDate} placeholder="Event date (optional)" placeholderTextColor={theme.colors.textMuted} testID="q-date" />
              <TextInput style={[styles.input, isWide && { flex: 1 }]} value={location} onChangeText={setLocation} placeholder="City / Venue (optional)" placeholderTextColor={theme.colors.textMuted} testID="q-location" />
            </View>
          </Block>

          <Block title="Cuisines">
            <View style={styles.chips}>
              {CUISINES.map((c) => {
                const active = cuisines.includes(c.id);
                return (
                  <TouchableOpacity key={c.id} style={[styles.chip, active && styles.chipActive]} onPress={() => toggle(cuisines, setCuisines, c.id)} testID={`q-cuisine-${c.id}`}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Block>

          <Block title="Service type">
            <View style={styles.chips}>
              {SERVICES.map((s) => {
                const active = services.includes(s.id);
                return (
                  <TouchableOpacity key={s.id} style={[styles.chip, active && styles.chipActive]} onPress={() => toggle(services, setServices, s.id)} testID={`q-service-${s.id}`}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Block>

          <Block title="Live counters (optional)">
            <View style={styles.chips}>
              {LIVE_COUNTERS.map((c) => {
                const active = liveCounters.includes(c);
                return (
                  <TouchableOpacity key={c} style={[styles.chip, active && styles.chipActive]} onPress={() => toggle(liveCounters, setLiveCounters, c)} testID={`q-live-${c}`}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>✦ {c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Block>

          <Block title="Extras">
            <TouchableOpacity style={[styles.toggleRow, needsStaff && styles.toggleActive]} onPress={() => setNeedsStaff(!needsStaff)} testID="q-staff">
              <Text style={styles.toggleText}>Service staff (servers, captains, cleanup)</Text>
              <View style={[styles.check, needsStaff && styles.checkOn]}>
                {needsStaff && <Ionicons name="checkmark" size={14} color={theme.colors.background} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleRow, needsDecor && styles.toggleActive]} onPress={() => setNeedsDecor(!needsDecor)} testID="q-decor">
              <Text style={styles.toggleText}>Decor & ambience (linens, flowers, styling)</Text>
              <View style={[styles.check, needsDecor && styles.checkOn]}>
                {needsDecor && <Ionicons name="checkmark" size={14} color={theme.colors.background} />}
              </View>
            </TouchableOpacity>
          </Block>

          <Block title="Special requests">
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder="Allergies, dietary preferences, theme ideas…"
              placeholderTextColor={theme.colors.textMuted}
              testID="q-notes"
            />
          </Block>
        </View>

        {/* Side bar — estimate & contact */}
        <View style={[styles.sideCol, isWide && styles.sideColWide]}>
          <View style={styles.estimateCard}>
            <Text style={styles.estimateLabel}>Estimated total</Text>
            <Text style={styles.estimateAmount}>
              {estimate ? `₹${estimate.total.toLocaleString('en-IN')}` : '—'}
            </Text>
            <Text style={styles.estimateMeta}>
              {estimate ? `₹${estimate.per_plate}/plate × ${guests} guests` : 'Fill the form to see your estimate'}
            </Text>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Your details</Text>
            <TextInput style={styles.input} value={contactName} onChangeText={setContactName} placeholder="Full name *" placeholderTextColor={theme.colors.textMuted} testID="q-contact-name" />
            <TextInput style={styles.input} value={contactEmail} onChangeText={setContactEmail} placeholder="Email *" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" keyboardType="email-address" testID="q-contact-email" />
            <TextInput style={styles.input} value={contactPhone} onChangeText={setContactPhone} placeholder="Phone (recommended)" placeholderTextColor={theme.colors.textMuted} keyboardType="phone-pad" testID="q-contact-phone" />
            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting} testID="q-submit">
              {submitting ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <>
                  <Ionicons name="send" size={16} color={theme.colors.background} />
                  <Text style={styles.submitBtnText}>Submit Quote</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.disclaim}>Final pricing confirmed by our team via call.</Text>
          </View>
        </View>
      </View>

      <SiteFooter />
    </ScrollView>
  );
}

function Block({ title, children }: any) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  head: { padding: 24, paddingTop: 36, gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '700' },
  lede: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 22 },
  layout: { padding: 24, gap: 24 },
  layoutWide: { flexDirection: 'row', paddingHorizontal: 48, gap: 32, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  formCol: { gap: 20, flex: 1 },
  block: { backgroundColor: theme.colors.surface, padding: 18, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, gap: 10 },
  blockTitle: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: theme.colors.background, fontWeight: '700' },
  bigInput: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, fontSize: 42, fontWeight: '700', color: theme.colors.primary, paddingVertical: 18, textAlign: 'center', borderRadius: 4 },
  hint: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: -4 },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, padding: 12, fontSize: 14, borderRadius: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  toggleActive: { borderColor: theme.colors.primary },
  toggleText: { color: theme.colors.text, fontSize: 13, flex: 1 },
  check: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },

  sideCol: { gap: 16 },
  sideColWide: { width: 360 },
  estimateCard: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center' },
  estimateLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  estimateAmount: { color: theme.colors.text, fontSize: 36, fontWeight: '700', marginTop: 8 },
  estimateMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  contactCard: { backgroundColor: theme.colors.surface, padding: 18, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, gap: 10 },
  contactTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  submitBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, padding: 14, borderRadius: 4, marginTop: 6 },
  submitBtnText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
  disclaim: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center' },

  successWrap: { alignItems: 'center', padding: 40, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  successEyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  successTitle: { color: theme.colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  successBox: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', marginTop: 12 },
  successBoxLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  successBoxValue: { color: theme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 6 },
  successBoxSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  successCta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 4, marginTop: 16 },
  successCtaText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, fontSize: 13, textTransform: 'uppercase' },
  successLink: { color: theme.colors.primary, marginTop: 8 },
});
