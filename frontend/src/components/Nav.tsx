import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, BUSINESS } from '../theme';

const LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Menu', path: '/menu' },
  { label: 'Packages', path: '/packages' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= 880;
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, isWide && styles.barWide]}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.brand} accessibilityRole="link">
          <View style={styles.logoCircle}>
            <Ionicons name="sparkles" size={18} color={theme.colors.bg} />
          </View>
          <View>
            <Text style={styles.brandName}>{BUSINESS.name}</Text>
            <Text style={styles.brandTag}>Pure Veg Catering</Text>
          </View>
        </TouchableOpacity>

        {isWide ? (
          <View style={styles.links}>
            {LINKS.map((l) => {
              const active = pathname === l.path;
              return (
                <Pressable key={l.path} onPress={() => router.push(l.path as any)} style={styles.linkBtn}>
                  <Text style={[styles.linkText, active && styles.linkTextActive]}>{l.label}</Text>
                </Pressable>
              );
            })}
            <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/quote')}>
              <Text style={styles.ctaBtnText}>Get a Quote</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.menuBtn} accessibilityLabel="Open menu">
            <Ionicons name={open ? 'close' : 'menu'} size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {!isWide && open && (
        <View style={styles.mobileMenu}>
          {LINKS.map((l) => (
            <TouchableOpacity key={l.path} onPress={() => { setOpen(false); router.push(l.path as any); }} style={styles.mobileLink}>
              <Text style={styles.mobileLinkText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.ctaBtnMobile} onPress={() => { setOpen(false); router.push('/quote'); }}>
            <Text style={styles.ctaBtnText}>Get a Quote</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'rgba(11,21,17,0.92)', borderBottomWidth: 1, borderBottomColor: theme.colors.border, position: 'sticky' as any, top: 0, zIndex: 50 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  barWide: { paddingHorizontal: 56, maxWidth: 1400, alignSelf: 'center', width: '100%' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: theme.colors.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },
  brandTag: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  linkText: { color: theme.colors.text, fontSize: 14, fontWeight: '500', opacity: 0.85 },
  linkTextActive: { color: theme.colors.primary, opacity: 1, fontWeight: '700' },
  ctaBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4, marginLeft: 8 },
  ctaBtnMobile: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 4, marginTop: 10, alignItems: 'center' },
  ctaBtnText: { color: theme.colors.bg, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  menuBtn: { padding: 8 },
  mobileMenu: { paddingHorizontal: 20, paddingBottom: 16, gap: 4, borderTopWidth: 1, borderTopColor: theme.colors.border },
  mobileLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  mobileLinkText: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
});
