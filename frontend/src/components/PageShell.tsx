import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { theme } from '../theme';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <Nav />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {children}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, minHeight: '100%' as any },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
