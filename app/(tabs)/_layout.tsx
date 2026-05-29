/**
 * Main Tab Navigation Layout
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useSettingsStore } from '@/stores/progressStore';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { darkMode } = useSettingsStore();

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const headerBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const tabBarActiveTint = '#4F46E5';
  const tabBarInactiveTint = darkMode ? '#9CA3AF' : '#6B7280';
  const borderTopColor = darkMode ? '#374151' : '#E5E7EB';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: headerBackgroundColor,
          borderBottomColor: borderTopColor,
          borderBottomWidth: 1,
        },
        headerTintColor: textColor,
        headerTitleStyle: {
          color: textColor,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor,
          borderTopColor,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: tabBarActiveTint,
        tabBarInactiveTintColor: tabBarInactiveTint,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          headerTitle: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color }) => <Ionicons name="folder" size={24} color={color} />,
          headerTitle: 'Projects',
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarLabel: 'Health',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
          headerTitle: 'Health',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />,
          headerTitle: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          headerTitle: 'Profile',
        }}
      />
    </Tabs>
  );
}
