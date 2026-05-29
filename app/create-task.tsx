/**
 * Create Task Screen
 * Placeholder for Phase 2
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/stores/progressStore';

export default function CreateTaskScreen() {
  const { darkMode } = useSettingsStore();

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Create Task</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>Coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
});
