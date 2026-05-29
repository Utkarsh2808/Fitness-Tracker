/**
 * Dashboard Screen
 * Main home screen showing today's performance, tasks, and quick actions
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useProjectStore } from '@/stores/projectTaskStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/progressStore';

export default function DashboardScreen() {
  const { projects, fetchProjects } = useProjectStore();
  const { currentDayScore } = useProgressStore();
  const { darkMode } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProjects();
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const cardBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Today's Score Card */}
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Today's Score</Text>
        <Text style={[styles.scoreValue, { color: '#4F46E5' }]}>{Math.round(currentDayScore)}%</Text>
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreBarFill,
              {
                width: `${currentDayScore}%`,
                backgroundColor: currentDayScore >= 75 ? '#10B981' : currentDayScore >= 50 ? '#F59E0B' : '#EF4444',
              },
            ]}
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Projects</Text>
          <Text style={[styles.statValue, { color: textColor }]}>{projects.length}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Tasks</Text>
          <Text style={[styles.statValue, { color: textColor }]}>0</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Streak</Text>
          <Text style={[styles.statValue, { color: textColor }]}>0</Text>
        </View>
      </View>

      {/* Projects List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Projects</Text>
        {projects.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: cardBackgroundColor }]}>
            <Text style={[styles.emptyStateText, { color: subtextColor }]}>No projects yet</Text>
            <Pressable style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Project</Text>
            </Pressable>
          </View>
        ) : (
          projects.map((project) => (
            <View key={project.id} style={[styles.projectCard, { backgroundColor: cardBackgroundColor }]}>
              <Text style={[styles.projectName, { color: textColor }]}>{project.name}</Text>
            </View>
          ))
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 12,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  projectCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
