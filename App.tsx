import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Alert, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { supabase } from './src/lib/supabase';
import { useAuthStore } from './src/store/authStore';
import { Navigation } from './src/navigation/RootNavigator';
import { initDatabase, cacheUserProfile } from './src/lib/database';
import { colors } from './src/theme';

// Initialize Sentry for error tracking (only if DSN is provided)
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // Use __DEV__ for debug mode (compile-time boolean)
    // This is correct - __DEV__ is a boolean, not a string from config
    debug: __DEV__,
  });
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { setUser, setSession, setLoading } = useAuthStore();
  const initStarted = React.useRef(false);

  useEffect(() => {
    async function prepare() {
      // Prevent multiple initialization attempts (e.g., in React StrictMode)
      if (initStarted.current) {
        console.log('App initialization already started, skipping...');
        return;
      }
      initStarted.current = true;

      try {
        console.log('Starting app initialization...');
        // Initialize SQLite database
        await initDatabase();

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUser(userData);
            // Cache user profile locally
            await cacheUserProfile(userData);
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            
            if (session?.user) {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (userData) {
                setUser(userData);
                // Cache user profile locally
                await cacheUserProfile(userData);
              }
            } else {
              setUser(null);
            }
            
            setLoading(false);
          }
        );

        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
        if (sentryDsn) {
          Sentry.captureException(error);
        }
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please restart the application.'
        );
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⚽</Text>
          </View>
          <Text style={styles.loadingTitle}>Squadra</Text>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading your teams...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconText: {
    fontSize: 50,
  },
  loadingTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary.dark,
    marginBottom: 32,
    letterSpacing: -1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

export default sentryDsn ? Sentry.wrap(App) : App;
