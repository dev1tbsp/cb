import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';
import { theme } from '@/src/theme';

interface Service {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  icon: string;
  image?: string;
  features: string[];
}

const ICON_MAP: Record<string, any> = {
  gift: 'gift',
  home: 'home',
  key: 'key',
  heart: 'heart',
  briefcase: 'briefcase',
  star: 'star',
  flame: 'flame',
  package: 'cube',
};

export default function Services() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Service[]>('/services', { auth: false });
        setServices(data);
      } catch (e) {
        console.warn('services load', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="services-back">
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>What we do</Text>
              <Text style={styles.title}>Catering Services</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            services.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() => router.push('/quote')}
                testID={`service-card-${s.id}`}
              >
                {s.image && (
                  <View style={styles.imgWrap}>
                    <Image source={{ uri: s.image }} style={styles.img} />
                    <View style={styles.imgOverlay} />
                    <View style={styles.iconCircle}>
                      <Ionicons name={ICON_MAP[s.icon] || 'restaurant'} size={20} color={theme.colors.background} />
                    </View>
                  </View>
                )}
                <View style={styles.body}>
                  <Text style={styles.cardTitle}>{s.title}</Text>
                  <Text style={styles.cardDesc}>{s.description}</Text>
                  <View style={styles.features}>
                    {s.features.map((f, i) => (
                      <View key={i} style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={12} color={theme.colors.primary} />
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.priceLabel}>Starting from</Text>
                      <Text style={styles.priceVal}>₹{s.starting_price}/plate</Text>
                    </View>
                    <View style={styles.ctaArrow}>
                      <Text style={styles.ctaArrowText}>Get Quote</Text>
                      <Ionicons name="arrow-forward" size={14} color={theme.colors.background} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 24, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  label: { color: theme.colors.primary, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  imgWrap: { height: 140, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,21,17,0.35)' },
  iconCircle: {
    position: 'absolute', top: 12, right: 12,
    width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 16, gap: 10 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  cardDesc: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  features: { gap: 6, marginTop: 4 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { color: theme.colors.text, fontSize: 12, opacity: 0.85 },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
  priceLabel: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2, fontWeight: '700' },
  priceVal: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 },
  ctaArrow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4,
  },
  ctaArrowText: { color: theme.colors.background, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 },
});
