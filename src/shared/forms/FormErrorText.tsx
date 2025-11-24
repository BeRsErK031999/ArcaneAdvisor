import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/shared/theme/colors';

interface FormErrorTextProps {
  children?: React.ReactNode;
}

export const FormErrorText: React.FC<FormErrorTextProps> = ({ children }) => {
  if (!children) return null;

  return <Text style={styles.error}>{children}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
