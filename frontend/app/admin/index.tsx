import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuth } from '@/src/context/AdminAuth';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { theme, BUSINESS } from '@/src/theme';
import { AdminShell } from '@/src/admin/AdminShell';
import { useSeo } from '@/src/hooks/useSeo';

export default function AdminEntry() {
  const { user, loading } = useAdminAuth();
  useSeo({ title: 'Admin Console — Cosmic Bites' });

  if (loading) {
    return (
      <View style={s.loading}>
        <Ionicons name="hourglass" size={32} color={theme.colors.primary} />
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }
  if (!user) return <LoginScreen />;
  return <AdminShell />;
}

function LoginScreen() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@cosmicbites.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async () => {
    setErr(null); setLoading(true);
    try { await login(email, password); }
    catch (e: any) { setErr(e.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.loginWrap}>
      <ScrollView contentContainerStyle={s.loginScroll}>
        <View style={s.loginCard}>
          <TouchableOpacity onPress={() => router.push('/')} style={s.backLink}>
            <Ionicons name="arrow-back" size={14} color={theme.colors.primary} />
            <Text style={s.backText}>Back to site</Text>
          </TouchableOpacity>

          <View style={s.brandCircle}><Ionicons name="shield-checkmark" size={28} color={theme.colors.bg} /></View>
          <Text style={s.loginTitle}>Admin Console</Text>
          <Text style={s.loginSub}>{BUSINESS.name} — protected area</Text>

          <View style={{ gap: 14, marginTop: 8 }}>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="admin@cosmicbites.com" autoCapitalize="none" keyboardType="email-address" testID="admin-email" />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry testID="admin-password" />
          </View>

          {err && (
            <View style={s.errBox}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
              <Text style={s.errText}>{err}</Text>
            </View>
          )}

          <Button label="Sign In" icon="log-in" onPress={handle} loading={loading} full testID="admin-login" />

          <View style={s.hintBox}>
            <Text style={s.hint}>Default: admin@cosmicbites.com / Admin@123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg, gap: 12 },
  loadingText: { color: theme.colors.textMuted },

  loginWrap: { flex: 1, backgroundColor: theme.colors.bg, minHeight: '100%' as any },
  loginScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loginCard: { width: '100%', maxWidth: 420, backgroundColor: theme.colors.surface, padding: 32, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, gap: 12 },
  backLink: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 8, alignSelf: 'flex-start' },
  backText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  brandCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 4 },
  loginTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  loginSub: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 8 },
  errBox: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: 'rgba(209,80,63,0.12)', borderRadius: 4, alignItems: 'center' },
  errText: { color: theme.colors.danger, fontSize: 12, flex: 1 },
  hintBox: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  hint: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', fontStyle: 'italic' },
});
