import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/api/client';
import { theme, BUSINESS } from '@/src/theme';

interface QuoteSummary {
  id: string;
  event_type: string;
  guest_count: number;
  estimated_total: number;
  estimated_per_plate: number;
  status: string;
  created_at: string;
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [anniversary, setAnniversary] = useState(user?.anniversary || '');
  const [address, setAddress] = useState(user?.address || '');
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<QuoteSummary[]>('/quotes/my');
        setQuotes(data);
      } catch (e) {
        console.warn('quotes load', e);
      } finally {
        setLoadingQuotes(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDob(user.dob || '');
      setAnniversary(user.anniversary || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone, dob, anniversary, address });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || '');
    } finally {
      setSaving(false);
    }
  };

  const doLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'C'}</Text>
            </View>
            <Text style={styles.name} testID="profile-name">{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>✦ ADMIN</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Personal details</Text>
              {!editing ? (
                <TouchableOpacity onPress={() => setEditing(true)} testID="profile-edit-btn">
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={save} disabled={saving} testID="profile-save-btn">
                  {saving ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={styles.editLink}>Save</Text>}
                </TouchableOpacity>
              )}
            </View>

            <Field label="Full Name" value={name} onChange={setName} editing={editing} testID="profile-name-input" />
            <Field label="Phone" value={phone} onChange={setPhone} editing={editing} keyboardType="phone-pad" testID="profile-phone-input" />
            <Field label="Address" value={address} onChange={setAddress} editing={editing} multiline testID="profile-address-input" />
            <Field label="Date of Birth" value={dob} onChange={setDob} editing={editing} placeholder="DD MMM YYYY" testID="profile-dob-input" />
            <Field label="Anniversary" value={anniversary} onChange={setAnniversary} editing={editing} placeholder="DD MMM YYYY" testID="profile-anniversary-input" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My quotes & inquiries</Text>
            {loadingQuotes ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 12 }} />
            ) : quotes.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No quotes yet</Text>
                <TouchableOpacity onPress={() => router.push('/quote')} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Build your first quote</Text>
                </TouchableOpacity>
              </View>
            ) : (
              quotes.map((q) => (
                <View key={q.id} style={styles.quoteCard} testID={`my-quote-${q.id}`}>
                  <View style={styles.quoteHead}>
                    <View>
                      <Text style={styles.quoteEvent}>{q.event_type.replace('_', ' ').toUpperCase()}</Text>
                      <Text style={styles.quoteGuests}>{q.guest_count} guests</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{q.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.quoteAmount}>
                    <Text style={styles.quoteTotal}>₹{q.estimated_total.toLocaleString('en-IN')}</Text>
                    <Text style={styles.quotePer}>₹{q.estimated_per_plate}/plate</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.contactRow} onPress={openWhatsApp} testID="profile-whatsapp">
            <Ionicons name="logo-whatsapp" size={20} color={theme.colors.primary} />
            <Text style={styles.contactText}>Chat with us on WhatsApp</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={doLogout} testID="profile-logout-btn">
            <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, editing, placeholder, keyboardType, multiline, testID,
}: any) {
  return (
    <View style={fStyles.field}>
      <Text style={fStyles.label}>{label}</Text>
      {editing ? (
        <TextInput
          style={[fStyles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          testID={testID}
        />
      ) : (
        <Text style={fStyles.value} testID={testID}>{value || '—'}</Text>
      )}
    </View>
  );
}

const fStyles = StyleSheet.create({
  field: { gap: 6, marginTop: 14 },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  value: { color: theme.colors.text, fontSize: 15, paddingVertical: 4 },
  input: {
    backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border,
    color: theme.colors.text, padding: 12, fontSize: 14, borderRadius: 4,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 24, gap: 18, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 6, paddingVertical: 12 },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarText: { color: theme.colors.background, fontSize: 36, fontWeight: '700' },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  email: { color: theme.colors.textMuted, fontSize: 13 },
  adminBadge: { backgroundColor: 'rgba(230,176,77,0.15)', paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, borderWidth: 1, borderColor: theme.colors.primary },
  adminText: { color: theme.colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  section: {
    backgroundColor: theme.colors.surface, padding: 18, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border, gap: 4,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  editLink: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  emptyBox: { alignItems: 'center', padding: 20, gap: 10 },
  emptyText: { color: theme.colors.textMuted },
  emptyBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4 },
  emptyBtnText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  quoteCard: { backgroundColor: theme.colors.background, padding: 14, borderRadius: 4, marginTop: 10, borderWidth: 1, borderColor: theme.colors.border, gap: 10 },
  quoteHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  quoteEvent: { color: theme.colors.primary, fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  quoteGuests: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
  statusBadge: { backgroundColor: 'rgba(230,176,77,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.primary },
  statusText: { color: theme.colors.primary, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  quoteAmount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10 },
  quoteTotal: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  quotePer: { color: theme.colors.textMuted, fontSize: 12 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 4,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  contactText: { color: theme.colors.text, flex: 1, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.danger,
  },
  logoutText: { color: theme.colors.danger, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
});
