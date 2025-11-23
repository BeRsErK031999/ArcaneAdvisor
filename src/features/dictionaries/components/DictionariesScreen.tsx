import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPieceTypes } from '@/features/dictionaries/api/getPieceTypes';
import { getDiceTypes } from '@/features/dictionaries/api/getDiceTypes';
import { getGameTimeUnits } from '@/features/dictionaries/api/getGameTimeUnits';
import { getLengthUnits } from '@/features/dictionaries/api/getLengthUnits';
import { getWeightUnits } from '@/features/dictionaries/api/getWeightUnits';
import { getDamageTypes } from '@/features/dictionaries/api/getDamageTypes';
import { getModifiers } from '@/features/dictionaries/api/getModifiers';
import { getSkills } from '@/features/dictionaries/api/getSkills';
import { getCreatureTypes } from '@/features/dictionaries/api/getCreatureTypes';
import { getCreatureSizes } from '@/features/dictionaries/api/getCreatureSizes';
import type { DictionaryMap } from '@/features/dictionaries/api/types';

type DictionarySection = {
  title: string;
  isLoading: boolean;
  isError: boolean;
  data?: DictionaryMap;
};

const renderDictionaryEntries = (dictionary: DictionaryMap) => {
  const entries = Object.entries(dictionary);

  if (entries.length === 0) {
    return <Text>Значений пока нет.</Text>;
  }

  return entries.map(([key, value]) => (
    <View key={key} style={{ marginBottom: 4 }}>
      <Text style={{ fontWeight: '600' }}>{key}</Text>
      <Text style={{ color: '#333' }}>{value}</Text>
    </View>
  ));
};

export const DictionariesScreen: React.FC = () => {
  const pieceTypesQuery = useQuery({ queryKey: ['piece-types'], queryFn: getPieceTypes });
  const diceTypesQuery = useQuery({ queryKey: ['dice-types'], queryFn: getDiceTypes });
  const gameTimeUnitsQuery = useQuery({ queryKey: ['game-time-units'], queryFn: getGameTimeUnits });
  const lengthUnitsQuery = useQuery({ queryKey: ['length-units'], queryFn: getLengthUnits });
  const weightUnitsQuery = useQuery({ queryKey: ['weight-units'], queryFn: getWeightUnits });
  const damageTypesQuery = useQuery({ queryKey: ['damage-types'], queryFn: getDamageTypes });
  const modifiersQuery = useQuery({ queryKey: ['modifiers'], queryFn: getModifiers });
  const skillsQuery = useQuery({ queryKey: ['skills'], queryFn: getSkills });
  const creatureTypesQuery = useQuery({ queryKey: ['creature-types'], queryFn: getCreatureTypes });
  const creatureSizesQuery = useQuery({ queryKey: ['creature-sizes'], queryFn: getCreatureSizes });

  const sections: DictionarySection[] = [
    {
      title: 'Типы монет',
      isLoading: pieceTypesQuery.isLoading,
      isError: pieceTypesQuery.isError,
      data: pieceTypesQuery.data,
    },
    {
      title: 'Типы кубов',
      isLoading: diceTypesQuery.isLoading,
      isError: diceTypesQuery.isError,
      data: diceTypesQuery.data,
    },
    {
      title: 'Единицы игрового времени',
      isLoading: gameTimeUnitsQuery.isLoading,
      isError: gameTimeUnitsQuery.isError,
      data: gameTimeUnitsQuery.data,
    },
    {
      title: 'Единицы длины',
      isLoading: lengthUnitsQuery.isLoading,
      isError: lengthUnitsQuery.isError,
      data: lengthUnitsQuery.data,
    },
    {
      title: 'Единицы веса',
      isLoading: weightUnitsQuery.isLoading,
      isError: weightUnitsQuery.isError,
      data: weightUnitsQuery.data,
    },
    {
      title: 'Типы урона',
      isLoading: damageTypesQuery.isLoading,
      isError: damageTypesQuery.isError,
      data: damageTypesQuery.data,
    },
    {
      title: 'Модификаторы характеристик',
      isLoading: modifiersQuery.isLoading,
      isError: modifiersQuery.isError,
      data: modifiersQuery.data,
    },
    {
      title: 'Навыки',
      isLoading: skillsQuery.isLoading,
      isError: skillsQuery.isError,
      data: skillsQuery.data,
    },
    {
      title: 'Типы существ',
      isLoading: creatureTypesQuery.isLoading,
      isError: creatureTypesQuery.isError,
      data: creatureTypesQuery.data,
    },
    {
      title: 'Размеры существ',
      isLoading: creatureSizesQuery.isLoading,
      isError: creatureSizesQuery.isError,
      data: creatureSizesQuery.data,
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {sections.map((section) => (
        <View key={section.title} style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{section.title}</Text>

          {section.isLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" />
              <Text>Загрузка...</Text>
            </View>
          ) : null}

          {section.isError ? (
            <Text>Не удалось загрузить этот справочник.</Text>
          ) : null}

          {!section.isLoading && !section.isError && section.data
            ? renderDictionaryEntries(section.data)
            : null}

          {!section.isLoading && !section.isError && !section.data ? (
            <Text>Данные пока не поступили.</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
};
