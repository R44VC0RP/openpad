import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OpenCodeProvider, useOpenCode } from '../src/providers/OpenCodeProvider';

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { connected, connecting, connect, storageReady, hasSavedServerUrl } = useOpenCode();
  const segments = useSegments();
  const router = useRouter();
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnectAttempted && storageReady && hasSavedServerUrl) {
      setAutoConnectAttempted(true);
      connect();
    }
  }, [autoConnectAttempted, connect, storageReady, hasSavedServerUrl]);

  useEffect(() => {
    // Wait for auto-connect to finish
    if (connecting) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inChatScreen = segments[0] === 'chat';
    const onConnectScreen = segments[0] === 'connect';

    if (!connected && (inAuthGroup || inChatScreen)) {
      // Redirect to connect if not authenticated
      router.replace('/connect');
    } else if (connected && !inAuthGroup && !inChatScreen && segments.length > 0) {
      // Redirect to tabs if authenticated and not already in tabs or chat
      router.replace('/(tabs)/sessions');
    }
  }, [connected, connecting, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaProvider>
      <OpenCodeProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthRedirect>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="chat/[id]" 
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen name="connect" />
            <Stack.Screen name="index" />
          </Stack>
        </AuthRedirect>
      </OpenCodeProvider>
    </SafeAreaProvider>
  );
}
