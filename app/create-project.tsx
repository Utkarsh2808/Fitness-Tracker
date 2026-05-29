/**
 * Create Project Screen
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/stores/projectTaskStore';
import { useSettingsStore } from '@/stores/progressStore';
import { PROJECT_COLORS, PROJECT_ICONS } from '@/constants';

export default function CreateProjectScreen() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const { darkMode } = useSettingsStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PROJECT_ICONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createProject({
        name,
        description,
        color: selectedColor,
        icon: selectedIcon,
      });
      router.back();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const inputBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Project Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBackgroundColor,
                color: textColor,
                borderColor,
              },
            ]}
            placeholder="E.g., Fitness, Learning"
            placeholderTextColor={subtextColor}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              {
                backgroundColor: inputBackgroundColor,
                color: textColor,
                borderColor,
              },
            ]}
            placeholder="Optional description"
            placeholderTextColor={subtextColor}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Color</Text>
          <View style={styles.colorGrid}>
            {PROJECT_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 0,
                    borderColor: textColor,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Icon</Text>
          <View style={styles.iconGrid}>
            {PROJECT_ICONS.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: selectedIcon === icon ? inputBackgroundColor : 'transparent',
                    borderColor: selectedIcon === icon ? '#4F46E5' : borderColor,
                  },
                ]}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleCreate}
          disabled={isLoading || !name.trim()}
          style={[
            styles.createButton,
            {
              opacity: isLoading || !name.trim() ? 0.5 : 1,
            },
          ]}
        >
          <Text style={styles.createButtonText}>{isLoading ? 'Creating...' : 'Create Project'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
