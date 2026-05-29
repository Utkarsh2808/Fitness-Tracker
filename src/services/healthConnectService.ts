/**
 * Health Connect Service - Integrates with Android Health Connect
 * Reads steps, distance, calories, heart rate, sleep, and exercise data
 * 
 * NOTE: In Expo Go, native Health Connect modules are unavailable.
 * Simulated data is shown. When you create a development build with
 * react-native-health-connect, set USE_NATIVE_HEALTH_CONNECT = true
 * and uncomment the native integration code.
 */

// Health Connect types
export interface HealthData {
  steps: number;
  walkingDistance: number; // km
  runningDistance: number; // km
  caloriesBurned: number; // kcal
  heartRate: HeartRateData;
  sleep: SleepData | null;
  exercises: ExerciseSession[];
}

export interface HeartRateData {
  current: number | null;
  resting: number | null;
  min: number | null;
  max: number | null;
  average: number | null;
  samples: { time: Date; bpm: number }[];
}

export interface SleepData {
  totalMinutes: number;
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  remSleepMinutes: number;
  awakeDuringMinutes: number;
  startTime: Date;
  endTime: Date;
}

export interface ExerciseSession {
  id: string;
  type: string;
  title: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  caloriesBurned: number;
  distance?: number; // km
  heartRateAvg?: number;
}

export type HealthConnectStatus = 'available' | 'unavailable' | 'not_installed' | 'unauthorized';

// Toggle this to true when using a development build with native Health Connect
const USE_NATIVE_HEALTH_CONNECT = false;

/**
 * Check if Health Connect is available on this device
 */
export async function checkHealthConnectStatus(): Promise<HealthConnectStatus> {
  if (!USE_NATIVE_HEALTH_CONNECT) return 'unavailable';
  return 'unavailable';
}

/**
 * Initialize and request permissions from Health Connect
 */
export async function initializeHealthConnect(): Promise<boolean> {
  if (!USE_NATIVE_HEALTH_CONNECT) return false;
  return false;
}

/**
 * Get today's health data
 */
export async function getTodayHealthData(): Promise<HealthData> {
  return getSimulatedData();
}

/**
 * Get health data for a specific date range
 */
export async function getHealthDataForRange(startDate: Date, endDate: Date): Promise<HealthData> {
  return getSimulatedData();
}

/**
 * Check if we're using simulated data (Expo Go / no Health Connect)
 */
export function isUsingSimulatedData(): boolean {
  return !USE_NATIVE_HEALTH_CONNECT;
}

// --- Simulated data that mimics real Health Connect data ---

function getSimulatedData(): HealthData {
  const hour = new Date().getHours();
  const progressFactor = Math.min(hour / 18, 1); // Progress through day

  const baseSteps = Math.round(8500 * progressFactor + Math.random() * 1000);
  const baseDistance = parseFloat((baseSteps * 0.0007).toFixed(2));

  return {
    steps: baseSteps,
    walkingDistance: parseFloat((baseDistance * 0.7).toFixed(2)),
    runningDistance: parseFloat((baseDistance * 0.3).toFixed(2)),
    caloriesBurned: Math.round(320 * progressFactor + Math.random() * 80),
    heartRate: {
      current: 68 + Math.round(Math.random() * 12),
      resting: 62,
      min: 55 + Math.round(Math.random() * 5),
      max: 130 + Math.round(Math.random() * 30),
      average: 72 + Math.round(Math.random() * 8),
      samples: generateHeartRateSamples(),
    },
    sleep: {
      totalMinutes: 420 + Math.round(Math.random() * 60),
      deepSleepMinutes: 80 + Math.round(Math.random() * 30),
      lightSleepMinutes: 180 + Math.round(Math.random() * 40),
      remSleepMinutes: 90 + Math.round(Math.random() * 20),
      awakeDuringMinutes: 15 + Math.round(Math.random() * 15),
      startTime: new Date(new Date().setHours(23, 30, 0, 0) - 86400000),
      endTime: new Date(new Date().setHours(7, 0, 0, 0)),
    },
    exercises: hour >= 8 ? [
      {
        id: '1',
        type: 'Running',
        title: 'Morning Run',
        startTime: new Date(new Date().setHours(6, 30, 0, 0)),
        endTime: new Date(new Date().setHours(7, 5, 0, 0)),
        durationMinutes: 35,
        caloriesBurned: 280 + Math.round(Math.random() * 50),
        distance: 4.2 + Math.random() * 0.8,
        heartRateAvg: 145,
      },
    ] : [],
  };
}

function generateHeartRateSamples(): { time: Date; bpm: number }[] {
  const samples: { time: Date; bpm: number }[] = [];
  const now = new Date();
  const hour = now.getHours();

  for (let h = 6; h <= Math.min(hour, 22); h++) {
    let baseBpm = 70;
    if (h >= 6 && h <= 7) baseBpm = 140; // morning exercise
    else if (h >= 12 && h <= 13) baseBpm = 85; // lunch walk
    else if (h >= 22) baseBpm = 62; // resting

    samples.push({
      time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0),
      bpm: baseBpm + Math.round(Math.random() * 10 - 5),
    });
  }

  return samples;
}

