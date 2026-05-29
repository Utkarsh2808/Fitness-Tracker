/**
 * Health Tab - Shows comprehensive health data from Google Fit
 * Steps, Distance, Calories, Heart Rate, Sleep, Exercise Sessions
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSettingsStore } from '@/stores/progressStore';
import {
  HealthData,
  getTodayHealthData,
  getGoogleFitStatus,
  useGoogleFitAuth,
  saveAuthTokens,
  disconnectGoogleFit,
  GoogleFitStatus,
} from '@/services/googleFitService';
import { syncHealthData } from '@/services/syncService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HealthScreen() {
  const { darkMode } = useSettingsStore();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [fitStatus, setFitStatus] = useState<GoogleFitStatus>('disconnected');
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const { request, response, promptAsync } = useGoogleFitAuth();

  const colors = {
    bg: darkMode ? '#0F172A' : '#F8FAFC',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    text: darkMode ? '#F1F5F9' : '#1E293B',
    textSecondary: darkMode ? '#94A3B8' : '#64748B',
    accent: '#6366F1',
    green: '#10B981',
    red: '#EF4444',
    orange: '#F59E0B',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    border: darkMode ? '#334155' : '#E2E8F0',
  };

  const loadData = useCallback(async () => {
    const status = await getGoogleFitStatus();
    setFitStatus(status);

    if (status === 'connected') {
      const data = await getTodayHealthData();
      setHealthData(data);
      syncHealthData(data);
    }
  }, []);

  // Handle OAuth response - Google provider returns access token directly
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      setConnecting(true);
      saveAuthTokens({
        accessToken: response.authentication.accessToken,
        refreshToken: response.authentication.refreshToken,
        expiresIn: response.authentication.expiresIn,
      }).then((success) => {
        setConnecting(false);
        if (success) {
          loadData();
        }
      });
    }
  }, [response]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConnect = async () => {
    setConnecting(true);
    await promptAsync();
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    await disconnectGoogleFit();
    setHealthData(null);
    setFitStatus('disconnected');
  };

  // Show connect screen if not connected
  if (fitStatus !== 'connected') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>💪</Text>
        <Text style={[styles.heroTitle, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}>
          Connect Google Fit
        </Text>
        <Text style={[{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24, fontSize: 14, lineHeight: 20 }]}>
          Link your Google Fit account to see your steps, heart rate, sleep, calories, and exercises.
        </Text>
        {fitStatus === 'no_client_id' && (
          <View style={[styles.banner, { backgroundColor: colors.orange + '20', borderColor: colors.orange, marginBottom: 16 }]}>
            <Text style={[styles.bannerText, { color: colors.orange }]}>
              ⚠️ Google Fit Client ID not configured. Add your OAuth Client ID in googleFitService.ts
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.connectButton, { backgroundColor: colors.accent, opacity: connecting || fitStatus === 'no_client_id' ? 0.5 : 1 }]}
          onPress={handleConnect}
          disabled={connecting || fitStatus === 'no_client_id'}
        >
          {connecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.connectButtonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (!healthData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading health data...</Text>
      </View>
    );
  }

  const stepsGoal = 10000;
  const stepsProgress = Math.min(healthData.steps / stepsGoal, 1);
  const caloriesGoal = 500;
  const caloriesProgress = Math.min(healthData.caloriesBurned / caloriesGoal, 1);

  const formatSleepTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Google Fit connected banner */}
      <View style={[styles.banner, { backgroundColor: colors.green + '20', borderColor: colors.green }]}>
        <Text style={[styles.bannerText, { color: colors.green }]}>
          ✓ Connected to Google Fit
        </Text>
        <TouchableOpacity onPress={handleDisconnect}>
          <Text style={[{ color: colors.red, fontSize: 12, fontWeight: '600' }]}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Steps Card - Hero */}
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroHeader}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>🚶 Steps</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Today</Text>
        </View>
        <View style={styles.heroContent}>
          <Text style={[styles.heroValue, { color: colors.accent }]}>
            {healthData.steps.toLocaleString()}
          </Text>
          <Text style={[styles.heroGoal, { color: colors.textSecondary }]}>
            / {stepsGoal.toLocaleString()} goal
          </Text>
        </View>
        {/* Progress bar */}
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBarFill, { width: `${stepsProgress * 100}%`, backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>
          {Math.round(stepsProgress * 100)}% of daily goal
        </Text>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={[styles.statValue, { color: colors.orange }]}>
            {Math.round(healthData.caloriesBurned)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>kcal</Text>
          <View style={[styles.miniProgress, { backgroundColor: colors.border }]}>
            <View style={[styles.miniProgressFill, { width: `${caloriesProgress * 100}%`, backgroundColor: colors.orange }]} />
          </View>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statIcon}>📏</Text>
          <Text style={[styles.statValue, { color: colors.blue }]}>
            {(healthData.walkingDistance + healthData.runningDistance).toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>km total</Text>
          <View style={styles.distanceBreakdown}>
            <Text style={[styles.distanceDetail, { color: colors.textSecondary }]}>
              🚶 {healthData.walkingDistance.toFixed(1)} • 🏃 {healthData.runningDistance.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Heart Rate Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>❤️ Heart Rate</Text>
          {healthData.heartRate.current && (
            <View style={[styles.liveIndicator, { backgroundColor: colors.red + '20' }]}>
              <View style={[styles.liveDot, { backgroundColor: colors.red }]} />
              <Text style={[styles.liveText, { color: colors.red }]}>Live</Text>
            </View>
          )}
        </View>

        <View style={styles.heartRateRow}>
          <View style={styles.heartRateMain}>
            <Text style={[styles.heartRateValue, { color: colors.red }]}>
              {healthData.heartRate.current || '--'}
            </Text>
            <Text style={[styles.heartRateUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>

          <View style={styles.heartRateStats}>
            <View style={styles.hrStatItem}>
              <Text style={[styles.hrStatLabel, { color: colors.textSecondary }]}>Resting</Text>
              <Text style={[styles.hrStatValue, { color: colors.text }]}>
                {healthData.heartRate.resting || '--'}
              </Text>
            </View>
            <View style={styles.hrStatItem}>
              <Text style={[styles.hrStatLabel, { color: colors.textSecondary }]}>Min</Text>
              <Text style={[styles.hrStatValue, { color: colors.green }]}>
                {healthData.heartRate.min || '--'}
              </Text>
            </View>
            <View style={styles.hrStatItem}>
              <Text style={[styles.hrStatLabel, { color: colors.textSecondary }]}>Max</Text>
              <Text style={[styles.hrStatValue, { color: colors.red }]}>
                {healthData.heartRate.max || '--'}
              </Text>
            </View>
            <View style={styles.hrStatItem}>
              <Text style={[styles.hrStatLabel, { color: colors.textSecondary }]}>Avg</Text>
              <Text style={[styles.hrStatValue, { color: colors.text }]}>
                {healthData.heartRate.average || '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Heart rate mini chart (simplified bar representation) */}
        {healthData.heartRate.samples.length > 0 && (
          <View style={styles.hrChart}>
            {healthData.heartRate.samples.map((sample, i) => {
              const normalizedHeight = Math.max(((sample.bpm - 50) / 120) * 40, 4);
              const barColor = sample.bpm > 120 ? colors.red : sample.bpm > 90 ? colors.orange : colors.green;
              return (
                <View key={i} style={styles.hrChartBar}>
                  <View style={[styles.hrBar, { height: normalizedHeight, backgroundColor: barColor }]} />
                  <Text style={[styles.hrChartLabel, { color: colors.textSecondary }]}>
                    {sample.time.getHours()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Sleep Card */}
      {healthData.sleep && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🌙 Sleep</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Last Night</Text>
          </View>

          <View style={styles.sleepMain}>
            <Text style={[styles.sleepTotal, { color: colors.purple }]}>
              {formatSleepTime(healthData.sleep.totalMinutes)}
            </Text>
            <Text style={[styles.sleepTime, { color: colors.textSecondary }]}>
              {healthData.sleep.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {healthData.sleep.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Sleep stages bar */}
          <View style={styles.sleepStagesBar}>
            <View style={[styles.sleepStage, { flex: healthData.sleep.deepSleepMinutes, backgroundColor: '#1E40AF' }]} />
            <View style={[styles.sleepStage, { flex: healthData.sleep.lightSleepMinutes, backgroundColor: '#60A5FA' }]} />
            <View style={[styles.sleepStage, { flex: healthData.sleep.remSleepMinutes, backgroundColor: colors.purple }]} />
            <View style={[styles.sleepStage, { flex: healthData.sleep.awakeDuringMinutes, backgroundColor: colors.orange }]} />
          </View>

          <View style={styles.sleepLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1E40AF' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Deep {formatSleepTime(healthData.sleep.deepSleepMinutes)}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#60A5FA' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Light {formatSleepTime(healthData.sleep.lightSleepMinutes)}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.purple }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                REM {formatSleepTime(healthData.sleep.remSleepMinutes)}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Awake {formatSleepTime(healthData.sleep.awakeDuringMinutes)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Exercise Sessions Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🏋️ Exercises</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Today</Text>
        </View>

        {healthData.exercises.length === 0 ? (
          <View style={styles.emptyExercise}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No exercises recorded today
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Start a workout to see it here
            </Text>
          </View>
        ) : (
          healthData.exercises.map((exercise) => (
            <View key={exercise.id} style={[styles.exerciseItem, { borderBottomColor: colors.border }]}>
              <View style={styles.exerciseLeft}>
                <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.title}</Text>
                <Text style={[styles.exerciseTime, { color: colors.textSecondary }]}>
                  {exercise.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {exercise.durationMinutes} min
                </Text>
              </View>
              <View style={styles.exerciseRight}>
                {exercise.caloriesBurned > 0 && (
                  <Text style={[styles.exerciseStat, { color: colors.orange }]}>
                    🔥 {Math.round(exercise.caloriesBurned)} kcal
                  </Text>
                )}
                {exercise.distance && (
                  <Text style={[styles.exerciseStat, { color: colors.blue }]}>
                    📏 {exercise.distance.toFixed(1)} km
                  </Text>
                )}
                {exercise.heartRateAvg && (
                  <Text style={[styles.exerciseStat, { color: colors.red }]}>
                    ❤️ {exercise.heartRateAvg} bpm
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  heroCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  heroSubtitle: {
    fontSize: 14,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  heroGoal: {
    fontSize: 16,
    marginLeft: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  miniProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  distanceBreakdown: {
    marginTop: 8,
  },
  distanceDetail: {
    fontSize: 11,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heartRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartRateMain: {
    alignItems: 'center',
    marginRight: 24,
  },
  heartRateValue: {
    fontSize: 42,
    fontWeight: '700',
  },
  heartRateUnit: {
    fontSize: 14,
    marginTop: -4,
  },
  heartRateStats: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hrStatItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  hrStatLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  hrStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  hrChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 16,
    height: 60,
    paddingTop: 10,
  },
  hrChartBar: {
    alignItems: 'center',
    flex: 1,
  },
  hrBar: {
    width: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  hrChartLabel: {
    fontSize: 9,
  },
  sleepMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sleepTotal: {
    fontSize: 36,
    fontWeight: '700',
  },
  sleepTime: {
    fontSize: 14,
    marginTop: 4,
  },
  sleepStagesBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sleepStage: {
    height: '100%',
  },
  sleepLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  emptyExercise: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  exerciseLeft: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  exerciseTime: {
    fontSize: 13,
    marginTop: 2,
  },
  exerciseRight: {
    alignItems: 'flex-end',
  },
  exerciseStat: {
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 1,
  },
  connectButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
