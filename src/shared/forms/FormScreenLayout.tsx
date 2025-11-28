import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { TitleText, BodyText } from "@/shared/ui/Typography";
import { BackButton } from "@/shared/ui/BackButton";

interface FormScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftAction?: React.ReactNode;
}

export const FormScreenLayout: React.FC<FormScreenLayoutProps> = ({
  title,
  subtitle,
  children,
  showBackButton = false,
  onBackPress,
  leftAction,
}) => {
  const renderLeftAction = React.useMemo(() => {
    if (leftAction) return leftAction;
    if (showBackButton) return <BackButton onPressOverride={onBackPress} />;
    return null;
  }, [leftAction, onBackPress, showBackButton]);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        {renderLeftAction}
        <TitleText style={styles.title}>{title}</TitleText>
      </View>
      {subtitle ? <BodyText style={styles.subtitle}>{subtitle}</BodyText> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    columnGap: 8,
  },
  title: {
    flex: 1,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  content: {
    paddingBottom: 24,
    rowGap: 16,
  },
  body: {
    rowGap: 12,
  },
});
