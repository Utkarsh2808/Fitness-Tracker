/**
 * Google Fit Service - Fetches health data via Google Fit REST API
 * Uses Google OAuth2 for authentication and the Fitness API for data
 * 
 * Setup required:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project and enable "Fitness API"
 * 3. Create OAuth 2.0 credentials (Web type)
 * 4. Set the GOOGLE_FIT_CLIENT_ID below
 */

import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete auth sessions that redirect back
WebBrowser.maybeCompleteAuthSession();

// --- CONFIGURATION ---
import Constants from 'expo-constants';
const GOOGLE_FIT_WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId ?? '';

const STORAGE_KEY_TOKEN = 'google_fit_token';
const STORAGE_KEY_REFRESH = 'google_fit_refresh_token';
const STORAGE_KEY_EXPIRY = 'google_fit_token_expiry';

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.location.read',
];

const FITNESS_API_BASE = 'https://www.googleapis.com/fitness/v1/users/me';

const GOOGLE_FIT_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// Re-export types for compatibility
export interface HealthData {
  steps: number;
  walkingDistance: number;
  runningDistance: number;
  caloriesBurned: number;
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
  distance?: number;
  heartRateAvg?: number;
}

export type GoogleFitStatus = 'connected' | 'disconnected' | 'no_client_id';

/**
 * Check if Google Fit is configured and connected
 */
export async function getGoogleFitStatus(): Promise<GoogleFitStatus> {
  if (!GOOGLE_FIT_WEB_CLIENT_ID) return 'no_client_id';
  const token = await getValidToken();
  return token ? 'connected' : 'disconnected';
}

/**
 * Get the Google auth request hook - uses generic useAuthRequest
 * with hardcoded Expo proxy redirect URI
 */
export function useGoogleFitAuth() {
  const redirectUri = 'https://auth.expo.io/@utkarshsahu/fitness-tracker';

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_FIT_WEB_CLIENT_ID,
      redirectUri,
      scopes: SCOPES,
    },
    GOOGLE_FIT_DISCOVERY
  );

  return { request, response, promptAsync };
}

/**
 * Save the authentication response tokens
 */
export async function saveAuthTokens(authentication: { accessToken: string; refreshToken?: string | null; expiresIn?: number | null }): Promise<boolean> {
  try {
    if (authentication.accessToken) {
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, authentication.accessToken);
      if (authentication.refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEY_REFRESH, authentication.refreshToken);
      }
      const expiry = Date.now() + (authentication.expiresIn || 3600) * 1000;
      await AsyncStorage.setItem(STORAGE_KEY_EXPIRY, expiry.toString());
      return true;
    }
    return false;
  } catch (err) {
    console.error('[GoogleFit] Save tokens failed:', err);
    return false;
  }
}

/**
 * Disconnect Google Fit (remove stored tokens)
 */
export async function disconnectGoogleFit(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_REFRESH, STORAGE_KEY_EXPIRY]);
}

/**
 * Get a valid access token, refreshing if expired
 */
async function getValidToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
  const expiryStr = await AsyncStorage.getItem(STORAGE_KEY_EXPIRY);

  if (!token) return null;

  const expiry = expiryStr ? parseInt(expiryStr) : 0;
  if (Date.now() < expiry - 60000) {
    return token; // Still valid (with 1 min buffer)
  }

  // Try to refresh using Google's token endpoint
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEY_REFRESH);
  if (!refreshToken) return null;

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${GOOGLE_FIT_WEB_CLIENT_ID}&refresh_token=${refreshToken}&grant_type=refresh_token`,
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (data.access_token) {
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
      const newExpiry = Date.now() + (data.expires_in || 3600) * 1000;
      await AsyncStorage.setItem(STORAGE_KEY_EXPIRY, newExpiry.toString());
      return data.access_token;
    }
  } catch (err) {
    console.error('[GoogleFit] Token refresh failed:', err);
  }

  return null;
}

/**
 * Get today's health data from Google Fit
 */
export async function getTodayHealthData(): Promise<HealthData> {
  const token = await getValidToken();
  if (!token) {
    return getEmptyHealthData();
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMillis = startOfDay.getTime();
  const endMillis = now.getTime();

  // Yesterday evening to now for sleep
  const sleepStart = new Date(startOfDay);
  sleepStart.setDate(sleepStart.getDate() - 1);
  sleepStart.setHours(20, 0, 0, 0);

  const [steps, distance, calories, heartRate, sleep, exercises] = await Promise.all([
    fetchSteps(token, startMillis, endMillis),
    fetchDistance(token, startMillis, endMillis),
    fetchCalories(token, startMillis, endMillis),
    fetchHeartRate(token, startMillis, endMillis),
    fetchSleep(token, sleepStart.getTime(), endMillis),
    fetchExercises(token, startMillis, endMillis),
  ]);

  return {
    steps,
    walkingDistance: distance.walking,
    runningDistance: distance.running,
    caloriesBurned: calories,
    heartRate,
    sleep,
    exercises,
  };
}

/**
 * Check if using simulated data (returns false since we use real Google Fit)
 */
export function isUsingSimulatedData(): boolean {
  return false;
}

// --- Google Fit REST API calls ---

async function fetchAggregate(token: string, startMillis: number, endMillis: number, dataTypes: { dataTypeName: string }[]) {
  const body = {
    aggregateBy: dataTypes,
    bucketByTime: { durationMillis: endMillis - startMillis },
    startTimeMillis: startMillis,
    endTimeMillis: endMillis,
  };

  const res = await fetch(`${FITNESS_API_BASE}/dataset:aggregate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.warn('[GoogleFit] Aggregate request failed:', res.status);
    return null;
  }

  return res.json();
}

