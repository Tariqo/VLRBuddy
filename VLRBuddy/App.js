import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { startScheduler, stopScheduler } from './src/services/scheduler';
import { BACKEND_URL, PANDASCORE_API_KEY } from '@env';

export default function App() {
  useEffect(() => {
    console.log('Starting app...');
    console.log('BACKEND_URL:', BACKEND_URL);
    console.log('PANDASCORE_API_KEY loaded:', !!PANDASCORE_API_KEY);
    
    // Start the data scheduler
    console.log('Initializing data scheduler...');
    startScheduler()
      .catch(error => {
        console.error('Error starting scheduler:', error);
      });

    // Cleanup function
    return () => {
      console.log('Stopping app...');
      stopScheduler();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
