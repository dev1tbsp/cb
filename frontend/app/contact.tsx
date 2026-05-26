import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageShell } from '@/src/components/PageShell';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { theme, BUSINESS } from '@/src/theme';
import { api } from '@/src/api';
import { useSeo } from '@/src/hooks/useSeo';

const EVENT_OPTIONS = ['Birthday', 'House Party', 'Housewarming', 'Pre-Wedding', 'Corporate', 'Festive', 'Other'];

export default function ContactPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 880;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: 'Contact Us — Cosmic Bites Catering',
    description: 'Get in touch with Cosmic Bites for catering enquiries. Call, WhatsApp, email or send us a message — we respond within 24 hours.',
  });

  const submit = async () => {
    setError(null);
    if (!name || !email || !message) { setError('Please fill name, email and message.'); return; }
    setSubmitting(true);
    try {
      await api.post('/inquiries', { name, email, phone: phone || undefined, subject: subject || undefined, message });
      setSubmitted(true);
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (e: any) {
      setError(e.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <View style={[s.hero, isWide && { paddingVertical: 80, paddingHorizontal: 56 }]}>
        <Text style={s.eyebrow}>Get in Touch</Text>
        <Text style={[s.title, isWide && { fontSize: 48 }]}>Let's plan your event</Text>
        <Text style={s.sub}>Tell us about your event — we'll get back within 24 hours with a tailored proposal.</Text>
      </View>

      {/* Contact options */}
      <View style={[s.cards, isWide && { paddingHorizontal: 56, flexDirection: 'row' }]}>
        <ContactCard icon="call" label="Call us" value={BUSINESS.phone} onPress={() => Linking.openURL(`tel:${BUSINESS.phone}`)} />
        <ContactCard icon="logo-whatsapp" label="WhatsApp" value={BUSINESS.phone} onPress={() => Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`)} />
        <ContactCard icon="mail" label="Email" value={BUSINESS.email} onPress={() => Linking.openURL(`mailto:${BUSINESS.email}`)} />
        <ContactCard icon="logo-instagram" label="Instagram" value="@cosmicbites" onPress={() => Linking.openURL(BUSINESS.insta)} />
      </View>

      {/* Form */}
      <View style={[s.formWrap, isWide && { paddingHorizontal: 56 }]}>
        <View style={[s.formCard, isWide && { padding: 36 }]}>
          <Text style={s.formTitle}>Send us a message</Text>
          <Text style={s.formSub}>Share your event details and our team will craft a custom proposal.</Text>

          {submitted && (
            <View style={s.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={s.successText}>Thanks! We've received your message and will reach out within 24 hours.</Text>
            </View>
          )}
          {error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <View style={s.formGrid}>
            <View style={[s.formField, isWide && { width: '48%' }]}>
              <Input label="Name *" value={name} onChangeText={setName} placeholder="Your full name" testID="contact-name" />
            </View>
            <View style={[s.formField, isWide && { width: '48%' }]}>
              <Input label="Email *" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" testID="contact-email" />
            </View>
            <View style={[s.formField, isWide && { width: '48%' }]}>
              <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 9999999999" keyboardType="phone-pad" testID="contact-phone" />
            </View>
            <View style={[s.formField, isWide && { width: '48%' }]}>
              <Text style={s.fieldLabel}>Event Type</Text>
              <View style={s.chipRow}>
                {EVENT_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt} onPress={() => setSubject(opt)} style={[s.chip, subject === opt && s.chipActive]}>
                    <Text style={[s.chipText, subject === opt && s.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[s.formField, { width: '100%' }]}>
              <Input label="Message *" value={message} onChangeText={setMessage} placeholder="Tell us about your event — date, guests, location, cuisines..." multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: 'top' }} testID="contact-message" />
            </View>
          </View>

          <View style={s.formFooter}>
            <Button label="Send Message" icon="send" onPress={submit} loading={submitting} testID="contact-submit" />
          </View>
        </View>
      </View>
    </PageShell>
  );
}

function ContactCard({ icon, label, value, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={s.cCard}>
      <View style={s.cIcon}><Ionicons name={icon} size={20} color={theme.colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={s.cLabel}>{label}</Text>
        <Text style={s.cValue}>{value}</Text>
      </View>
      <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingVertical: 48, gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700' },
  sub: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 23, maxWidth: 700, marginTop: 8 },

  cards: { paddingHorizontal: 24, gap: 10, flexWrap: 'wrap' },
  cCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, flex: 1, minWidth: 200, marginBottom: 10 },
  cIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  cLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  cValue: { color: theme.colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },

  formWrap: { paddingHorizontal: 24, marginTop: 24, marginBottom: 24 },
  formCard: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 16 },
  formTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  formSub: { color: theme.colors.textMuted, fontSize: 13 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: '4%' as any, rowGap: 14 as any },
  formField: { width: '100%', marginBottom: 4 },
  fieldLabel: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: theme.colors.bg },
  formFooter: { marginTop: 8, flexDirection: 'row' },
  successBox: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: 'rgba(79,163,122,0.12)', borderWidth: 1, borderColor: theme.colors.success, borderRadius: 4, alignItems: 'center' },
  successText: { color: theme.colors.text, fontSize: 13, flex: 1 },
  errorBox: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: 'rgba(209,80,63,0.12)', borderWidth: 1, borderColor: theme.colors.danger, borderRadius: 4, alignItems: 'center' },
  errorText: { color: theme.colors.text, fontSize: 13, flex: 1 },
});