async function fetchSteps(token: string, startMillis: number, endMillis: number): Promise<number> {
  try {
    const data = await fetchAggregate(token, startMillis, endMillis, [
      { dataTypeName: 'com.google.step_count.delta' },
    ]);

    if (!data?.bucket?.[0]?.dataset?.[0]?.point?.[0]) return 0;
    return data.bucket[0].dataset[0].point[0].value[0]?.intVal || 0;
  } catch {
    return 0;
  }
}

async function fetchDistance(token: string, startMillis: number, endMillis: number): Promise<{ walking: number; running: number }> {
  try {
    const data = await fetchAggregate(token, startMillis, endMillis, [
      { dataTypeName: 'com.google.distance.delta' },
    ]);

    if (!data?.bucket?.[0]?.dataset?.[0]?.point?.[0]) return { walking: 0, running: 0 };
    const totalMeters = data.bucket[0].dataset[0].point[0].value[0]?.fpVal || 0;
    const totalKm = totalMeters / 1000;
    // Approximate split: 70% walking, 30% running
    return {
      walking: parseFloat((totalKm * 0.7).toFixed(2)),
      running: parseFloat((totalKm * 0.3).toFixed(2)),
    };
  } catch {
    return { walking: 0, running: 0 };
  }
}

async function fetchCalories(token: string, startMillis: number, endMillis: number): Promise<number> {
  try {
    const data = await fetchAggregate(token, startMillis, endMillis, [
      { dataTypeName: 'com.google.calories.expended' },
    ]);

    if (!data?.bucket?.[0]?.dataset?.[0]?.point?.[0]) return 0;
    return Math.round(data.bucket[0].dataset[0].point[0].value[0]?.fpVal || 0);
  } catch {
    return 0;
  }
}

async function fetchHeartRate(token: string, startMillis: number, endMillis: number): Promise<HeartRateData> {
  const empty: HeartRateData = { current: null, resting: null, min: null, max: null, average: null, samples: [] };
  try {
    const data = await fetchAggregate(token, startMillis, endMillis, [
      { dataTypeName: 'com.google.heart_rate.bpm' },
    ]);

    if (!data?.bucket?.[0]?.dataset?.[0]?.point?.length) return empty;

    const points = data.bucket[0].dataset[0].point;
    const samples: { time: Date; bpm: number }[] = [];
    let min = Infinity, max = -Infinity, sum = 0;

    for (const pt of points) {
      const bpm = pt.value[0]?.fpVal || 0;
      const time = new Date(parseInt(pt.startTimeNanos) / 1e6);
      if (bpm > 0) {
        samples.push({ time, bpm: Math.round(bpm) });
        min = Math.min(min, bpm);
        max = Math.max(max, bpm);
        sum += bpm;
      }
    }

    if (samples.length === 0) return empty;

    return {
      current: samples[samples.length - 1]?.bpm || null,
      resting: Math.round(min),
      min: Math.round(min),
      max: Math.round(max),
      average: Math.round(sum / samples.length),
      samples,
    };
  } catch {
    return empty;
  }
}

