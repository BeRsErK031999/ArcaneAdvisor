import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/shared/theme/colors';
import { FormErrorText } from './FormErrorText';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  value: string | null;
  onChange: (value: string) => void;
  errorMessage?: string;
  options: SelectOption[];
  disabled?: boolean;
  isLoading?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  errorMessage,
  options,
  disabled,
  isLoading,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const closeModal = () => setIsModalVisible(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        disabled={disabled}
        style={[styles.input, disabled && styles.disabledInput]}
        onPress={() => {
          if (!disabled) {
            setIsModalVisible(true);
          }
        }}
      >
        <Text style={[styles.inputText, !selectedOption && styles.placeholderText]}>
          {selectedOption?.label ?? placeholder ?? 'Выберите значение'}
        </Text>
      </Pressable>
      {errorMessage ? <FormErrorText>{errorMessage}</FormErrorText> : null}

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.loadingText}>Загружаю варианты...</Text>
            </View>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.optionItem}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionLabel}>{item.label}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Нет доступных вариантов</Text>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  inputText: {
    color: colors.textPrimary,
  },
  placeholderText: {
    color: colors.inputPlaceholder,
  },
  disabledInput: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.backgroundPrimary,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: colors.accent,
    fontWeight: '600',
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.inputPlaceholder,
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    color: colors.textPrimary,
  },
});
