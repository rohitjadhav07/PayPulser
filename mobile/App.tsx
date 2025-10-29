import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { StorageService } from './src/services/StorageService';
import { NotificationService } from './src/services/NotificationService';
import { ErrorRecoveryService } from './src/services/ErrorRecoveryService';

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const storage = new StorageService();
  const notifications = NotificationService.getInstance();
  const errorRecovery = ErrorRecoveryService.getInstance();

  useEffect(() => {
    initializeApp();
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Request notification permissions
      await notifications.requestPermissions();
      
      // Recover app state
      await errorRecovery.recoverAppState();
      
      // Check onboarding
      await checkOnboarding();
    } catch (error) {
      console.error('App initialization failed:', error);
      await checkOnboarding(); // Continue anyway
    }
  };

  const handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active') {
      console.log('App became active - recovering state');
      await errorRecovery.recoverAppState();
    }
  };

  const checkOnboarding = async () => {
    const wallet = await storage.getWallet();
    setIsOnboarded(!!wallet);
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleLogout = async () => {
    // In production, clear all user data
    setIsOnboarded(false);
  };

  if (isOnboarded === null) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#14F195" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        {isOnboarded ? (
          <HomeScreen onLogout={handleLogout} />
        ) : (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
      </View>
    </SafeAreaProvider>
  );
}
