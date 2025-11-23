import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface FormSubmitButtonProps {
  title: string;
  isSubmitting?: boolean;
  style?: ViewStyle;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  title,
  isSubmitting,
  style,
}) => {
  return (
    <TouchableOpacity
      disabled={isSubmitting}
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSubmitting ? '#aaa' : '#007bff',
        },
        style,
      ]}
    >
      {isSubmitting ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
