# ArcaneAdvisor — React Native + Expo Project

ArcaneAdvisor — это мобильное и веб‑приложение на **Expo + React Native + TypeScript**, представляющее собой полнофункциональную SRD‑библиотеку D&D 5e с возможностью создания собственных сущностей: **заклинаний, классов, рас, подклассов, подрас, фитов**, оружия, доспехов и многого другого.

## 📌 Стек проекта

- **Expo + React Native + TypeScript**
- **Expo Router** (маршрутизация через файловую структуру `app/`)
- **@tanstack/react-query** (серверное состояние)
- **axios** (универсальный API‑клиент)
- **react-hook-form + zod** (формы и валидация)
- **Тёмная тема** (`src/shared/theme`)
- Архитектура в стиле **feature-based**

---

# 📁 Структура проекта

```
project-root/
  app/                      # Маршруты (Expo Router)
    _layout.tsx
    index.tsx

    (tabs)/                 # Нижняя вкладочная навигация
      _layout.tsx

      library/              # Справочник (SRD)
        index.tsx           # Меню разделов
        spells/
          index.tsx
          [spellId].tsx
          [spellId]/edit.tsx
          create.tsx
        classes/
          index.tsx
          [classId].tsx
          [classId]/edit.tsx
          create.tsx
        races/
          index.tsx
          [raceId].tsx
          [raceId]/edit.tsx
          create.tsx
        subclasses/
          index.tsx
          [subclassId]/edit.tsx
          create.tsx
        subraces/
          index.tsx
          [subraceId]/edit.tsx
          create.tsx
        feats/
          index.tsx
          [featId]/edit.tsx
          create.tsx

        equipment/
          armors/
            index.tsx
          weapons/
            index.tsx
          tools/
            index.tsx
          materials/
            index.tsx
          material-components/
            index.tsx
          weapon-kinds/
            index.tsx
          weapon-properties/
            index.tsx

        sources/
          index.tsx

        dictionaries/
          index.tsx        # Все словари SRD: кубики, монеты, урон, навыки, типы существ

      characters/
        index.tsx

      rooms/
        index.tsx

      settings/
        index.tsx

  src/
    shared/
      api/
        client.ts          # axios-клиент
      theme/
        colors.ts          # палитра тёмной темы
      ui/
        ScreenContainer.tsx
        FormScreenLayout.tsx
        FormSubmitButton.tsx
        FormErrorText.tsx
      forms/
        formTypes.ts

    features/
      spells/
        api/
          types.ts
          getSpells.ts
          getSpellById.ts
          createSpell.ts
          updateSpell.ts
        components/
          SpellsList.tsx
          SpellDetails.tsx
          SpellForm.tsx

      classes/
        api/
          types.ts
          getClasses.ts
          getClassById.ts
          createClass.ts
          updateClass.ts
        components/
          ClassesList.tsx
          ClassDetails.tsx
          ClassForm.tsx

      races/
        api/
          types.ts
          getRaces.ts
          getRaceById.ts
          createRace.ts
          updateRace.ts
        components/
          RacesList.tsx
          RaceDetails.tsx
          RaceForm.tsx

      subclasses/
        api/
          types.ts
          getSubclasses.ts
          getSubclassById.ts
          createSubclass.ts
          updateSubclass.ts
        components/
          SubclassesList.tsx
          SubclassForm.tsx

      subraces/
        api/
          types.ts
          getSubraces.ts
          getSubraceById.ts
          createSubrace.ts
          updateSubrace.ts
        components/
          SubracesList.tsx
          SubraceForm.tsx

      feats/
        api/
          types.ts
          getFeats.ts
          getFeatById.ts
          createFeat.ts
          updateFeat.ts
        components/
          FeatsList.tsx
          FeatForm.tsx

      armors/
      weapons/
      tools/
      materials/
      material-components/
      weapon-kinds/
      weapon-properties/
      sources/
      dictionaries/
```

---

# 🧱 Архитектурные принципы

### Feature‑based структура

Каждая сущность оформляется как фича:

```
features/<entity>/
  api/
    types.ts
    get<EntityPlural>.ts
    get<Entity>ById.ts
    create<Entity>.ts
    update<Entity>.ts
  components/
    <EntityPlural>List.tsx
    <Entity>Details.tsx
    <Entity>Form.tsx   # Create + Edit
```

