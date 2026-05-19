import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { MemoryProvider } from './src/contexts/MemoryContext';
import { EventProvider } from './src/contexts/EventContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MemoryProvider>
          <EventProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </EventProvider>
        </MemoryProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
