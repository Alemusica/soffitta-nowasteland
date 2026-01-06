import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useItemsStore } from '@/stores/itemsStore';

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
  const initialize = useAuthStore((state) => state.initialize);
  const loadCategories = useItemsStore((state) => state.loadCategories);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  useEffect(() => {
    // Inizializza auth e carica dati base
    initialize();
    loadCategories();
  }, []);
  
  // Mostra splash mentre inizializza
  if (!isInitialized) {
    return null; // O un componente Splash custom
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#0f0f1a',
          },
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
            title: 'Dettaglio oggetto',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            title: 'Chat',
            presentation: 'card',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
