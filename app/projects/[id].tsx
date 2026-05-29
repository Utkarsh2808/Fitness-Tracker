/**
 * Project Detail Screen
 * Placeholder for Phase 2
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSettingsStore } from '@/stores/progressStore';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const { darkMode } = useSettingsStore();

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const cardBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Project ID: {id}</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>Coming in Phase 2</Text>
        <Text style={[styles.description, { color: subtextColor }]}>
          Project tasks and progress will be displayed here
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
