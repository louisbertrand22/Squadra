import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Club, Team } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

type ClubDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ClubDetails'>;

const ClubDetailsScreen: React.FC<ClubDetailsScreenProps> = ({ route, navigation }) => {
  const { clubId } = route.params;

  // Club
  const {
    data: club,
    isLoading: clubLoading,
    isRefetching: clubRefetching,
    refetch: refetchClub,
  } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();
      if (error) throw error;
      return data as Club;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Teams
  const {
    data: teams,
    isLoading: teamsLoading,
    isRefetching: teamsRefetching,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ['teams', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Team[];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Members
  const {
    data: memberships,
    isLoading: membershipsLoading,
    isRefetching: membershipsRefetching,
    refetch: refetchMemberships,
  } = useQuery({
    queryKey: ['memberships', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          id,
          user_id,
          role,
          created_at,
          user:user_id (
            id,
            email,
            name
          )
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Pull-to-refresh regroupe tout
  const refreshing = clubRefetching || teamsRefetching || membershipsRefetching;
  const onRefresh = useCallback(() => {
    Promise.all([refetchClub(), refetchTeams(), refetchMemberships()]);
  }, [refetchClub, refetchTeams, refetchMemberships]);

  // Refetch quand l’écran redevient actif
  useFocusEffect(
    useCallback(() => {
      refetchTeams();
    }, [refetchTeams])
  );

  const isLoading = clubLoading || teamsLoading || membershipsLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading club details...</Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Club not found</Text>
      </View>
    );
  }

  // Petit helper d’affichage si les champs existent
  const teamMeta = (t: Partial<Team>) => {
    const parts = [t.sport, t.category, t.level, t.season].filter(Boolean);
    return parts.join(' • ');
  };

  const teamsCount = teams?.length ?? 0;
  const membersCount = memberships?.length ?? 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={[colors.primary.main, colors.primary.dark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.clubIconContainer}>
            <Text style={styles.clubIcon}>⚽</Text>
          </View>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.clubDate}>
            Created {new Date(club.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Teams Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={styles.sectionIcon}>👥</Text>
              <Text style={styles.sectionTitle}>Teams</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{teamsCount}</Text>
              </View>
            </View>

            {/* Bouton Add Team */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateTeam', { clubId })}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonIcon}>➕</Text>
              <Text style={styles.addButtonText}>Add Team</Text>
            </TouchableOpacity>
          </View>

          {teams && teams.length > 0 ? (
            teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('TeamDetails', { teamId: team.id })}
              >
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardIcon}>🏆</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{team.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {teamMeta(team) ||
                      `Created ${new Date(team.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`}
                  </Text>
                </View>
                <Text style={{ opacity: 0.5 }}>›</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyText}>No teams yet</Text>
              <TouchableOpacity
                style={[styles.addButton, { marginTop: spacing.md }]}
                onPress={() => navigation.navigate('CreateTeam', { clubId })}
                activeOpacity={0.85}
              >
                <Text style={styles.addButtonIcon}>✨</Text>
                <Text style={styles.addButtonText}>Create the first team</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Members</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{membersCount}</Text>
            </View>
          </View>

          {memberships && memberships.length > 0 ? (
            memberships.map((membership) => (
              <View key={membership.id} style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardIcon}>
                    {membership.role === 'admin' ? '👑' : '👤'}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {(membership as any).user?.[0]?.name ||
                      (membership as any).user?.[0]?.email ||
                      'Unknown User'}
                  </Text>
                  <View style={styles.roleContainer}>
                    <View
                      style={[
                        styles.roleBadge,
                        membership.role === 'admin' && styles.roleBadgeAdmin,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          membership.role === 'admin' && styles.roleTextAdmin,
                        ]}
                      >
                        {membership.role === 'admin' ? 'Admin' : 'Member'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>No members yet</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: spacing.md, fontSize: typography.fontSize.base, color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background.secondary, paddingHorizontal: spacing.lg,
  },
  errorIcon: { fontSize: 60, marginBottom: spacing.md },
  errorText: {
    fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary, textAlign: 'center',
  },
  header: {
    paddingTop: spacing['2xl'], paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center',
  },
  headerContent: { alignItems: 'center' },
  clubIconContainer: {
    width: 80, height: 80, borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center',
    alignItems: 'center', marginBottom: spacing.md, ...shadows.lg,
  },
  clubIcon: { fontSize: 40 },
  clubName: {
    fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse, marginBottom: spacing.xs, textAlign: 'center',
  },
  clubDate: { fontSize: typography.fontSize.sm, color: colors.text.inverse, opacity: 0.9 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },

  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  sectionIcon: { fontSize: typography.fontSize.xl, marginRight: spacing.sm },
  sectionTitle: {
    fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold,
    color: colors.text.primary, marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primary.main, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, minWidth: 28, alignItems: 'center',
  },
  badgeText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.inverse },

  // Bouton Add Team
  addButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary.main, paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg, ...shadows.sm,
  },
  addButtonIcon: { marginRight: spacing.xs, fontSize: typography.fontSize.base, color: colors.text.inverse },
  addButtonText: { color: colors.text.inverse, fontWeight: typography.fontWeight.semibold },

  card: {
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.xl,
    padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row',
    alignItems: 'center', ...shadows.sm,
  },
  cardIconContainer: {
    width: 50, height: 50, borderRadius: borderRadius.full, backgroundColor: colors.background.tertiary,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  cardIcon: { fontSize: typography.fontSize.xl },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary, marginBottom: spacing.xs,
  },
  cardSubtitle: { fontSize: typography.fontSize.sm, color: colors.text.secondary },

  roleContainer: { flexDirection: 'row', alignItems: 'center' },
  roleBadge: {
    backgroundColor: colors.background.tertiary, paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: borderRadius.md,
  },
  roleBadgeAdmin: { backgroundColor: colors.primary.light },
  roleText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary },
  roleTextAdmin: { color: colors.primary.main },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm, opacity: 0.5 },
  emptyText: { fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center' },
});

export default ClubDetailsScreen;
