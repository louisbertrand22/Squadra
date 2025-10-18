import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style,
}) => {
  const cardStyles = [
    styles.card,
    styles[`card${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    { padding: spacing[padding] },
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
  },
  cardDefault: {
    ...shadows.md,
  },
  cardElevated: {
    ...shadows.lg,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.none,
  },
});
