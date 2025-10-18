import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

type CreateTeamScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateTeam'
>;
type CreateTeamScreenRouteProp = RouteProp<RootStackParamList, 'CreateTeam'>;

const SPORTS = ['Football', 'Basketball', 'Handball', 'Rugby', 'Volley', 'Tennis'];
const CATEGORIES = ['U9','U11','U13','U15','U17','U18','U20','Senior','Feminine','Loisir'];
const NIVEAUX = ['Elite','Régional','Départemental','Loisir'];

// Fabrique "2024-2025", "2025-2026", ...
const currentYear = new Date().getMonth() >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1;
const SEASONS = Array.from({ length: 6 }).map((_, i) => {
  const y = currentYear + i;
  return `${y}-${y + 1}`;
});

const validateSeason = (s: string) => {
  const m = s.match(/^(\d{4})-(\d{4})$/);
  if (!m) return false;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  return b === a + 1 && a >= 2000 && b < 2100;
};

const CreateTeamScreen: React.FC = () => {
  const navigation = useNavigation<CreateTeamScreenNavigationProp>();
  const route = useRoute<CreateTeamScreenRouteProp>();
  const preselectedClubId = route.params?.clubId ?? null;

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [teamName, setTeamName] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(preselectedClubId);
  const [sport, setSport] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(SEASONS[0] ?? null);

  // Clubs de l'utilisateur si pas de club pré-sélectionné
  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs', { scope: 'mine' }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, created_by')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !preselectedClubId,
  });

  // Nom du club pré-sélectionné
  const { data: currentClub, isLoading: currentClubLoading } = useQuery({
    queryKey: ['club', preselectedClubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('id', preselectedClubId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!preselectedClubId,
  });

  const selectedClubName = useMemo(() => {
    if (preselectedClubId) return currentClub?.name ?? '...';
    const found = clubs?.find(c => c.id === selectedClubId);
    return found?.name ?? undefined;
  }, [preselectedClubId, currentClub, clubs, selectedClubId]);

  // Vérifie unicité nom+club+saison (côté client)
  const { data: existingTeams, isLoading: existingLoading } = useQuery({
    queryKey: ['teams-exists', selectedClubId, season, teamName],
    queryFn: async () => {
      if (!selectedClubId || !season || !teamName.trim()) return [];
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('club_id', selectedClubId)
        .eq('season', season)
        .ilike('name', teamName.trim());
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedClubId && !!season && !!teamName.trim(),
  });

  const createTeamMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      club_id: string;
      sport: string;
      category: string;
      level: string;
      season: string;
    }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: payload.name,
          club_id: payload.club_id,
          sport: payload.sport,
          category: payload.category,
          level: payload.level,
          season: payload.season,
          created_by: user?.id,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.club_id] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      Alert.alert('Succès', 'Équipe créée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Erreur', error.message || "Échec de la création de l'équipe");
    },
  });

  const isPending = createTeamMutation.isPending;
  const loading = clubsLoading || currentClubLoading || existingLoading;

  const canSubmit =
    !!teamName.trim() &&
    !!selectedClubId &&
    !!sport &&
    !!category &&
    !!level &&
    !!season &&
    validateSeason(season) &&
    (existingTeams ? existingTeams.length === 0 : true);

  const handleCreateTeam = () => {
    const trimmed = teamName.trim();

    if (!trimmed) return Alert.alert('Erreur', 'Veuillez entrer un nom');
    if (!selectedClubId) return Alert.alert('Erreur', 'Veuillez sélectionner un club');
    if (!sport) return Alert.alert('Erreur', 'Veuillez sélectionner un sport');
    if (!category) return Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
    if (!level) return Alert.alert('Erreur', 'Veuillez sélectionner un niveau');
    if (!season) return Alert.alert('Erreur', 'Veuillez sélectionner une saison');
    if (!validateSeason(season)) return Alert.alert('Erreur', 'Format de saison invalide (ex: 2025-2026)');
    if (existingTeams && existingTeams.length > 0)
      return Alert.alert('Doublon', 'Une équipe avec le même nom existe déjà pour ce club et cette saison.');

    createTeamMutation.mutate({
      name: trimmed,
      club_id: selectedClubId,
      sport,
      category,
      level,
      season,
    });
  };

  const Select = ({
    label,
    value,
    placeholder,
    options,
    onChange,
    disabled = false,
  }: {
    label: string;
    value: string | null;
    placeholder: string;
    options: string[];
    onChange: (v: string) => void;
    disabled?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.select, disabled && styles.selectDisabled]} disabled={disabled}>
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      <View style={styles.optionList}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionItem, value === opt && styles.optionItemActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.8}
            disabled={disabled}
          >
            <Text
              style={[styles.optionText, value === opt && styles.optionTextActive]}
              numberOfLines={1}
            >
              {opt}
            </Text>
            {value === opt && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>

          <Text style={styles.title}>Create a New Team</Text>
          <Text style={styles.subtitle}>
            Link your team to a club and start adding players & schedules
          </Text>

          <View style={styles.form}>
            {/* Club */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Club</Text>
              {loading ? (
                <View style={[styles.select, styles.selectDisabled]}>
                  <ActivityIndicator />
                </View>
              ) : preselectedClubId ? (
                <View style={[styles.select, styles.selectDisabled]}>
                  <Text style={styles.selectText}>
                    {selectedClubName || 'Club'}
                  </Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.select} activeOpacity={0.8}>
                    <Text style={[styles.selectText, !selectedClubId && styles.placeholder]}>
                      {selectedClubName || 'Select a club'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.optionList}>
                    {clubs?.map((club) => (
                      <TouchableOpacity
                        key={club.id}
                        style={[
                          styles.optionItem,
                          selectedClubId === club.id && styles.optionItemActive,
                        ]}
                        onPress={() => setSelectedClubId(club.id)}
                        activeOpacity={0.8}
                        disabled={isPending}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedClubId === club.id && styles.optionTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {club.name}
                        </Text>
                        {selectedClubId === club.id && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                    {clubs && clubs.length === 0 && (
                      <Text style={styles.emptyText}>
                        Aucun club trouvé. Crée d’abord un club.
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>

            {/* Team name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Team Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., U18 Elite"
                placeholderTextColor={colors.text.tertiary}
                value={teamName}
                onChangeText={setTeamName}
                autoFocus
                editable={!isPending}
              />
            </View>

            {/* Sport / Catégorie / Niveau / Saison */}
            <Select
              label="Sport"
              value={sport}
              placeholder="Sélectionner un sport"
              options={SPORTS}
              onChange={setSport}
              disabled={isPending}
            />
            <Select
              label="Catégorie"
              value={category}
              placeholder="Sélectionner une catégorie"
              options={CATEGORIES}
              onChange={setCategory}
              disabled={isPending}
            />
            <Select
              label="Niveau"
              value={level}
              placeholder="Sélectionner un niveau"
              options={NIVEAUX}
              onChange={setLevel}
              disabled={isPending}
            />
            <Select
              label="Saison"
              value={season}
              placeholder="Sélectionner une saison"
              options={SEASONS}
              onChange={setSeason}
              disabled={isPending}
            />

            {/* Aide */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                La saison doit être au format AAAA-AAAA (ex: {SEASONS[0]}). Une même équipe (nom) ne peut être créée deux fois pour le même club et la même saison.
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, (!canSubmit || isPending) && styles.buttonDisabled]}
              onPress={handleCreateTeam}
              disabled={!canSubmit || isPending}
              activeOpacity={0.8}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>🚀</Text>
                  <Text style={styles.buttonText}>Create Team</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  iconContainer: {
    width: 80, height: 80, borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: spacing.lg, ...shadows.lg,
  },
  iconText: { fontSize: 40 },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  form: { backgroundColor: colors.neutral.white, padding: spacing.xl, borderRadius: borderRadius.xl, ...shadows.lg },
  inputContainer: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 2, borderColor: colors.border.light, borderRadius: borderRadius.lg,
    padding: spacing.md, fontSize: typography.fontSize.base,
    backgroundColor: colors.background.secondary, color: colors.text.primary,
  },
  select: {
    borderWidth: 2, borderColor: colors.border.light, borderRadius: borderRadius.lg,
    padding: spacing.md, backgroundColor: colors.background.secondary, justifyContent: 'center',
  },
  selectDisabled: { opacity: 0.7 },
  selectText: { fontSize: typography.fontSize.base, color: colors.text.primary },
  placeholder: { color: colors.text.tertiary },
  optionList: {
    marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border.light,
    borderRadius: borderRadius.lg, backgroundColor: colors.neutral.white, ...shadows.sm, maxHeight: 220,
  },
  optionItem: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1,
    borderBottomColor: colors.border.light, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  optionItemActive: { backgroundColor: colors.background.secondary },
  optionText: { fontSize: typography.fontSize.base, color: colors.text.primary, flex: 1 },
  optionTextActive: { fontWeight: typography.fontWeight.semibold },
  checkmark: { marginLeft: spacing.sm, fontSize: typography.fontSize.base },
  emptyText: { padding: spacing.md, color: colors.text.secondary, fontSize: typography.fontSize.sm },
  infoBox: {
    backgroundColor: colors.info.bg, padding: spacing.md, borderRadius: borderRadius.lg,
    flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg, marginBottom: spacing.lg,
  },
  infoIcon: { fontSize: typography.fontSize.lg, marginRight: spacing.sm },
  infoText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm },
  button: {
    backgroundColor: colors.primary.main, padding: spacing.md, borderRadius: borderRadius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadows.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonIcon: { fontSize: typography.fontSize.lg, marginRight: spacing.sm },
  buttonText: { color: colors.text.inverse, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  cancelButton: { padding: spacing.md, alignItems: 'center' },
  cancelButtonText: { color: colors.primary.main, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
});

export default CreateTeamScreen;
