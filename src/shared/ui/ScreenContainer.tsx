// src/shared/ui/ScreenContainer.tsx
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '@/shared/theme/colors';

type ScreenContainerProps = {
  children: React.ReactNode;
} & ViewProps;

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
