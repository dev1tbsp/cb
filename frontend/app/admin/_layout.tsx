import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { theme } from '@/src/theme';

const NAV = [
  { route: '/admin', label: 'Dashboard', icon: 'grid' },
  { route: '/admin/quotes', label: 'Quotes', icon: 'receipt' },
  { route: '/admin/inquiries', label: 'Queries', icon: 'mail' },
  { route: '/admin/menu', label: 'Menu Items', icon: 'restaurant' },
  { route: '/admin/services', label: 'Services', icon: 'briefcase' },
  { route: '/admin/portfolio', label: 'Portfolio', icon: 'images' },
  { route: '/admin/testimonials', label: 'Testimonials', icon: 'star' },
  { route: '/admin/clients', label: 'Clients', icon: 'business' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/auth/login');
      else if (user.role !== 'admin') router.replace('/home');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <View style={[styles.shell, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>Checking access…</Text>
      </View>
    );
  }
    return (
      <View style={[styles.shell, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>Checking access…</Text>
      </View>
    );
  }

  const doLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.shell} edges={['top', 'left', 'right']}>
      <View style={[styles.layout, isWide && styles.layoutWide]}>
        {/* Sidebar */}
        <View style={[styles.sidebar, isWide ? styles.sidebarWide : styles.sidebarMobile]}>
          <View style={styles.brandBox}>
            <Text style={styles.brandMark}>✦</Text>
            <View>
              <Text style={styles.brand}>Cosmic Bites</Text>
              <Text style={styles.brandSub}>Admin Console</Text>
            </View>
          </View>

          <ScrollView
            horizontal={!isWide}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={isWide ? styles.navWide : styles.navMobile}
          >
            {NAV.map((item) => {
              const active =
                item.route === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.navItem,
                    !isWide && styles.navItemMobile,
                    active && styles.navItemActive,
                  ]}
                  onPress={() => router.push(item.route as any)}
                  testID={`admin-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={active ? theme.colors.background : theme.colors.primary}
                  />
                  <Text style={[styles.navText, active && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {isWide && (
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.exitBtn}
                onPress={() => router.push('/home')}
                testID="admin-exit-app"
              >
                <Ionicons name="open-outline" size={16} color={theme.colors.text} />
                <Text style={styles.exitText}>Open customer app</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={doLogout} testID="admin-logout">
                <Ionicons name="log-out-outline" size={16} color={theme.colors.danger} />
                <Text style={styles.logoutText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Page content */}
        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: theme.colors.background },
  layout: { flex: 1, flexDirection: 'column' },
  layoutWide: { flexDirection: 'row' },
  sidebar: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  sidebarWide: { width: 260, borderRightWidth: 1 },
  sidebarMobile: { width: '100%', borderBottomWidth: 1, paddingVertical: 12 },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  brandMark: { color: theme.colors.primary, fontSize: 28 },
  brand: { color: theme.colors.text, fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
  brandSub: { color: theme.colors.primary, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase' },
  navWide: { padding: 16, gap: 4, width: 240 },
  navMobile: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  navItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemMobile: { paddingHorizontal: 14, paddingVertical: 10, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  navItemActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  navText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  navTextActive: { color: theme.colors.background, fontWeight: '700' },
  sidebarFooter: {
    marginTop: 'auto',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exitBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exitText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  logoutText: { color: theme.colors.danger, fontSize: 12, fontWeight: '700' },
  content: { flex: 1, backgroundColor: theme.colors.background },
});
