import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import AuthStackNavigator from './AuthStackNavigator';
import BottomTabNavigator from './BottomTabNavigator';

// Additional stack screens
import ReportView from '../screens/my/ReportView';
import AIJudgeModal from '../screens/chat/AIJudgeModal';
import RecordScreen from '../screens/memory/RecordScreen';
import YearAgoScreen from '../screens/memory/YearAgoScreen';
import DailyQAScreen from '../screens/chat/DailyQAScreen';
import LocationShare from '../screens/share/LocationShare';
import TimeCapsuleScreen from '../screens/share/TimeCapsuleScreen';
import CoupleDNA from '../screens/my/CoupleDNA';
import WhatIfScreen from '../screens/my/WhatIfScreen';
import NotificationsScreen from '../screens/my/NotificationsScreen';
import SettingsScreen from '../screens/my/SettingsScreen';
import AnniversaryScreen from '../screens/share/AnniversaryScreen';
import MemoryCalendar from '../screens/memory/MemoryCalendar';
import PhotoUpload from '../screens/memory/PhotoUpload';
import CharacterScreen from '../screens/home/CharacterScreen';
import SearchScreen from '../screens/share/SearchScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [isAuthenticated] = useState(true); // Default to authenticated for now

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        initialParams={{ isAuthenticated }}
      />
      <Stack.Screen name="Auth" component={AuthStackNavigator} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ReportView" component={ReportView} />
      <Stack.Screen
        name="AIJudgeModal"
        component={AIJudgeModal}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="RecordScreen" component={RecordScreen} />
      <Stack.Screen name="YearAgoScreen" component={YearAgoScreen} />
      <Stack.Screen name="DailyQAScreen" component={DailyQAScreen} />
      <Stack.Screen name="LocationShare" component={LocationShare} />
      <Stack.Screen name="TimeCapsuleScreen" component={TimeCapsuleScreen} />
      <Stack.Screen name="CoupleDNA" component={CoupleDNA} />
      <Stack.Screen name="WhatIfScreen" component={WhatIfScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="AnniversaryScreen" component={AnniversaryScreen} />
      <Stack.Screen name="MemoryCalendar" component={MemoryCalendar} />
      <Stack.Screen name="PhotoUpload" component={PhotoUpload} />
      <Stack.Screen name="CharacterScreen" component={CharacterScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
    </Stack.Navigator>
  );
}
