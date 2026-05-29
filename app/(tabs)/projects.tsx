/**
 * Projects Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useProjectStore } from '@/stores/projectTaskStore';
import { useSettingsStore } from '@/stores/progressStore';
import { Link } from 'expo-router';

export default function ProjectsScreen() {
  const { projects, fetchProjects } = useProjectStore();
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const cardBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {projects.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[styles.emptyStateTitle, { color: textColor }]}>No Projects Yet</Text>
          <Text style={[styles.emptyStateText, { color: subtextColor }]}>
            Create your first project to start tracking your progress
          </Text>
          <Link href="/create-project" asChild>
            <Pressable style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Project</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View>
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} asChild>
              <Pressable>
                <View style={[styles.projectCard, { backgroundColor: cardBackgroundColor }]}>
                  <View style={styles.projectHeader}>
                    <Text style={[styles.projectName, { color: textColor }]}>{project.name}</Text>
                    {project.color && (
                      <View style={[styles.colorBadge, { backgroundColor: project.color }]} />
                    )}
                  </View>
                  {project.description && (
                    <Text style={[styles.projectDescription, { color: subtextColor }]}>
                      {project.description}
                    </Text>
                  )}
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      <Link href="/create-project" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  projectCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
  },
  colorBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  projectDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
});
