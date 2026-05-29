/**
 * App entry point
 */

import '@/lib/cryptoPolyfill';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useSettingsStore } from '@/stores/progressStore';
import { useAuthStore } from '@/stores/authStore';
import { initSync } from '@/services/syncService';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const { darkMode } = useSettingsStore();
  const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth state
        await initAuth();

        // Initialize MongoDB sync (non-blocking)
        initSync().catch(() => {});

        // Simulate some additional setup time if needed
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsReady(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initialize app';
        console.error('App initialization error:', error);
        setAppError(message);
        setIsReady(true); // Still show app even on error
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  // Handle navigation based on authentication state
  useEffect(() => {
    if (!isReady || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated but on auth screen
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isReady, authLoading]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {appError ? (
          <ErrorScreen message={appError} />
        ) : !isAuthenticated ? (
          authScreen === 'login' ? (
            <LoginScreen onSwitchToSignup={() => setAuthScreen('signup')} />
          ) : (
            <SignupScreen onSwitchToLogin={() => setAuthScreen('login')} />
          )
        ) : (
          <>
            <Slot />
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
          </>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Error screen displayed if app initialization fails
 */
function ErrorScreen({ message }: { message: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Application Error</Text>
      <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 6 }}>{message}</Text>
      <Text style={{ fontSize: 14, textAlign: 'center' }}>Please restart the app.</Text>
    </View>
  );
}
