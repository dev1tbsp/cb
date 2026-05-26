import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageShell } from '@/src/components/PageShell';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { theme, BUSINESS } from '@/src/theme';
import { api } from '@/src/api';
import { useSeo } from '@/src/hooks/useSeo';

// Pricing keys MUST match backend keys in /api/quotes/estimate
const EVENT_TYPES = ['Birthday', 'House Party', 'Housewarming', 'Pre-Wedding', 'Wedding', 'Corporate', 'Festive', 'Other'];

const CUISINES: { key: string; label: string; premium: number }[] = [
  { key: 'north_indian', label: 'North Indian', premium: 50 },
  { key: 'south_indian', label: 'South Indian', premium: 50 },
  { key: 'chinese', label: 'Chinese', premium: 80 },
  { key: 'italian', label: 'Italian', premium: 120 },
  { key: 'chaat', label: 'Chaat', premium: 40 },
  { key: 'snacks', label: 'Snacks & Starters', premium: 40 },
  { key: 'desserts', label: 'Desserts', premium: 80 },
  { key: 'mocktails', label: 'Mocktails', premium: 60 },
  { key: 'kids', label: 'Kids Menu', premium: 30 },
  { key: 'jain', label: 'Jain Options', premium: 40 },
];

const SERVICES: { key: string; label: string; help: string }[] = [
  { key: 'full_catering', label: 'Full Catering', help: 'End-to-end: setup, serving, cleanup (+25%)' },
  { key: 'live_counters', label: 'Live Counters', help: 'Interactive cooking stations (+15%)' },
];

const LIVE_COUNTERS = ['Dosa', 'Pasta', 'Chaat', 'Tandoor', 'Pav Bhaji', 'Pani Puri', 'Salad Bar', 'Ice Cream'];

const GUEST_PRESETS = [25, 50, 100, 150, 250, 500];

