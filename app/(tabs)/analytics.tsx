/**
 * Analytics Screen - Display performance analytics
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/stores/progressStore';

export default function AnalyticsScreen() {
  const { darkMode } = useSettingsStore();

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const cardBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Coming Soon</Text>
        <Text style={[styles.cardDescription, { color: subtextColor }]}>
          Analytics dashboard will display your performance trends, charts, and insights across different time periods.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.featureTitle, { color: textColor }]}>Features</Text>
        {['Daily Analytics', 'Weekly Review', 'Monthly Trends', 'Yearly Overview', 'Task Statistics'].map(
          (feature, index) => (
            <Text key={index} style={[styles.featureItem, { color: subtextColor }]}>
              • {feature}
            </Text>
          )
        )}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 20,
  },
});
