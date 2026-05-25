import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Linking, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme, BUSINESS } from '@/src/theme';
import { useSeo } from '@/src/hooks/use-seo';
import { SiteHeader, SiteFooter } from '@/src/components/SiteShell';

export default function ContactPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  useSeo({
    title: 'Contact Cosmic Bites — Pure Vegetarian Catering Inquiries',
    description: 'Get in touch with Cosmic Bites for catering inquiries. Call, WhatsApp, or send a message. We respond within 2 hours.',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name || !email || !message) {
      setError('Please fill all required fields');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await api.post('/inquiries', { name, email, phone: phone || null, subject: subject || null, message }, { auth: false });
      setSent(true);
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (e: any) {
      setError(e?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.page}>
      <SiteHeader />

      <View style={[styles.head, isWide && { paddingHorizontal: 48 }]}>
        <Text style={styles.eyebrow}>Let's talk</Text>
        <Text style={[styles.title, isWide && { fontSize: 56 }]}>Contact Cosmic Bites</Text>
        <Text style={styles.lede}>
          Tell us about your event — we respond within 2 hours, weekdays.
        </Text>
      </View>

      <View style={[styles.layout, isWide && styles.layoutWide]}>
        {/* Info column */}
        <View style={styles.infoCol}>
          <InfoCard
            icon="call"
            label="Call"
            value={BUSINESS.phone}
            onPress={() => Linking.openURL(`tel:${BUSINESS.phone}`)}
          />
          <InfoCard
            icon="logo-whatsapp"
            label="WhatsApp"
            value={`+${BUSINESS.whatsapp}`}
            onPress={() => Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`)}
          />
          <InfoCard
            icon="mail"
            label="Email"
            value={BUSINESS.email}
            onPress={() => Linking.openURL(`mailto:${BUSINESS.email}`)}
          />
          <InfoCard
            icon="logo-instagram"
            label="Instagram"
            value={`@${BUSINESS.instagram}`}
            onPress={() => Linking.openURL(`https://instagram.com/${BUSINESS.instagram}`)}
          />
        </View>

        {/* Form column */}
        <View style={styles.formCol}>
          {sent ? (
            <View style={styles.sentBox}>
              <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
              <Text style={styles.sentTitle}>Message received</Text>
              <Text style={styles.sentSub}>We'll be in touch within 2 hours.</Text>
              <TouchableOpacity onPress={() => setSent(false)}>
                <Text style={styles.sentLink}>Send another message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Send a message</Text>
              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              <Input label="Your name *" value={name} onChange={setName} testID="contact-name" />
              <Input label="Email *" value={email} onChange={setEmail} keyboardType="email-address" testID="contact-email" />
              <Input label="Phone" value={phone} onChange={setPhone} keyboardType="phone-pad" testID="contact-phone" />
              <Input label="Subject" value={subject} onChange={setSubject} testID="contact-subject" />
              <Input label="Message *" value={message} onChange={setMessage} multiline testID="contact-message" />
              <TouchableOpacity
                style={[styles.submit, sending && { opacity: 0.6 }]}
                onPress={submit}
                disabled={sending}
                testID="contact-submit"
              >
                {sending ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color={theme.colors.background} />
                    <Text style={styles.submitText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <SiteFooter />
    </ScrollView>
  );
}

function InfoCard({ icon, label, value, onPress }: any) {
  return (
    <TouchableOpacity style={styles.infoCard} onPress={onPress}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

function Input({ label, value, onChange, multiline, keyboardType, testID }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 110, textAlignVertical: 'top' }]}
        placeholder=""
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  head: { padding: 24, paddingTop: 48, gap: 10 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '700' },
  lede: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 24 },
  layout: { padding: 24, gap: 24 },
  layoutWide: { flexDirection: 'row', paddingHorizontal: 48, gap: 32, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  infoCol: { gap: 12, flex: 1 },
  formCol: { flex: 2 },
  infoCard: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  infoIcon: { width: 40, height: 40, borderRadius: 4, backgroundColor: 'rgba(230,176,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  infoValue: { color: theme.colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },

  form: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border, gap: 12 },
  formTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  field: { gap: 6 },
  fieldLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, padding: 14, fontSize: 14, borderRadius: 4 },
  submit: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.primary, padding: 14, borderRadius: 4, marginTop: 8,
  },
  submitText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
  errorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: 'rgba(248,113,113,0.1)', borderColor: theme.colors.danger, borderWidth: 1, padding: 10, borderRadius: 4 },
  errorText: { color: theme.colors.danger, fontSize: 13, flex: 1 },
  sentBox: { backgroundColor: theme.colors.surface, padding: 32, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.success, alignItems: 'center', gap: 10 },
  sentTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  sentSub: { color: theme.colors.textMuted, fontSize: 14 },
  sentLink: { color: theme.colors.primary, fontWeight: '700', marginTop: 8 },
});
