import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { MemoryProvider } from './src/contexts/MemoryContext';
import { EventProvider } from './src/contexts/EventContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <MemoryProvider>
        <EventProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </EventProvider>
      </MemoryProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
