import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme, BUSINESS } from '@/src/theme';

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
  { id: 'kids', label: 'Kids Menu' },
  { id: 'jain', label: 'Jain' },
];

const SERVICES = [
  { id: 'only_food', label: 'Only Food' },
  { id: 'full_catering', label: 'Full Catering' },
  { id: 'live_counters', label: 'Live Counters' },
];

const LIVE_COUNTERS = [
  { id: 'chaat', label: 'Chaat' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'dosa', label: 'Dosa' },
  { id: 'tandoor', label: 'Tandoor' },
  { id: 'mocktail', label: 'Mocktail Bar' },
  { id: 'dessert', label: 'Dessert' },
];

const STEPS = ['Event', 'Guests', 'Cuisine', 'Services', 'Extras', 'Quote'];

export default function QuoteScreen() {
  const params = useLocalSearchParams<{ event?: string }>();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<string>(params.event || '');
  const [guestCount, setGuestCount] = useState<string>('100');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>(['full_catering']);
  const [liveCounters, setLiveCounters] = useState<string[]>([]);
  const [needsStaff, setNeedsStaff] = useState(false);
  const [needsDecor, setNeedsDecor] = useState(false);
  const [notes, setNotes] = useState('');

  const [estimate, setEstimate] = useState<{ per_plate: number; total: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any>(null);

  const toggle = (arr: string[], setter: (v: string[]) => void, id: string) => {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const refreshEstimate = useCallback(async () => {
    if (!eventType || !guestCount) return;
    setEstimating(true);
    try {
      const data = await api.post<{ per_plate: number; total: number }>(
        '/quotes/estimate',
        {
          event_type: eventType,
          guest_count: parseInt(guestCount) || 0,
          cuisines,
          services,
          live_counters: liveCounters,
          needs_staff: needsStaff,
          needs_decor: needsDecor,
        },
        { auth: false }
      );
      setEstimate(data);
    } catch (e) {
      console.warn('estimate failed', e);
    } finally {
      setEstimating(false);
    }
  }, [eventType, guestCount, cuisines, services, liveCounters, needsStaff, needsDecor]);

  useEffect(() => {
    if (step === 5) {
      refreshEstimate();
    }
  }, [step, refreshEstimate]);

  const next = () => {
    if (step === 0 && !eventType) return Alert.alert('Please select an event type');
    if (step === 1) {
      const n = parseInt(guestCount);
      if (!n || n < 20 || n > 500) return Alert.alert('Guest count must be between 20 and 500');
    }
    if (step === 2 && cuisines.length === 0) return Alert.alert('Pick at least one cuisine');
    if (step === 3 && services.length === 0) return Alert.alert('Pick at least one service');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const data = await api.post('/quotes', {
        event_type: eventType,
        guest_count: parseInt(guestCount) || 0,
        event_date: eventDate || null,
        location: location || null,
        cuisines,
        services,
        live_counters: liveCounters,
        needs_staff: needsStaff,
        needs_decor: needsDecor,
        notes,
      });
      setSubmittedQuote(data);
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('Submission failed', e?.message || 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi Cosmic Bites! I just submitted a quote for ${eventType} (${guestCount} guests). Quote ID: ${submittedQuote?.id || ''}`
    );
    Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}?text=${msg}`);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={42} color={theme.colors.background} />
          </View>
          <Text style={styles.successLabel}>Inquiry submitted</Text>
          <Text style={styles.successTitle}>We'll be in touch within 2 hours</Text>
          <View style={styles.estimateBox}>
            <Text style={styles.estimateLabel}>Estimated total</Text>
            <Text style={styles.estimateAmount}>₹{(submittedQuote?.estimated_total || 0).toLocaleString('en-IN')}</Text>
            <Text style={styles.estimateMeta}>₹{submittedQuote?.estimated_per_plate || 0}/plate · {guestCount} guests</Text>
          </View>
          <TouchableOpacity style={styles.successBtn} onPress={openWhatsApp} testID="success-whatsapp">
            <Ionicons name="logo-whatsapp" size={18} color={theme.colors.background} />
            <Text style={styles.successBtnText}>Continue on WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSubmitted(false);
              setStep(0);
              setSubmittedQuote(null);
            }}
            style={styles.successLink}
            testID="success-new-quote"
          >
            <Text style={styles.successLinkText}>Start a new quote</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.label}>Instant Quote Builder</Text>
          <Text style={styles.title}>Step {step + 1} of {STEPS.length}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
          </View>
          <Text style={styles.stepName}>{STEPS[step]}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <View style={styles.section}>
              <Text style={styles.q}>What's the occasion?</Text>
              <View style={styles.chipGrid}>
                {EVENT_TYPES.map((e) => {
                  const active = eventType === e.id;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      style={[styles.chipBig, active && styles.chipBigActive]}
                      onPress={() => setEventType(e.id)}
                      testID={`event-type-${e.id}`}
                    >
                      <Text style={[styles.chipBigText, active && styles.chipBigTextActive]}>{e.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.section}>
              <Text style={styles.q}>How many guests?</Text>
              <Text style={styles.hint}>Minimum 20 · Maximum 500</Text>
              <TextInput
                style={styles.bigInput}
                keyboardType="number-pad"
                value={guestCount}
                onChangeText={setGuestCount}
                placeholder="100"
                placeholderTextColor={theme.colors.textMuted}
                testID="guest-count-input"
              />
              <View style={styles.quickRow}>
                {[50, 100, 150, 250, 400].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={styles.quickChip}
                    onPress={() => setGuestCount(String(n))}
                    testID={`quick-guests-${n}`}
                  >
                    <Text style={styles.quickChipText}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ marginTop: 24, gap: 12 }}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Event Date (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD MMM YYYY"
                    placeholderTextColor={theme.colors.textMuted}
                    value={eventDate}
                    onChangeText={setEventDate}
                    testID="event-date-input"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Location (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City / Venue"
                    placeholderTextColor={theme.colors.textMuted}
                    value={location}
                    onChangeText={setLocation}
                    testID="event-location-input"
                  />
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.section}>
              <Text style={styles.q}>Pick your cuisines</Text>
              <Text style={styles.hint}>Choose one or many — we'll curate the perfect spread.</Text>
              <View style={styles.chipGrid}>
                {CUISINES.map((c) => {
                  const active = cuisines.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggle(cuisines, setCuisines, c.id)}
                      testID={`cuisine-${c.id}`}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.section}>
              <Text style={styles.q}>What service do you need?</Text>
              <View style={styles.chipGrid}>
                {SERVICES.map((s) => {
                  const active = services.includes(s.id);
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.chipBig, active && styles.chipBigActive]}
                      onPress={() => toggle(services, setServices, s.id)}
                      testID={`service-${s.id}`}
                    >
                      <Text style={[styles.chipBigText, active && styles.chipBigTextActive]}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.q, { marginTop: 28 }]}>Add live counters</Text>
              <Text style={styles.hint}>Optional · Each counter adds ~₹80/plate</Text>
              <View style={styles.chipGrid}>
                {LIVE_COUNTERS.map((c) => {
                  const active = liveCounters.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggle(liveCounters, setLiveCounters, c.id)}
                      testID={`live-counter-${c.id}`}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>✦ {c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.section}>
              <Text style={styles.q}>Anything else?</Text>

              <TouchableOpacity
                style={[styles.toggleRow, needsStaff && styles.toggleRowActive]}
                onPress={() => setNeedsStaff(!needsStaff)}
                testID="needs-staff-toggle"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Service staff</Text>
                  <Text style={styles.toggleDesc}>Servers, captains & cleanup crew</Text>
                </View>
                <View style={[styles.checkbox, needsStaff && styles.checkboxOn]}>
                  {needsStaff && <Ionicons name="checkmark" size={16} color={theme.colors.background} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleRow, needsDecor && styles.toggleRowActive]}
                onPress={() => setNeedsDecor(!needsDecor)}
                testID="needs-decor-toggle"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Decor & ambience</Text>
                  <Text style={styles.toggleDesc}>Buffet styling, table linens, flowers</Text>
                </View>
                <View style={[styles.checkbox, needsDecor && styles.checkboxOn]}>
                  {needsDecor && <Ionicons name="checkmark" size={16} color={theme.colors.background} />}
                </View>
              </TouchableOpacity>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Special requests (optional)</Text>
                <TextInput
                  style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                  placeholder="Allergies, dietary preferences, theme ideas..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  testID="quote-notes-input"
                />
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.section}>
              <Text style={styles.q}>Your instant quote</Text>
              {estimating || !estimate ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 30 }} />
              ) : (
                <>
                  <View style={styles.priceCard}>
                    <Text style={styles.priceLabel}>Estimated total</Text>
                    <Text style={styles.priceAmount}>₹{estimate.total.toLocaleString('en-IN')}</Text>
                    <Text style={styles.priceMeta}>
                      ₹{estimate.per_plate}/plate × {guestCount} guests
                    </Text>
                  </View>
                  <View style={styles.summary}>
                    <SummaryRow label="Event" value={EVENT_TYPES.find((e) => e.id === eventType)?.label || eventType} />
                    <SummaryRow label="Guests" value={guestCount} />
                    {!!eventDate && <SummaryRow label="Date" value={eventDate} />}
                    {!!location && <SummaryRow label="Location" value={location} />}
                    <SummaryRow label="Cuisines" value={cuisines.map((c) => CUISINES.find((x) => x.id === c)?.label).join(', ') || '—'} />
                    <SummaryRow label="Services" value={services.map((s) => SERVICES.find((x) => x.id === s)?.label).join(', ') || '—'} />
                    {liveCounters.length > 0 && (
                      <SummaryRow label="Live counters" value={liveCounters.map((c) => LIVE_COUNTERS.find((x) => x.id === c)?.label).join(', ')} />
                    )}
                    {(needsStaff || needsDecor) && (
                      <SummaryRow
                        label="Extras"
                        value={[needsStaff && 'Staff', needsDecor && 'Decor'].filter(Boolean).join(', ')}
                      />
                    )}
                  </View>
                  <Text style={styles.disclaimer}>
                    * Final pricing is confirmed by our team after a quick call.
                  </Text>
                </>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer nav */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBack, step === 0 && styles.footerDisabled]}
            onPress={back}
            disabled={step === 0}
            testID="quote-back-btn"
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
            <Text style={styles.footerBackText}>Back</Text>
          </TouchableOpacity>

          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.footerNext} onPress={next} testID="quote-next-btn">
              <Text style={styles.footerNextText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.footerNext, submitting && { opacity: 0.6 }]}
              onPress={submit}
              disabled={submitting || !estimate}
              testID="quote-submit-btn"
            >
              {submitting ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <>
                  <Text style={styles.footerNextText}>Submit Inquiry</Text>
                  <Ionicons name="send" size={16} color={theme.colors.background} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, gap: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: theme.colors.surface, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: theme.colors.primary },
  stepName: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 8 },

  body: { padding: 24, paddingBottom: 40 },
  section: { gap: 16 },
  q: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  hint: { color: theme.colors.textMuted, fontSize: 13, marginTop: -8 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: theme.colors.background },
  chipBig: {
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 4,
    backgroundColor: theme.colors.surface, minWidth: '47%',
  },
  chipBigActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipBigText: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  chipBigTextActive: { color: theme.colors.background, fontWeight: '700' },

  bigInput: {
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    fontSize: 48, fontWeight: '700', color: theme.colors.primary,
    paddingVertical: 24, textAlign: 'center', borderRadius: 4, marginTop: 8,
  },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'space-between' },
  quickChip: {
    flex: 1, paddingVertical: 10, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  quickChipText: { color: theme.colors.text, fontWeight: '600' },

  field: { gap: 8 },
  fieldLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  input: {
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    color: theme.colors.text, padding: 14, fontSize: 15, borderRadius: 4,
  },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  toggleRowActive: { borderColor: theme.colors.primary },
  toggleTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  toggleDesc: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 26, height: 26, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },

  priceCard: {
    backgroundColor: theme.colors.surface, padding: 24, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center', marginTop: 8,
  },
  priceLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  priceAmount: { color: theme.colors.text, fontSize: 38, fontWeight: '700', marginTop: 8 },
  priceMeta: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  summary: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4, marginTop: 16, gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue: { color: theme.colors.text, fontSize: 13, flex: 1, textAlign: 'right' },
  disclaimer: { color: theme.colors.textMuted, fontSize: 11, marginTop: 12, textAlign: 'center' },

  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background,
  },
  footerBack: {
    paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border,
  },
  footerDisabled: { opacity: 0.4 },
  footerBackText: { color: theme.colors.text, fontWeight: '600' },
  footerNext: {
    flex: 1, backgroundColor: theme.colors.primary, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 4,
  },
  footerNextText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },

  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  successLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  successTitle: { color: theme.colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  estimateBox: {
    backgroundColor: theme.colors.surface, padding: 20, borderRadius: 4, marginTop: 16,
    borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', width: '100%',
  },
  estimateLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' },
  estimateAmount: { color: theme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 8 },
  estimateMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  successBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 4, marginTop: 12,
  },
  successBtnText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, fontSize: 13, textTransform: 'uppercase' },
  successLink: { marginTop: 8 },
  successLinkText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
});
