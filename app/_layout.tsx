/**
 * Root Layout - Soffitta NoWasteLand
 * 
 * Swiss Typography Design with Inter font
 */

import { useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/stores/authStore';
import { useItemsStore } from '@/stores/itemsStore';
import { useColors, useThemeMode } from '@/stores/themeStore';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Query client per React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const colors = useColors();
  const themeMode = useThemeMode();
  const initialize = useAuthStore((state) => state.initialize);
  const loadCategories = useItemsStore((state) => state.loadCategories);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  // Load Inter font family
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  useEffect(() => {
    // Initialize auth and load base data
    initialize();
    loadCategories();
  }, []);
  
  // Hide splash when ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isInitialized) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);
  
  // Show loading while fonts/auth initialize
  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  const isDark = themeMode === 'dark';
  
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontFamily: 'Inter_500Medium',
              fontWeight: '500',
              fontSize: 17,
            },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="item/[id]"
            options={{
              title: 'Dettaglio',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="chat/[id]"
            options={{
              title: 'Conversazione',
              presentation: 'card',
            }}
          />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
