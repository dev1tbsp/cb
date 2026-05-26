import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuth } from '@/src/context/AdminAuth';
import { theme, BUSINESS } from '@/src/theme';
import { Dashboard } from './Dashboard';
import { MenuCrud } from './MenuCrud';
import { PackagesCrud } from './PackagesCrud';
import { InquiriesPanel } from './InquiriesPanel';
import { QuotesPanel } from './QuotesPanel';
import { MediaPanel } from './MediaPanel';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'speedometer' },
  { key: 'menu', label: 'Menu Items', icon: 'restaurant' },
  { key: 'packages', label: 'Packages', icon: 'gift' },
  { key: 'inquiries', label: 'Inquiries', icon: 'mail' },
  { key: 'quotes', label: 'Quotes', icon: 'document-text' },
  { key: 'media', label: 'Media', icon: 'image' },
];

export function AdminShell() {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const [active, setActive] = useState<string>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const content = (
    <>
      {active === 'dashboard' && <Dashboard onNavigate={setActive} />}
      {active === 'menu' && <MenuCrud />}
      {active === 'packages' && <PackagesCrud />}
      {active === 'inquiries' && <InquiriesPanel />}
      {active === 'quotes' && <QuotesPanel />}
      {active === 'media' && <MediaPanel />}
    </>
  );

  const Sidebar = (
    <View style={[s.side, isWide ? s.sideWide : s.sideMobile]}>
      <View style={s.sideHead}>
        <View style={s.brandRow}>
          <View style={s.brandIcon}><Ionicons name="sparkles" size={16} color={theme.colors.bg} /></View>
          <View>
            <Text style={s.brandName}>{BUSINESS.name}</Text>
            <Text style={s.brandSub}>Admin Console</Text>
          </View>
        </View>
      </View>
      <View style={s.nav}>
        {SECTIONS.map((sec) => (
          <TouchableOpacity
            key={sec.key}
            style={[s.navItem, active === sec.key && s.navItemActive]}
            onPress={() => { setActive(sec.key); setDrawerOpen(false); }}
            testID={`admin-nav-${sec.key}`}
          >
            <Ionicons name={sec.icon as any} size={16} color={active === sec.key ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={[s.navText, active === sec.key && s.navTextActive]}>{sec.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.sideFooter}>
        <View style={s.userBox}>
          <View style={s.userAvatar}><Text style={s.userAvatarText}>{(user?.name || 'A')[0].toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName} numberOfLines={1}>{user?.name}</Text>
            <Text style={s.userEmail} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/')} style={s.footBtn}>
          <Ionicons name="globe" size={14} color={theme.colors.textMuted} />
          <Text style={s.footBtnText}>View Site</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={s.footBtn} testID="admin-logout">
          <Ionicons name="log-out" size={14} color={theme.colors.danger} />
          <Text style={[s.footBtnText, { color: theme.colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      {!isWide && (
        <View style={s.mobileBar}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={{ padding: 6 }}>
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.mobileTitle}>{SECTIONS.find((x) => x.key === active)?.label}</Text>
          <View style={{ width: 32 }} />
        </View>
      )}

      <View style={[s.layout, isWide && { flexDirection: 'row' }]}>
        {isWide && Sidebar}
        {!isWide && drawerOpen && (
          <>
            <TouchableOpacity activeOpacity={1} style={s.backdrop} onPress={() => setDrawerOpen(false)} />
            {Sidebar}
          </>
        )}
        <ScrollView style={s.main} contentContainerStyle={[s.mainContent, isWide && { padding: 32 }]}>
          {content}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, minHeight: '100%' as any },
  mobileBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  mobileTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  layout: { flex: 1, position: 'relative' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5 },

  side: { backgroundColor: theme.colors.surface, borderRightWidth: 1, borderRightColor: theme.colors.border },
  sideWide: { width: 260, padding: 18, gap: 18 },
  sideMobile: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, zIndex: 10, padding: 18, gap: 18 },
  sideHead: { borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  brandSub: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  nav: { gap: 2, flex: 1 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 4 },
  navItemActive: { backgroundColor: theme.colors.surfaceAlt },
  navText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
  navTextActive: { color: theme.colors.primary },
  sideFooter: { gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 14 },
  userBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: theme.colors.bg, fontWeight: '700' },
  userName: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  userEmail: { color: theme.colors.textMuted, fontSize: 11 },
  footBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 4 },
  footBtnText: { color: theme.colors.textMuted, fontSize: 13 },

  main: { flex: 1 },
  mainContent: { padding: 16, paddingBottom: 80 },
});
