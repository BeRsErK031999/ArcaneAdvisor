// src/shared/theme/colors.ts
export const colors = {
  // Фоны
  backgroundPrimary: '#05060B',      // самый тёмный фон (общий background)
  backgroundSecondary: '#111321',    // фон для отдельных блоков / экранов
  surface: '#171A2A',                // карточки, панели
  surfaceElevated: '#202437',        // чуть более светлые панели

  // Бордеры
  borderMuted: '#2A3145',

  // Акценты (золото / магический огонь)
  accent: '#E19C3D',                 // основной акцент: кнопки, ссылки, выделения
  accentSoft: '#3B2A12',             // мягкий фон под акцентные элементы (hover/pressed)

  // Текст
  textPrimary: '#F5F3E7',            // основной текст (почти слоновая кость)
  textSecondary: '#C0C4D0',          // вторичный текст (описания, подписи)
  textMuted: '#8A90A5',              // ещё более приглушённый текст

  // Инпуты
  inputBackground: '#101321',
  inputBorder: '#2E3650',
  inputPlaceholder: '#626887',

  // Кнопки
  buttonPrimary: '#E19C3D',
  buttonPrimaryText: '#0B0C16',
  buttonSecondary: '#2A3145',
  buttonSecondaryText: '#F5F3E7',

  // Статусы
  error: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FFC857',
} as const;

export type AppColors = typeof colors;
