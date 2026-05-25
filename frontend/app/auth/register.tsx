import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { theme, BUSINESS } from '@/src/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name || !email || !password) {
      setError('Please fill all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), phone.trim(), password);
      router.replace('/home');
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logoMark}>✦</Text>
            <Text style={styles.brand}>{BUSINESS.name}</Text>
            <Text style={styles.tag}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Join the feast</Text>
            <Text style={styles.subtitle}>Quote, book and reorder in seconds</Text>

            {error && (
              <View style={styles.errorBox} testID="register-error">
                <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Priya Sharma"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
                testID="register-name-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                testID="register-email-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 99990 00000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                testID="register-phone-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                testID="register-password-input"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={submit}
              disabled={loading}
              testID="register-submit-btn"
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already a member? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity testID="register-go-login">
                  <Text style={styles.footerLink}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, padding: 24, gap: 24, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 6, marginTop: 20 },
  logoMark: { color: theme.colors.primary, fontSize: 38 },
  brand: { color: theme.colors.text, fontSize: 26, fontWeight: '700', letterSpacing: 3 },
  tag: {
    color: theme.colors.primary,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 24,
    gap: 16,
  },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: theme.colors.textMuted, fontSize: 14 },
  field: { gap: 8 },
  label: {
    color: theme.colors.primary,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    padding: 14,
    fontSize: 15,
    borderRadius: 4,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: theme.colors.background,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontSize: 14,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: theme.colors.textMuted },
  footerLink: { color: theme.colors.primary, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
  },
  errorText: { color: theme.colors.danger, fontSize: 13, flex: 1 },
});
