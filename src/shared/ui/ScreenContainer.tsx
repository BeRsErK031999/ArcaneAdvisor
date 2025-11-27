// src/shared/ui/ScreenContainer.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type ScreenContainerProps = {
  children: ReactNode;
  style?: ViewStyle;
  // опция: отключить SafeArea (например, для web-only экранов)
  disableSafeArea?: boolean;
};

export function ScreenContainer({
  children,
  style,
  disableSafeArea,
}: ScreenContainerProps) {
  const content = (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );

  if (disableSafeArea) {
    return <View style={styles.root}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.root}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