async function fetchSleep(token: string, startMillis: number, endMillis: number): Promise<SleepData | null> {
  try {
    // Use sessions API for sleep
    const url = `${FITNESS_API_BASE}/sessions?startTime=${new Date(startMillis).toISOString()}&endTime=${new Date(endMillis).toISOString()}&activityType=72`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (!data.session?.length) return null;

    // Get the most recent sleep session
    const sleepSession = data.session[data.session.length - 1];
    const sleepStart = new Date(parseInt(sleepSession.startTimeMillis));
    const sleepEnd = new Date(parseInt(sleepSession.endTimeMillis));
    const totalMinutes = Math.round((sleepEnd.getTime() - sleepStart.getTime()) / 60000);

    // Try to get sleep stages from dataset
    const stagesData = await fetchAggregate(token, parseInt(sleepSession.startTimeMillis), parseInt(sleepSession.endTimeMillis), [
      { dataTypeName: 'com.google.sleep.segment' },
    ]);

    let deepSleep = 0, lightSleep = 0, remSleep = 0, awake = 0;

    if (stagesData?.bucket?.[0]?.dataset?.[0]?.point) {
      for (const pt of stagesData.bucket[0].dataset[0].point) {
        const stage = pt.value[0]?.intVal;
        const startNanos = parseInt(pt.startTimeNanos);
        const endNanos = parseInt(pt.endTimeNanos);
        const mins = Math.round((endNanos - startNanos) / 6e10);

        switch (stage) {
          case 1: awake += mins; break;       // Awake
          case 2: case 3: lightSleep += mins; break; // Light sleep
          case 4: case 5: deepSleep += mins; break;  // Deep sleep
          case 6: remSleep += mins; break;    // REM
        }
      }
    }

    // If no stage data, estimate
    if (deepSleep + lightSleep + remSleep + awake === 0) {
      deepSleep = Math.round(totalMinutes * 0.2);
      lightSleep = Math.round(totalMinutes * 0.45);
      remSleep = Math.round(totalMinutes * 0.25);
      awake = Math.round(totalMinutes * 0.1);
    }

    return {
      totalMinutes,
      deepSleepMinutes: deepSleep,
      lightSleepMinutes: lightSleep,
      remSleepMinutes: remSleep,
      awakeDuringMinutes: awake,
      startTime: sleepStart,
      endTime: sleepEnd,
    };
  } catch {
    return null;
  }
}

async function fetchExercises(token: string, startMillis: number, endMillis: number): Promise<ExerciseSession[]> {
  try {
    const url = `${FITNESS_API_BASE}/sessions?startTime=${new Date(startMillis).toISOString()}&endTime=${new Date(endMillis).toISOString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];
    const data = await res.json();

    if (!data.session?.length) return [];

    const exercises: ExerciseSession[] = [];
    const activityNames: Record<number, string> = {
      7: 'Walking', 8: 'Running', 1: 'Biking', 9: 'Aerobics',
      10: 'Badminton', 13: 'Basketball', 17: 'Cricket', 20: 'Dancing',
      25: 'Football', 35: 'Hiking', 57: 'Swimming', 58: 'Tennis',
      80: 'Yoga', 97: 'Weightlifting', 98: 'Workout',
    };

    for (const session of data.session) {
      const actType = session.activityType;
      // Skip sleep (72) and still (3) and unknown (4)
      if (actType === 72 || actType === 3 || actType === 4 || actType === 0) continue;

      const startTime = new Date(parseInt(session.startTimeMillis));
      const endTime = new Date(parseInt(session.endTimeMillis));
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      if (durationMinutes < 1) continue;

      exercises.push({
        id: session.id || `ex_${startTime.getTime()}`,
        type: activityNames[actType] || 'Workout',
        title: session.name || activityNames[actType] || 'Exercise',
        startTime,
        endTime,
        durationMinutes,
        caloriesBurned: 0, // Would need separate calorie query per session
        distance: undefined,
      });
    }

    return exercises;
  } catch {
    return [];
  }
}

function getEmptyHealthData(): HealthData {
  return {
    steps: 0,
    walkingDistance: 0,
    runningDistance: 0,
    caloriesBurned: 0,
    heartRate: { current: null, resting: null, min: null, max: null, average: null, samples: [] },
    sleep: null,
    exercises: [],
  };
}
