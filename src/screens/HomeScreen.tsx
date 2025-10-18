import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Club } from '../types';
import { getCachedClubs, cacheClubs } from '../lib/database';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  const { data: clubs, isLoading, refetch, error } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clubs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cache the data locally
        await cacheClubs(data || []);
        setIsOnline(true);
        return data as Club[];
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setIsOnline(false);
        
        // Try to load from cache
        const cached = await getCachedClubs();
        return cached as Club[];
      }
    },
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Échec de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const renderClubItem = ({ item }: { item: Club }) => (
    <TouchableOpacity style={styles.clubItem} activeOpacity={0.7}>
      <LinearGradient
        colors={[colors.primary.light, colors.primary.main]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.clubGradient}
      >
        <View style={styles.clubIconContainer}>
          <Text style={styles.clubIcon}>⚽</Text>
        </View>
      </LinearGradient>
      <View style={styles.clubContent}>
        <Text style={styles.clubName}>{item.name}</Text>
        <View style={styles.clubMeta}>
          <Text style={styles.clubMetaIcon}>📅</Text>
          <Text style={styles.clubDate}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
      <View style={styles.clubArrow}>
        <Text style={styles.clubArrowIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <Text style={styles.offlineText}>📡 Offline Mode</Text>
              </View>
            )}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>My Clubs</Text>
            <Text style={styles.titleSubtext}>
              {clubs?.length || 0} {clubs?.length === 1 ? 'club' : 'clubs'} total
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateClub')}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonIcon}>+</Text>
            <Text style={styles.createButtonText}>New Club</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading clubs...</Text>
          </View>
        ) : clubs && clubs.length > 0 ? (
          <FlatList
            data={clubs}
            renderItem={renderClubItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={refetch}
                tintColor={colors.primary.main}
                colors={[colors.primary.main]}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>⚽</Text>
            </View>
            <Text style={styles.emptyTitle}>No clubs yet</Text>
            <Text style={styles.emptyText}>
              Create your first club to start managing your team
            </Text>
            <TouchableOpacity
              style={styles.createButtonLarge}
              onPress={() => navigation.navigate('CreateClub')}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonLargeIcon}>+</Text>
              <Text style={styles.createButtonLargeText}>Create Your First Club</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  emailText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  offlineIndicator: {
    backgroundColor: colors.warning.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  offlineText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: typography.fontSize.xl,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutIcon: {
    fontSize: typography.fontSize.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  titleSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  createButtonIcon: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.xs,
  },
  createButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  clubItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.md,
  },
  clubGradient: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubIcon: {
    fontSize: typography.fontSize['2xl'],
  },
  clubContent: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  clubName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubMetaIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  clubDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  clubArrow: {
    paddingHorizontal: spacing.md,
  },
  clubArrowIcon: {
    fontSize: typography.fontSize['3xl'],
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  createButtonLarge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.lg,
  },
  createButtonLargeIcon: {
    color: colors.text.inverse,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
  },
  createButtonLargeText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default HomeScreen;
