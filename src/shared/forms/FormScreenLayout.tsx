import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface FormScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormScreenLayout: React.FC<FormScreenLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 16,
      }}
    >
      <View>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{title}</Text>
        {subtitle ? (
          <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={{ gap: 12 }}>{children}</View>
    </ScrollView>
  );
};
