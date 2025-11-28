import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SelectOption } from './SelectField';
import { colors } from '@/shared/theme/colors';
import { FormErrorText } from './FormErrorText';

interface MultiSelectFieldProps {
  label: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  errorMessage?: string;
  options: SelectOption[];
  disabled?: boolean;
  isLoading?: boolean;
  allowCustomOption?: boolean;
  onCreateCustomOption?: (label: string) => string | null;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  placeholder,
  values,
  onChange,
  errorMessage,
  options,
  disabled,
  isLoading,
  allowCustomOption,
  onCreateCustomOption,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [customLabel, setCustomLabel] = React.useState('');
  const [isAddingCustom, setIsAddingCustom] = React.useState(false);

  const selectedOptions = React.useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );

  const toggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((value) => value !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  const handleAddCustomOption = () => {
    if (!allowCustomOption || !onCreateCustomOption) {
      return;
    }

    const trimmedLabel = customLabel.trim();
    if (!trimmedLabel) {
      return;
    }

    const newValue = onCreateCustomOption(trimmedLabel);
    if (newValue) {
      onChange([...values, newValue]);
      setCustomLabel('');
      setIsAddingCustom(false);
    }
  };

  const placeholderText =
    selectedOptions.length > 0
      ? selectedOptions.map((option) => option.label).join(', ')
      : placeholder ?? 'Выберите значения';

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
        <Text
          style={[styles.inputText, selectedOptions.length === 0 && styles.placeholderText]}
        >
          {placeholderText}
        </Text>
      </Pressable>
      {errorMessage ? <FormErrorText>{errorMessage}</FormErrorText> : null}

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Готово</Text>
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
              renderItem={({ item }) => {
                const isSelected = values.includes(item.value);
                return (
                  <Pressable
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => toggleOption(item.value)}
                  >
                    <Text
                      style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Нет доступных вариантов</Text>
              }
            />
          )}

          {allowCustomOption ? (
            <View style={styles.customContainer}>
              {isAddingCustom ? (
                <View style={styles.customInputRow}>
                  <TextInput
                    value={customLabel}
                    onChangeText={setCustomLabel}
                    placeholder="Новая характеристика"
                    style={[styles.input, styles.customInput]}
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                  <Pressable style={styles.addButton} onPress={handleAddCustomOption}>
                    <Text style={styles.addButtonText}>Добавить</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.customTrigger}
                  onPress={() => setIsAddingCustom(true)}
                >
                  <Text style={styles.customTriggerText}>+ Добавить вариант</Text>
                </Pressable>
              )}
            </View>
          ) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionItemSelected: {
    backgroundColor: colors.inputBackground,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  optionLabelSelected: {
    fontWeight: '700',
  },
  checkmark: {
    color: colors.accent,
    fontWeight: '700',
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
  customContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  customTrigger: {
    paddingVertical: 12,
  },
  customTriggerText: {
    color: colors.accent,
    fontWeight: '600',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
});
