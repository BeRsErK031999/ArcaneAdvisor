import React from 'react';
import { Text } from 'react-native';

interface FormErrorTextProps {
  message?: string;
}

export const FormErrorText: React.FC<FormErrorTextProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
      {message}
    </Text>
  );
};
