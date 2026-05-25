import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { theme, BUSINESS } from '@/src/theme';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <View style={styles.brand}>
        <Text style={styles.logoMark}>✦</Text>
        <Text style={styles.brandName}>{BUSINESS.name}</Text>
        <Text style={styles.brandTag}>{BUSINESS.tagline}</Text>
      </View>
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  brand: { alignItems: 'center', gap: 8 },
  logoMark: { color: theme.colors.primary, fontSize: 48, letterSpacing: 2 },
  brandName: {
    color: theme.colors.text,
    fontSize: 36,
    letterSpacing: 4,
    fontWeight: '700',
  },
  brandTag: {
    color: theme.colors.primary,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
