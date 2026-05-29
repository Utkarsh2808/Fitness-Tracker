/**
 * Settings Screen
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Pressable, FlatList } from 'react-native';
import { useSettingsStore } from '@/stores/progressStore';
import { NOTIFICATION_TIMES, TIMEZONES } from '@/constants';

export default function SettingsScreen() {
  const {
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
    morningReminderTime,
    setMorningReminderTime,
    afternoonReminderTime,
    setAfternoonReminderTime,
    eveningReminderTime,
    setEveningReminderTime,
    timezone,
    setTimezone,
  } = useSettingsStore();

  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showAfternoonPicker, setShowAfternoonPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  const backgroundColor = darkMode ? '#1F2937' : '#FFFFFF';
  const cardBackgroundColor = darkMode ? '#111827' : '#F9FAFB';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const subtextColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Appearance Section */}
      <View style={[styles.section, { borderBottomColor: borderColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>

      {/* Notifications Section */}
      <View style={[styles.section, { borderBottomColor: borderColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Notifications</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
        </View>

        {notificationsEnabled && (
          <>
            <View style={styles.timingRow}>
              <Text style={[styles.timingLabel, { color: subtextColor }]}>Morning Reminder</Text>
              <Pressable
                onPress={() => setShowMorningPicker(!showMorningPicker)}
                style={[styles.timeButton, { backgroundColor: cardBackgroundColor, borderColor }]}
              >
                <Text style={[styles.timeButtonText, { color: textColor }]}>
                  {morningReminderTime}
                </Text>
              </Pressable>
            </View>

            {showMorningPicker && (
              <View style={[styles.pickerContainer, { backgroundColor: cardBackgroundColor }]}>
                <FlatList
                  data={NOTIFICATION_TIMES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setMorningReminderTime(item);
                        setShowMorningPicker(false);
                      }}
                      style={styles.pickerItem}
                    >
                      <Text style={[styles.pickerItemText, { color: textColor }]}>{item}</Text>
                    </Pressable>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}

            <View style={styles.timingRow}>
              <Text style={[styles.timingLabel, { color: subtextColor }]}>Afternoon Reminder</Text>
              <Pressable
                onPress={() => setShowAfternoonPicker(!showAfternoonPicker)}
                style={[styles.timeButton, { backgroundColor: cardBackgroundColor, borderColor }]}
              >
                <Text style={[styles.timeButtonText, { color: textColor }]}>
                  {afternoonReminderTime}
                </Text>
              </Pressable>
            </View>

            {showAfternoonPicker && (
              <View style={[styles.pickerContainer, { backgroundColor: cardBackgroundColor }]}>
                <FlatList
                  data={NOTIFICATION_TIMES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setAfternoonReminderTime(item);
                        setShowAfternoonPicker(false);
                      }}
                      style={styles.pickerItem}
                    >
                      <Text style={[styles.pickerItemText, { color: textColor }]}>{item}</Text>
                    </Pressable>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}

            <View style={styles.timingRow}>
              <Text style={[styles.timingLabel, { color: subtextColor }]}>Evening Reminder</Text>
              <Pressable
                onPress={() => setShowEveningPicker(!showEveningPicker)}
                style={[styles.timeButton, { backgroundColor: cardBackgroundColor, borderColor }]}
              >
                <Text style={[styles.timeButtonText, { color: textColor }]}>
                  {eveningReminderTime}
                </Text>
              </Pressable>
            </View>

            {showEveningPicker && (
              <View style={[styles.pickerContainer, { backgroundColor: cardBackgroundColor }]}>
                <FlatList
                  data={NOTIFICATION_TIMES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setEveningReminderTime(item);
                        setShowEveningPicker(false);
                      }}
                      style={styles.pickerItem}
                    >
                      <Text style={[styles.pickerItemText, { color: textColor }]}>{item}</Text>
                    </Pressable>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}
          </>
        )}
      </View>

      {/* Regional Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Regional</Text>

        <View style={styles.timingRow}>
          <Text style={[styles.timingLabel, { color: subtextColor }]}>Timezone</Text>
          <Pressable
            onPress={() => setShowTimezonePicker(!showTimezonePicker)}
            style={[styles.timeButton, { backgroundColor: cardBackgroundColor, borderColor }]}
          >
            <Text style={[styles.timeButtonText, { color: textColor }]}>{timezone}</Text>
          </Pressable>
        </View>

        {showTimezonePicker && (
          <View style={[styles.pickerContainer, { backgroundColor: cardBackgroundColor }]}>
            <FlatList
              data={TIMEZONES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setTimezone(item);
                    setShowTimezonePicker(false);
                  }}
                  style={styles.pickerItem}
                >
                  <Text style={[styles.pickerItemText, { color: textColor }]}>{item}</Text>
                </Pressable>
              )}
              maxToRenderPerBatch={10}
            />
          </View>
        )}
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  timingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: {
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerItemText: {
    fontSize: 14,
  },
  spacing: {
    height: 40,
  },
});