Это даёт:

- единый паттерн разработки,
- быстрое добавление новых сущностей,
- предсказуемые маршруты.

---

# 🔌 Работа с API

### API-клиент

Вся работа с сетью идёт через:

```
src/shared/api/client.ts
```

- базовый URL берётся из `.env`
- axios-interceptor логирует и нормализует ошибки
- **запрещено** создавать новые axios-инстансы

### React Query

#### Список сущностей

```ts
useQuery({
  queryKey: ['spells'],
  queryFn: getSpells,
});
```

#### Детальная страница

```ts
useQuery({
  queryKey: ['spells', spellId],
  queryFn: () => getSpellById(spellId),
});
```

#### Create / Update

```ts
const mutation = useMutation({
  mutationFn: createSpell,
  onSuccess: () => queryClient.invalidateQueries(['spells']),
});
```

---

# ✏️ Формы и валидация

Используются:

- `react-hook-form`
- `zod`
- `zodResolver`

### Настройка

```ts
const { control, handleSubmit, reset } = useForm<XCreateInput>({
  resolver: zodResolver(XCreateSchema),
  defaultValues: initialValues ?? defaultValues,
});

useEffect(() => {
  if (initialValues) reset(initialValues);
}, [initialValues]);
```

> Нельзя вызывать `XCreateSchema.parse(defaultValues)` с невалидными полями.

---

# 🎨 UI и тема

Тема лежит в:

```
src/shared/theme/colors.ts
```

**Все** цвета должны использоваться только оттуда:

- фон: `colors.background`
- текст: `colors.textPrimary`
- инпуты: `colors.inputBackground`, `colors.inputBorder`
- ошибки: `colors.error`
- кнопки: `colors.buttonPrimary`

### Обёртка экрана

```tsx
<ScreenContainer>
  {/* любой экран */}
</ScreenContainer>
```

### Обёртка формы

```tsx
<FormScreenLayout title="Создать заклинание">
  {/* поля */}
</FormScreenLayout>
```

### Инпуты

```tsx
<TextInput
  style={{
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    color: colors.textPrimary,
  }}
  placeholderTextColor={colors.inputPlaceholder}
/>
```

---

# 🧩 Как добавить новую сущность

Пример: `backgrounds`.

## 1. API + типы

Создать:

```
features/backgrounds/api/types.ts
features/backgrounds/api/getBackgrounds.ts
features/backgrounds/api/getBackgroundById.ts
features/backgrounds/api/createBackground.ts
features/backgrounds/api/updateBackground.ts
```

## 2. Компоненты

```
features/backgrounds/components/BackgroundsList.tsx
features/backgrounds/components/BackgroundDetails.tsx
features/backgrounds/components/BackgroundForm.tsx
```

## 3. Маршруты

```
app/(tabs)/library/backgrounds/
  index.tsx
  [backgroundId].tsx
  [backgroundId]/edit.tsx
  create.tsx
```

## 4. Добавить пункт в меню

```
app/(tabs)/library/index.tsx
```

## 5. Проверить

```
npx tsc --noEmit
npx expo start
```

---

# ✔️ Правила разработки

Полные правила — в `AGENTS.md`, но основные:

### ❌ нельзя

- использовать `any`
- использовать `fetch` — только `apiClient`
- хардкодить URL API
- писать компоненты без темы/стилей
- делать API‑запросы внутри списков напрямую (только через React Query)

### ✔️ нужно

- использовать `@/` алиасы
- использовать фичи для каждой сущности
- выносить всю логику запросов в `api/`
- соблюдать тему в инпутах/кнопках/тексте
- делать один компонент `Form` для Create+Edit

---

# 🚀 Roadmap

### ✓ Сделано
- Справочник со всеми сущностями
- Детальные страницы
- Create + Edit для основных сущностей
- Базовая тема и UX‑структура

### 🔜 Следующие шаги
- Операции Delete
- Улучшение UI/UX (карточки, поиск, фильтры)
- Создание персонажей
- Создание комнат
- Онлайн‑синхронизация

---

Если нужно — могу подготовить:

- CONTRIBUTING.md  
- Roadmap.md (детальный план развития)  
- Architectural Overview (диаграммы)  
- Документацию для бэкенда или API‑контракты

