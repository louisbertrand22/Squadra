import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamDetails'>;

type TeamRow = {
  id: string;
  name: string;
  club_id: string;
  created_at: string;
  sport?: string | null;
  category?: string | null;
  level?: string | null;
  season?: string | null;
};

type ClubRow = { id: string; name: string; created_at: string };

type PlayerRow = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  position?: string | null;
  number?: number | null;
  created_at: string;
};

const TeamDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { teamId } = route.params;

  // Team
  const {
    data: team,
    isLoading: teamLoading,
    isRefetching: teamRefetching,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      if (error) throw error;
      return data as TeamRow;
    },
  });

  // Club parent
  const {
    data: club,
    isLoading: clubLoading,
    isRefetching: clubRefetching,
    refetch: refetchClub,
  } = useQuery({
    queryKey: ['club', team?.club_id],
    queryFn: async () => {
      if (!team?.club_id) return null;
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, created_at')
        .eq('id', team.club_id)
        .single();
      if (error) throw error;
      return data as ClubRow;
    },
    enabled: !!team?.club_id,
  });

  // Players (si table présente)
  const {
    data: players,
    isLoading: playersLoading,
    isRefetching: playersRefetching,
    refetch: refetchPlayers,
  } = useQuery({
    queryKey: ['players', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, team_id, first_name, last_name, position, number, created_at')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });
      if (error?.code === '42P01') {
        // table n’existe pas -> renvoyer tableau vide
        return [] as PlayerRow[];
      }
      if (error) throw error;
      return (data ?? []) as PlayerRow[];
    },
  });

  const loading = teamLoading || clubLoading || playersLoading;
  const refreshing = teamRefetching || clubRefetching || playersRefetching;

  const onRefresh = useCallback(() => {
    Promise.all([refetchTeam(), refetchClub(), refetchPlayers()]);
  }, [refetchTeam, refetchClub, refetchPlayers]);

  if (loading || !team) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading team...</Text>
      </View>
    );
  }

  const metaParts = [team.sport, team.category, team.level, team.season].filter(Boolean);
  const subtitle = metaParts.length
    ? metaParts.join(' • ')
    : `Created ${new Date(team.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 28 }}>🏆</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{team.name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {!!club && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ClubDetails', { clubId: club.id })}
              activeOpacity={0.85}
            >
              <Text style={styles.link}>↩ Back to {club.name}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // TODO: route AddPlayer si tu la crées (ex: navigation.navigate('AddPlayer', { teamId }))
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Add Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // TODO: route CreateFixture si tu la crées
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.actionIcon}>🗓️</Text>
          <Text style={styles.actionText}>Manage Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Players */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🧑‍🎓</Text>
          <Text style={styles.sectionTitle}>Players</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{players?.length ?? 0}</Text>
          </View>
        </View>

        {players && players.length > 0 ? (
          players.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.avatar}>
                <Text>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {p.first_name} {p.last_name}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {[
                    p.number != null ? `#${p.number}` : null,
                    p.position || null,
                    new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧑‍🎓</Text>
            <Text style={styles.emptyText}>No players yet</Text>
            <TouchableOpacity style={[styles.actionButton, { marginTop: spacing.md }]} activeOpacity={0.9}>
              <Text style={styles.actionIcon}>✨</Text>
              <Text style={styles.actionText}>Add the first player</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary,
  },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary, fontSize: typography.fontSize.base },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  headerIcon: {
    width: 56, height: 56, borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md, ...shadows.sm,
  },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  subtitle: { marginTop: 4, color: colors.text.secondary, fontSize: typography.fontSize.sm },
  link: { marginTop: 8, color: colors.primary.main, fontWeight: typography.fontWeight.semibold },

  actionsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.lg, gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, ...shadows.sm,
  },
  actionIcon: { marginRight: spacing.xs, color: colors.text.inverse },
  actionText: { color: colors.text.inverse, fontWeight: typography.fontWeight.semibold },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  sectionIcon: { fontSize: typography.fontSize.xl, marginRight: spacing.sm },
  sectionTitle: {
    fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold,
    color: colors.text.primary, flex: 1,
  },
  badge: {
    backgroundColor: colors.primary.main, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, minWidth: 28, alignItems: 'center',
  },
  badgeText: { color: colors.text.inverse, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm },

  card: {
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.xl,
    padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', ...shadows.sm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.background.tertiary,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  cardTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  cardSubtitle: { fontSize: typography.fontSize.sm, color: colors.text.secondary },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm, opacity: 0.5 },
  emptyText: { color: colors.text.secondary },
});

export default TeamDetailsScreen;