export default function QuotePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 980;

  // Form state
  const [eventType, setEventType] = useState('Birthday');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('100');
  const [location, setLocation] = useState('');
  const [cuisines, setCuisines] = useState<string[]>(['north_indian', 'chaat']);
  const [services, setServices] = useState<string[]>(['full_catering']);
  const [liveCounters, setLiveCounters] = useState<string[]>([]);
  const [needsStaff, setNeedsStaff] = useState(true);
  const [needsDecor, setNeedsDecor] = useState(false);
  const [notes, setNotes] = useState('');

  // Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Estimate
  const [estimate, setEstimate] = useState<{ per_plate: number; total: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);

  useSeo({
    title: 'Get a Quote — Cosmic Bites Catering',
    description: 'Build an instant catering quote — pick your event, cuisines, services & live counters. Live pricing as you build.',
  });

  // Debounced live estimate
  const guests = useMemo(() => Math.max(1, parseInt(guestCount) || 0), [guestCount]);
  const payload = useMemo(() => ({
    event_type: eventType,
    guest_count: guests,
    event_date: eventDate || undefined,
    location: location || undefined,
    cuisines,
    services,
    live_counters: liveCounters,
    needs_staff: needsStaff,
    needs_decor: needsDecor,
    notes: notes || undefined,
  }), [eventType, guests, eventDate, location, cuisines, services, liveCounters, needsStaff, needsDecor, notes]);

  const tRef = useRef<any>(null);
  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    setEstimating(true);
    tRef.current = setTimeout(async () => {
      try {
        const r = await api.post('/quotes/estimate', payload);
        setEstimate({ per_plate: r.per_plate, total: r.total });
      } catch (e) {
        // silent
      } finally {
        setEstimating(false);
      }
    }, 350);
    return () => tRef.current && clearTimeout(tRef.current);
  }, [payload]);

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const submit = async () => {
    setErr(null);
    if (!name.trim() || !email.trim()) { setErr('Please share your name and email so we can reach out.'); return; }
    if (!guests || guests < 1) { setErr('Guest count must be at least 1.'); return; }
    setSubmitting(true);
    try {
      const r = await api.post('/quotes/public', {
        ...payload,
        contact_name: name.trim(),
        contact_email: email.trim(),
        contact_phone: phone.trim() || undefined,
      });
      setSubmittedQuote(r);
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setErr(e.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedQuote) {
    return (
      <PageShell>
        <View style={[s.success, isWide && { padding: 56 }]}>
          <View style={s.successIcon}><Ionicons name="checkmark-circle" size={56} color={theme.colors.success} /></View>
          <Text style={s.successTitle}>Quote received!</Text>
          <Text style={s.successSub}>Thanks {submittedQuote.user_name}. Here's your indicative estimate. Our team will reach out within 24 hours to finalise the menu and confirm logistics.</Text>

          <View style={s.successCard}>
            <View style={s.row}>
              <Text style={s.lbl}>Event</Text>
              <Text style={s.val}>{submittedQuote.event_type} · {submittedQuote.guest_count} guests</Text>
            </View>
            {submittedQuote.event_date ? <View style={s.row}><Text style={s.lbl}>Date</Text><Text style={s.val}>{submittedQuote.event_date}</Text></View> : null}
            {submittedQuote.location ? <View style={s.row}><Text style={s.lbl}>Location</Text><Text style={s.val}>{submittedQuote.location}</Text></View> : null}
            <View style={[s.row, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginTop: 6 }]}>
              <Text style={s.lbl}>Per plate</Text>
              <Text style={s.priceVal}>₹{submittedQuote.estimated_per_plate.toLocaleString('en-IN')}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.totalLbl}>Estimated total</Text>
              <Text style={s.totalVal}>₹{submittedQuote.estimated_total.toLocaleString('en-IN')}</Text>
            </View>
            <Text style={s.disclaimer}>* Indicative. Final pricing depends on confirmed menu, season & customisations.</Text>
          </View>

          <View style={s.successCtas}>
            <Button label="Back to Home" icon="home" variant="outline" onPress={() => router.push('/')} />
            <Button label="Build Another" icon="refresh" onPress={() => { setSubmittedQuote(null); }} />
          </View>
        </View>
      </PageShell>
    );
  }

  const formBody = (
    <View style={{ gap: 26 }}>
      {/* Step 1 */}
      <Section step="01" title="Event details">
        <Field label="Event Type">
          <ChipRow options={EVENT_TYPES} value={[eventType]} onToggle={(v) => setEventType(v)} single />
        </Field>
        <View style={[s.fieldRow, isWide && { flexDirection: 'row', gap: 14 }]}>
          <View style={{ flex: 1 }}>
            <Input label="Event Date" placeholder="e.g. 12 Dec 2025" value={eventDate} onChangeText={setEventDate} testID="quote-date" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Location / City" placeholder="e.g. Mumbai, Bandra" value={location} onChangeText={setLocation} testID="quote-location" />
          </View>
        </View>
        <Field label="Guest Count">
          <View style={s.guestRow}>
            <View style={s.guestInputWrap}>
              <Input value={guestCount} onChangeText={(v) => setGuestCount(v.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholder="100" testID="quote-guests" />
            </View>
            <View style={s.presetWrap}>
              {GUEST_PRESETS.map((g) => (
                <TouchableOpacity key={g} onPress={() => setGuestCount(String(g))} style={[s.preset, parseInt(guestCount) === g && s.presetActive]}>
                  <Text style={[s.presetText, parseInt(guestCount) === g && s.presetTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Field>
      </Section>

      {/* Step 2 */}
      <Section step="02" title="Cuisines (select all you'd like)">
        <View style={s.chipGrid}>
          {CUISINES.map((c) => (
            <TouchableOpacity key={c.key} onPress={() => toggle(cuisines, c.key, setCuisines)} style={[s.chipCard, cuisines.includes(c.key) && s.chipCardActive]} testID={`quote-cuisine-${c.key}`}>
              <View style={s.chipCardHead}>
                <Ionicons name={cuisines.includes(c.key) ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={cuisines.includes(c.key) ? theme.colors.bg : theme.colors.primary} />
                <Text style={[s.chipCardText, cuisines.includes(c.key) && { color: theme.colors.bg }]}>{c.label}</Text>
              </View>
              <Text style={[s.chipCardPrice, cuisines.includes(c.key) && { color: theme.colors.bg, opacity: 0.85 }]}>+₹{c.premium}/plate</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* Step 3 */}
      <Section step="03" title="Services & extras">
        <View style={{ gap: 10 }}>
          {SERVICES.map((sv) => (
            <TouchableOpacity key={sv.key} onPress={() => toggle(services, sv.key, setServices)} style={[s.bigToggle, services.includes(sv.key) && s.bigToggleActive]} testID={`quote-service-${sv.key}`}>
              <Ionicons name={services.includes(sv.key) ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={services.includes(sv.key) ? theme.colors.bg : theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[s.bigToggleTitle, services.includes(sv.key) && { color: theme.colors.bg }]}>{sv.label}</Text>
                <Text style={[s.bigToggleHelp, services.includes(sv.key) && { color: 'rgba(11,21,17,0.85)' }]}>{sv.help}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {services.includes('live_counters') && (
          <View style={{ marginTop: 14 }}>
            <Text style={s.fLbl}>Choose live counters (+₹80/plate each)</Text>
            <View style={s.smallChipRow}>
              {LIVE_COUNTERS.map((lc) => (
                <TouchableOpacity key={lc} onPress={() => toggle(liveCounters, lc, setLiveCounters)} style={[s.smallChip, liveCounters.includes(lc) && s.smallChipActive]}>
                  <Text style={[s.smallChipText, liveCounters.includes(lc) && s.smallChipTextActive]}>{lc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 14, gap: 8 }}>
          <ToggleRow label="Add serving staff" help="Uniformed waitstaff for the event" value={needsStaff} onChange={setNeedsStaff} />
          <ToggleRow label="Add decor" help="Tablescaping, themed setup, florals" value={needsDecor} onChange={setNeedsDecor} />
        </View>
      </Section>

      {/* Step 4 */}
      <Section step="04" title="Anything else?">
        <Input label="Notes (optional)" placeholder="Allergies, theme, special requests..." value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={{ minHeight: 90, textAlignVertical: 'top' }} testID="quote-notes" />
      </Section>

      {/* Step 5 */}
      <Section step="05" title="Your contact">
        <View style={[s.fieldRow, isWide && { flexDirection: 'row', gap: 14 }]}>
          <View style={{ flex: 1 }}><Input label="Full Name *" value={name} onChangeText={setName} placeholder="Your name" testID="quote-name" /></View>
          <View style={{ flex: 1 }}><Input label="Email *" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" testID="quote-email" /></View>
        </View>
        <Input label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="+91 9999999999" keyboardType="phone-pad" testID="quote-phone" />
      </Section>

      {err && (
        <View style={s.errBox}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
          <Text style={s.errText}>{err}</Text>
        </View>
      )}

      <Button label="Submit Quote Request" icon="paper-plane" onPress={submit} loading={submitting} testID="quote-submit" />
      <Text style={s.disclaimer}>By submitting, you agree to be contacted by {BUSINESS.name} regarding your event. Indicative pricing only — final quote shared after consultation.</Text>
    </View>
  );

  const summary = (
    <View style={[s.summary, isWide && s.summaryWide]}>
      <Text style={s.sumEyebrow}>Live Estimate</Text>
      <Text style={s.sumLabel}>{guests} guest{guests !== 1 ? 's' : ''} · {eventType}</Text>

      <View style={s.priceBlock}>
        <Text style={s.priceSmall}>{estimating ? 'Estimating…' : 'Per plate'}</Text>
        <Text style={s.pricePerPlate}>₹{estimate ? estimate.per_plate.toLocaleString('en-IN') : '—'}</Text>
        <View style={s.divider} />
        <Text style={s.priceSmall}>Estimated total</Text>
        <Text style={s.priceTotal}>₹{estimate ? estimate.total.toLocaleString('en-IN') : '—'}</Text>
      </View>

      <View style={s.breakdownBlock}>
        <BreakdownRow label="Cuisines" value={`${cuisines.length} selected`} />
        {services.length > 0 && <BreakdownRow label="Services" value={services.map((x) => x.replace('_', ' ')).join(', ')} />}
        {liveCounters.length > 0 && <BreakdownRow label="Live counters" value={`${liveCounters.length}`} />}
        {needsStaff && <BreakdownRow label="Staff" value="Included" />}
        {needsDecor && <BreakdownRow label="Decor" value="Included" />}
      </View>

      <Text style={s.disclaimer}>Estimate updates as you build. Final pricing confirmed after consultation.</Text>
    </View>
  );

  return (
    <PageShell>
      <View style={[s.hero, isWide && { paddingHorizontal: 56, paddingVertical: 80 }]}>
        <Text style={s.eyebrow}>Quote Builder</Text>
        <Text style={[s.title, isWide && { fontSize: 48 }]}>Build your custom quote</Text>
        <Text style={s.sub}>Configure your event below and watch the live estimate update in real time. Submit when you're ready and our team will reach out within 24 hours.</Text>
      </View>

      <View style={[s.layout, isWide && { flexDirection: 'row', paddingHorizontal: 56, gap: 32, alignItems: 'flex-start' }]}>
        <View style={[s.formCol, isWide && { flex: 1.6 }]}>{formBody}</View>
        <View style={[s.sumCol, isWide && { flex: 1, position: 'sticky' as any, top: 90 }]}>{summary}</View>
      </View>
    </PageShell>
  );
}

function Section({ step, title, children }: any) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <View style={s.stepBadge}><Text style={s.stepText}>{step}</Text></View>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

function Field({ label, children }: any) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.fLbl}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({ options, value, onToggle, single }: any) {
  return (
    <View style={s.smallChipRow}>
      {options.map((o: string) => {
        const active = value.includes(o);
        return (
          <TouchableOpacity key={o} onPress={() => onToggle(o)} style={[s.smallChip, active && s.smallChipActive]}>
            <Text style={[s.smallChipText, active && s.smallChipTextActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ToggleRow({ label, help, value, onChange }: any) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={[s.toggleRow, value && s.toggleRowActive]}>
      <Ionicons name={value ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={value ? theme.colors.bg : theme.colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[s.toggleRowTitle, value && { color: theme.colors.bg }]}>{label}</Text>
        <Text style={[s.toggleRowHelp, value && { color: 'rgba(11,21,17,0.85)' }]}>{help}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BreakdownRow({ label, value }: any) {
  return (
    <View style={s.brRow}>
      <Text style={s.brLbl}>{label}</Text>
      <Text style={s.brVal}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingVertical: 48, gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 23, maxWidth: 720, marginTop: 8 },

  layout: { padding: 24, gap: 24 },
  formCol: {},
  sumCol: {},

  section: { backgroundColor: theme.colors.surface, padding: 22, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  stepBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  stepText: { color: theme.colors.primary, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700', flex: 1 },

  fieldRow: { gap: 12 },
  fLbl: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },

  guestRow: { gap: 10 },
  guestInputWrap: { maxWidth: 180 },
  presetWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  presetActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  presetText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  presetTextActive: { color: theme.colors.bg },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipCard: { flexBasis: '48%', flexGrow: 1, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, gap: 4 },
  chipCardActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipCardText: { color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
  chipCardPrice: { color: theme.colors.primary, fontSize: 11, marginLeft: 24 },

  bigToggle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  bigToggleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  bigToggleTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  bigToggleHelp: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },

  smallChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  smallChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  smallChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  smallChipText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  smallChipTextActive: { color: theme.colors.bg },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  toggleRowActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleRowTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  toggleRowHelp: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },

  summary: { backgroundColor: theme.colors.surface, padding: 22, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 14 },
  summaryWide: { padding: 24 },
  sumEyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  sumLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  priceBlock: { padding: 16, borderRadius: 6, backgroundColor: theme.colors.surfaceAlt, gap: 6 },
  priceSmall: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  pricePerPlate: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 6 },
  priceTotal: { color: theme.colors.primary, fontSize: 30, fontWeight: '700' },
  breakdownBlock: { gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
  brRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  brLbl: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  brVal: { color: theme.colors.text, fontSize: 12, fontWeight: '600', textTransform: 'capitalize', flexShrink: 1, textAlign: 'right' },

  errBox: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: 'rgba(209,80,63,0.12)', borderWidth: 1, borderColor: theme.colors.danger, borderRadius: 4, alignItems: 'center' },
  errText: { color: theme.colors.text, fontSize: 13, flex: 1 },

  disclaimer: { color: theme.colors.textMuted, fontSize: 11, fontStyle: 'italic', lineHeight: 16 },

  // Success
  success: { padding: 24, paddingTop: 56, alignItems: 'center', gap: 14, maxWidth: 600, alignSelf: 'center' },
  successIcon: { padding: 16 },
  successTitle: { color: theme.colors.text, fontSize: 32, fontWeight: '700', textAlign: 'center' },
  successSub: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, maxWidth: 480 },
  successCard: { width: '100%', backgroundColor: theme.colors.surface, padding: 22, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 10, marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  lbl: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '700' },
  val: { color: theme.colors.text, fontSize: 14, fontWeight: '600', textAlign: 'right', flex: 1 },
  priceVal: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  totalLbl: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  totalVal: { color: theme.colors.primary, fontSize: 26, fontWeight: '700' },
  successCtas: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
});
