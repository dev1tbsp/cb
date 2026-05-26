import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminAuthProvider } from '@/src/context/AdminAuth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B1511' } }} />
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}
