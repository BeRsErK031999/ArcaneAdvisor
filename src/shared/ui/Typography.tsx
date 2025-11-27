// src/shared/ui/Typography.tsx
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { colors } from '../theme/colors';

export function TitleText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[styles.title, props.style]}
    />
  );
}

export function SubtitleText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[styles.subtitle, props.style]}
    />
  );
}

export function BodyText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[styles.body, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  body: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});
