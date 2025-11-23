import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ClassDetails } from '@/features/classes/components/ClassDetails';

export default function ClassDetailsScreen() {
  const params = useLocalSearchParams<{ classId?: string | string[] }>();

  const classIdParam = params.classId;
  const classId =
    typeof classIdParam === 'string'
      ? classIdParam
      : Array.isArray(classIdParam)
      ? classIdParam[0]
      : undefined;

  if (!classId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Не указан идентификатор класса.</Text>
      </View>
    );
  }

  return <ClassDetails classId={classId} />;
}
