// app/(tabs)/library/index.tsx
import { Link, type Href } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

import { colors } from "@/shared/theme/colors";
import { ScreenContainer } from "@/shared/ui/ScreenContainer";
import { TitleText } from "@/shared/ui/Typography";

const COLUMN_BREAKPOINTS = {
  desktop: 1024,
  tablet: 768,
};

type Section = {
  label: string;
  href: Href;
  group?: string;
  description?: string;
};

const sections: Section[] = [
  { label: "Заклинания", href: "/(tabs)/library/spells" },
  { label: "Классы", href: "/(tabs)/library/classes" },
  { label: "Подклассы", href: "/(tabs)/library/subclasses" },
  { label: "Фичи классов", href: "/(tabs)/library/class-features" },
  { label: "Уровни классов", href: "/(tabs)/library/class-levels" },
  { label: "Расы", href: "/(tabs)/library/races" },
  { label: "Подрасы", href: "/(tabs)/library/subraces" },
  { label: "Способности (feats)", href: "/(tabs)/library/feats" },

  { label: "Доспехи", href: "/(tabs)/library/equipment/armors", group: "Снаряжение" },
  { label: "Оружие", href: "/(tabs)/library/equipment/weapons", group: "Снаряжение" },
  { label: "Инструменты", href: "/(tabs)/library/equipment/tools", group: "Снаряжение" },
  { label: "Материалы", href: "/(tabs)/library/equipment/materials", group: "Снаряжение" },
  {
    label: "Материальные компоненты",
    href: "/(tabs)/library/equipment/material-components",
    group: "Снаряжение",
  },
  { label: "Типы оружия", href: "/(tabs)/library/equipment/weapon-kinds", group: "Снаряжение" },
  {
    label: "Свойства оружия",
    href: "/(tabs)/library/equipment/weapon-properties",
    group: "Снаряжение",
  },

  { label: "Источники", href: "/(tabs)/library/sources" },
  {
    label: "Справочники",
    href: "/(tabs)/library/dictionaries",
    description:
      "служебные типы: кости, монеты, типы урона, модификаторы, навыки, типы существ, размеры, единицы длины/веса/времени",
  },
];

export default function LibraryMenuScreen() {
  const { width } = useWindowDimensions();

  let columns = 1;
  if (width >= COLUMN_BREAKPOINTS.desktop) {
    columns = 3;
  } else if (width >= COLUMN_BREAKPOINTS.tablet) {
    columns = 2;
  }

  const cardWrapperStyle = React.useMemo(
    () =>
      ({
        flexBasis: `${100 / columns}%`,
        maxWidth: `${100 / columns}%`,
      }) satisfies ViewStyle,
    [columns],
  );

  const renderedGroups = new Set<string>();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <TitleText style={styles.pageTitle}>Справочник ArcaneAdvisor</TitleText>

        <View style={styles.menuContainer}>
          {sections.map((section) => {
            const items: React.ReactNode[] = [];

            // Заголовок группы показываем только один раз
            if (section.group && !renderedGroups.has(section.group)) {
              renderedGroups.add(section.group);
              items.push(
                <View key={`${section.group}-title`} style={styles.groupWrapper}>
                  <Text style={styles.groupTitle}>{section.group}</Text>
                </View>,
              );
            }

            items.push(
              <View key={section.label} style={[styles.cardWrapper, cardWrapperStyle]}>
                <Link href={section.href} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <Text style={styles.cardTitle}>{section.label}</Text>
                    {section.description ? (
                      <Text style={styles.cardDescription}>
                        {section.description}
                      </Text>
                    ) : null}
                  </Pressable>
                </Link>
              </View>,
            );

            return items;
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  pageTitle: {
    marginBottom: 8,
  },

  // контейнер грида
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 16,
  },

  // обёртка карточки — отвечает за колонку
  cardWrapper: {
    minHeight: 90,
  },

  // сама "кнопка" раздела
  card: {
    backgroundColor: colors.backgroundSecondary, // чуть светлее, чем общий фон
    borderColor: colors.borderMuted,
    borderWidth: 1.5,                            // явная обводка
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
    height: "100%",
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated ?? colors.surface,
    borderColor: colors.accent,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },

  // заголовки групп
  groupWrapper: {
    flexBasis: "100%",
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
});
