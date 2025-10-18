import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

type CreateClubScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateClub'
>;

const CreateClubScreen: React.FC = () => {
  const navigation = useNavigation<CreateClubScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [clubName, setClubName] = useState('');

  const createClubMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('clubs')
        .insert([{ name, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      Alert.alert('Succès', 'Club créé avec succès !', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Erreur', error.message || 'Échec de la création du club');
    },
  });

  const handleCreateClub = () => {
    if (!clubName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de club');
      return;
    }

    createClubMutation.mutate(clubName.trim());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⚽</Text>
          </View>
          
          <Text style={styles.title}>Create a New Club</Text>
          <Text style={styles.subtitle}>
            As the creator, you'll be the admin of this club
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Club Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Manchester United FC"
                placeholderTextColor={colors.text.tertiary}
                value={clubName}
                onChangeText={setClubName}
                autoFocus
                editable={!createClubMutation.isPending}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                You can add teams, members, and manage schedules after creating your club
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                createClubMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={handleCreateClub}
              disabled={createClubMutation.isPending}
              activeOpacity={0.8}
            >
              {createClubMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>✨</Text>
                  <Text style={styles.buttonText}>Create Club</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={createClubMutation.isPending}
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
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  iconText: {
    fontSize: 40,
  },
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
  form: {
    backgroundColor: colors.neutral.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  infoBox: {
    backgroundColor: colors.info.bg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  infoIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  button: {
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.sm,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.primary.main,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CreateClubScreen;
