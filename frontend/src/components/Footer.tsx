import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, BUSINESS } from '../theme';

export function Footer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 880;

  return (
    <View style={[styles.foot, isWide && styles.footWide]}>
      <View style={[styles.row, isWide && styles.rowWide]}>
        <View style={[styles.col, isWide && { flex: 1.4 }]}>
          <Text style={styles.brand}>{BUSINESS.name}</Text>
          <Text style={styles.tagline}>{BUSINESS.tagline}</Text>
          <Text style={styles.muted}>{BUSINESS.address}</Text>
        </View>
        <View style={[styles.col, isWide && { flex: 1 }]}>
          <Text style={styles.colHead}>Explore</Text>
          {[['Home','/'],['Menu','/menu'],['Packages','/packages'],['About','/about'],['Contact','/contact']].map(([l,p]) => (
            <TouchableOpacity key={p} onPress={() => router.push(p as any)}>
              <Text style={styles.colLink}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.col, isWide && { flex: 1 }]}>
          <Text style={styles.colHead}>Contact</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${BUSINESS.phone}`)} style={styles.iconRow}>
            <Ionicons name="call" size={14} color={theme.colors.primary} />
            <Text style={styles.colLink}>{BUSINESS.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${BUSINESS.whatsapp}`)} style={styles.iconRow}>
            <Ionicons name="logo-whatsapp" size={14} color={theme.colors.primary} />
            <Text style={styles.colLink}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${BUSINESS.email}`)} style={styles.iconRow}>
            <Ionicons name="mail" size={14} color={theme.colors.primary} />
            <Text style={styles.colLink}>{BUSINESS.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(BUSINESS.insta)} style={styles.iconRow}>
            <Ionicons name="logo-instagram" size={14} color={theme.colors.primary} />
            <Text style={styles.colLink}>Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.copy}>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</Text>
        <TouchableOpacity onPress={() => router.push('/admin')}>
          <Text style={styles.adminLink}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  foot: { backgroundColor: theme.colors.surface, padding: 28, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 40 },
  footWide: { padding: 56 },
  row: { gap: 32 },
  rowWide: { flexDirection: 'row', maxWidth: 1400, alignSelf: 'center', width: '100%' },
  col: { gap: 8 },
  brand: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  tagline: { color: theme.colors.primary, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  muted: { color: theme.colors.textMuted, fontSize: 13 },
  colHead: { color: theme.colors.primary, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  colLink: { color: theme.colors.text, fontSize: 14, paddingVertical: 4, opacity: 0.85 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bottom: { borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 32, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  copy: { color: theme.colors.textMuted, fontSize: 12 },
  adminLink: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
});
