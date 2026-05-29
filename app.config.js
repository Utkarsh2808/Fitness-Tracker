const IS_DEV = process.env.APP_ENV !== 'production';

module.exports = {
  expo: {
    name: 'Progress Tracker',
    slug: 'fitness-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'com.googleusercontent.apps.846422458106-a5jrlu2m3cbejd1abh5lfrd89r64fb76',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTabletMode: true,
      bundleIdentifier: 'com.progresstracker.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      package: 'com.progresstracker.app',
      permissions: [
        'android.permission.INTERNET',
        'android.permission.HEALTH_CONNECT',
        'android.permission.POST_NOTIFICATIONS',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
          },
          ios: {
            deploymentTarget: '16.4',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || '846422458106-a5jrlu2m3cbejd1abh5lfrd89r64fb76.apps.googleusercontent.com',
      googleRedirectUriWeb: process.env.GOOGLE_REDIRECT_URI_WEB || 'http://localhost:8081/auth/google/callback',
      googleRedirectUriMobile: process.env.GOOGLE_REDIRECT_URI_MOBILE || 'com.googleusercontent.apps.846422458106-a5jrlu2m3cbejd1abh5lfrd89r64fb76:/oauth2redirect',
      apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:3001/api',
      eas: {
        projectId: 'b4e79789-48bc-4050-9285-c1608e0beef3',
      },
    },
    owner: 'utkarshsahu',
  },
};
