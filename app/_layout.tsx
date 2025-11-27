// app/_layout.tsx
import {
  DarkTheme as NavigationDarkTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";

import { colors } from "@/shared/theme/colors";

export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient();

// Тёмная навигационная тема под нашу палитру
const navigationTheme: Theme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: colors.backgroundPrimary,
    card: colors.backgroundSecondary,
    text: colors.textPrimary,
    border: colors.borderMuted,
    primary: colors.accent, // цвет активных элементов навигации
    notification: NavigationDarkTheme.colors.notification,
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        {/* на тёмном фоне нужен светлый статусбар */}
        <StatusBar style="light" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
