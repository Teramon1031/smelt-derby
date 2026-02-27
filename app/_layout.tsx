import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DerbyProvider } from '@/contexts/DerbyContext';
import Colors from '@/constants/colors';
import '@/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.deepNavy },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="derby" />
      <Stack.Screen name="results" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <DerbyProvider>
          <RootLayoutNav />
        </DerbyProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
