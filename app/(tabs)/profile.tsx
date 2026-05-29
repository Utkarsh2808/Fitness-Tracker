/**
 * Profile Screen - User profile and settings
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Pressable, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '@/stores/progressStore';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  const {
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
  } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const cardBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* User Info */}
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={[styles.userName, { color: textColor }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.userEmail, { color: subtextColor }]}>{user?.email || ''}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Notifications</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Settings</Text>

        <Link href="/settings" asChild>
          <Pressable style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: textColor }]}>Advanced Settings</Text>
            <Text style={[styles.settingValue, { color: subtextColor }]}>›</Text>
          </Pressable>
        </Link>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.footerText, { color: subtextColor }]}>Version 1.0.0</Text>
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
    marginBottom: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
