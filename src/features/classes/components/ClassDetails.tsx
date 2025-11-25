import React from 'react';
import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClassById } from '@/features/classes/api/getClassById';
import type { Class } from '@/features/classes/api/types';
import { colors } from '@/shared/theme/colors';

interface ClassDetailsProps {
  classId: string;
}

export const ClassDetails: React.FC<ClassDetailsProps> = ({ classId }) => {
  const router = useRouter();
  const {
    data: classData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Class>({
    queryKey: ['classes', classId],
    queryFn: () => getClassById(classId),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Загружаю класс...</Text>
      </View>
    );
  }

  if (isError) {
    console.error('Error loading class:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Ошибка при загрузке класса.</Text>
        <Text
          onPress={() => refetch()}
          style={{ color: 'blue', textDecorationLine: 'underline' }}
        >
          Повторить запрос
        </Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Класс не найден.</Text>
      </View>
    );
  }

  const primaryMods = classData.primary_modifiers.join(', ');
  const savingThrows = classData.proficiencies.saving_throws.join(', ');
  const skills = classData.proficiencies.skills.join(', ');
  const armorProfs = classData.proficiencies.armors.join(', ');
  const weaponProfs = classData.proficiencies.weapons.join(', ');
  const toolProfs = classData.proficiencies.tools.join(', ');

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{classData.name}</Text>
        <Text style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          {classData.name_in_english}
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(tabs)/library/classes/[classId]/edit',
              params: { classId: classData.class_id },
            })
          }
          style={{
            marginTop: 12,
            marginBottom: 8,
            alignSelf: 'flex-start',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 9999,
            backgroundColor: colors.buttonPrimary,
          }}
        >
          <Text style={{ color: colors.buttonPrimaryText, fontWeight: '500' }}>
            Редактировать
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={{ fontWeight: '600' }}>Основные характеристики:</Text>
        <Text>{primaryMods || '—'}</Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600' }}>Хиты:</Text>
        <Text>
          Кость хитов: {classData.hits.hit_dice.count}d{classData.hits.hit_dice.dice_type}
        </Text>
        <Text>Стартовые хиты: {classData.hits.starting_hits}</Text>
        <Text>Модификатор хитов: {classData.hits.hit_modifier}</Text>
        <Text>Хиты на новых уровнях: {classData.hits.next_level_hits}</Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600' }}>Профициенции:</Text>
        <Text>Доспехи: {armorProfs || '—'}</Text>
        <Text>Оружие: {weaponProfs || '—'}</Text>
        <Text>Инструменты: {toolProfs || '—'}</Text>
        <Text>Спасброски: {savingThrows || '—'}</Text>
        <Text>Навыки: {skills || '—'}</Text>
        <Text>
          Выбор навыков: {classData.proficiencies.number_skills}, инструментов: {classData.proficiencies.number_tools}
        </Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>Описание:</Text>
        <Text>{classData.description}</Text>
      </View>
    </ScrollView>
  );
};
