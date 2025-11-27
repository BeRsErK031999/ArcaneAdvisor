import { colors } from '@/shared/theme/colors';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface FormSubmitButtonProps {
  title: string;
  isSubmitting?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  title,
  isSubmitting,
  style,
  onPress,
  disabled,
}) => {
  const isDisabled = disabled || isSubmitting;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled ? styles.buttonPressed : null,
        style,
      ]}
    >
      {isSubmitting ? (
        <ActivityIndicator color={colors.buttonPrimaryText} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.buttonPrimary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
    fontSize: 16,
  },
});
