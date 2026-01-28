import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';

// Suppress specific network-related warnings that flood LogBox
if (Platform.OS !== 'web') {
  LogBox.ignoreLogs([
    'Network request failed',
    'Failed to fetch',
    'TypeError: Network request failed',
    'Possible Unhandled Promise Rejection',
  ]);
}

// Helper to check if error is a network error
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network request failed') ||
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('timeout') ||
      message.includes('aborted')
    );
  }
  return false;
};

// Create a client for React Query with better error handling
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Only log non-network errors to avoid LogBox spam
      if (!isNetworkError(error)) {
        console.warn('React Query Error:', error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (!isNetworkError(error)) {
        console.warn('React Mutation Error:', error);
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry network errors more than once
        if (isNetworkError(error)) return failureCount < 1;
        return failureCount < 2;
      },
      throwOnError: false, // Don't throw errors - handle gracefully
      networkMode: 'offlineFirst', // Work better with network issues
    },
    mutations: {
      throwOnError: false, // Don't throw errors - handle gracefully
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  // Global unhandled promise rejection handler for network errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (isNetworkError(error)) {
        // Prevent the error from being logged to LogBox
        event.preventDefault();
        // Silently ignore network errors - they're handled in components
        return;
      }
    };

    // Only add listener on web - native uses different error handling
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useFrameworkReady();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}