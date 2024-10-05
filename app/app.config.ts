const brandFlatColor = '#ff4810';

export default {
  expo: {
    name: 'facts',
    slug: 'facts',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#000000',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#ffffff',
        foregroundImage: './assets/icons/adaptive_icon/foreground_image.png',
        monochromeImage: './assets/icons/adaptive_icon/monochrome_image.png',
      },
      package: 'com.softest.facts',
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || './google-services.json',
      notifications: {
        androidMode: 'collapse',
      },
    },
    notification: {
      icon: './assets/icons/notification_icon.png',
      color: brandFlatColor,
      androidMode: 'collapse',
      androidCollapsedTitle: '#{unread_notifications} new facts for you',
    },
    ios: {
      supportsTablet: true,
    },
    plugins: ['expo-router', 'expo-secure-store'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: '78d9cc3b-bf81-4709-bffa-fdeef99d3f1b',
      },
    },
    owner: 'facts.app',
  },
};
