/**
 * Root Navigator - Main navigation structure using Expo Router
 */

import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { useSettingsStore } from '@/stores/progressStore';

export default function RootNavigator() {
  const { darkMode } = useSettingsStore();

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const tabBarActiveTint = '#4F46E5';
  const tabBarInactiveTint = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="projects/[id]"
        options={{
          headerShown: true,
          title: 'Project',
        }}
      />
      <Stack.Screen
        name="tasks/[id]"
        options={{
          headerShown: true,
          title: 'Task',
        }}
      />
      <Stack.Screen
        name="create-project"
        options={{
          headerShown: true,
          title: 'New Project',
        }}
      />
      <Stack.Screen
        name="create-task"
        options={{
          headerShown: true,
          title: 'New Task',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
    </Stack>
  );
}
