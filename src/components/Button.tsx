import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as ViewStyle,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
    fullWidth ? styles.buttonFullWidth : {},
    (disabled || loading) ? styles.buttonDisabled : {},
    style || {},
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as TextStyle,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as TextStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary.main : colors.text.inverse}
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.primary.main,
    ...shadows.md,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary.main,
    ...shadows.md,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonMedium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonLarge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  textPrimary: {
    color: colors.text.inverse,
  },
  textSecondary: {
    color: colors.text.inverse,
  },
  textOutline: {
    color: colors.primary.main,
  },
  textGhost: {
    color: colors.primary.main,
  },
  textSmall: {
    fontSize: typography.fontSize.sm,
  },
  textMedium: {
    fontSize: typography.fontSize.base,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
  },
  icon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.sm,
  },
});
