import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';

interface FormScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormScreenLayout: React.FC<FormScreenLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.body}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    rowGap: 16,
  },
  header: {
    rowGap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  body: {
    rowGap: 12,
  },
});
