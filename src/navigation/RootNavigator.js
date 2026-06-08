import React from 'react';
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
import DailyQASubmittedScreen from '../screens/chat/DailyQASubmittedScreen';
import LocationShare from '../screens/share/LocationShare';
import TimeCapsuleScreen from '../screens/share/TimeCapsuleScreen';
import TimeCapsuleCreateScreen from '../screens/share/TimeCapsuleCreateScreen';
import TimeCapsuleOpenedScreen from '../screens/share/TimeCapsuleOpenedScreen';
import CoupleDNA from '../screens/my/CoupleDNA';
import WhatIfScreen from '../screens/my/WhatIfScreen';
import WhatIfConflictScreen from '../screens/my/WhatIfConflictScreen';
import WhatIfGiftScreen from '../screens/my/WhatIfGiftScreen';
import WhatIfTripScreen from '../screens/my/WhatIfTripScreen';
import WhatIfCoachScreen from '../screens/my/WhatIfCoachScreen';
import WhatIfSolutionScreen from '../screens/my/WhatIfSolutionScreen';
import NotificationsScreen from '../screens/my/NotificationsScreen';
import SettingsScreen from '../screens/my/SettingsScreen';
import CoupleManageScreen from '../screens/my/CoupleManageScreen';
import AnniversaryAddScreen from '../screens/my/AnniversaryAddScreen';
import ProfileEditScreen from '../screens/my/ProfileEditScreen';
import HelpScreen from '../screens/my/HelpScreen';
import TermsScreen from '../screens/my/TermsScreen';
import VersionScreen from '../screens/my/VersionScreen';
import PasswordChangeScreen from '../screens/my/PasswordChangeScreen';
import DataDownloadScreen from '../screens/my/DataDownloadScreen';
import LogoutScreen from '../screens/my/LogoutScreen';
import UnlinkScreen from '../screens/my/UnlinkScreen';
import DeleteAccountScreen from '../screens/my/DeleteAccountScreen';
import AnniversaryScreen from '../screens/share/AnniversaryScreen';
import MemoryCalendar from '../screens/memory/MemoryCalendar';
import PhotoUpload from '../screens/memory/PhotoUpload';
import PhotoDetailScreen from '../screens/memory/PhotoDetailScreen';
import CharacterScreen from '../screens/home/CharacterScreen';
import SearchScreen from '../screens/share/SearchScreen';
import QuestionHistoryScreen from '../screens/chat/QuestionHistoryScreen';
import QuestionDetailScreen from '../screens/chat/QuestionDetailScreen';
import EventAddScreen from '../screens/share/EventAddScreen';
import EventDetailScreen from '../screens/share/EventDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
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
      <Stack.Screen
        name="DailyQASubmittedScreen"
        component={DailyQASubmittedScreen}
      />
      <Stack.Screen name="LocationShare" component={LocationShare} />
      <Stack.Screen name="TimeCapsuleScreen" component={TimeCapsuleScreen} />
      <Stack.Screen
        name="TimeCapsuleCreateScreen"
        component={TimeCapsuleCreateScreen}
      />
      <Stack.Screen
        name="TimeCapsuleOpenedScreen"
        component={TimeCapsuleOpenedScreen}
      />
      <Stack.Screen name="CoupleDNA" component={CoupleDNA} />
      <Stack.Screen name="WhatIfScreen" component={WhatIfScreen} />
      <Stack.Screen name="WhatIfConflictScreen" component={WhatIfConflictScreen} />
      <Stack.Screen name="WhatIfGiftScreen" component={WhatIfGiftScreen} />
      <Stack.Screen name="WhatIfTripScreen" component={WhatIfTripScreen} />
      <Stack.Screen name="WhatIfCoachScreen" component={WhatIfCoachScreen} />
      <Stack.Screen name="WhatIfSolutionScreen" component={WhatIfSolutionScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="CoupleManageScreen" component={CoupleManageScreen} />
      <Stack.Screen
        name="AnniversaryAddScreen"
        component={AnniversaryAddScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="VersionScreen" component={VersionScreen} />
      <Stack.Screen
        name="PasswordChangeScreen"
        component={PasswordChangeScreen}
      />
      <Stack.Screen
        name="DataDownloadScreen"
        component={DataDownloadScreen}
      />
      <Stack.Screen
        name="LogoutScreen"
        component={LogoutScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen name="UnlinkScreen" component={UnlinkScreen} />
      <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
      <Stack.Screen name="AnniversaryScreen" component={AnniversaryScreen} />
      <Stack.Screen name="MemoryCalendar" component={MemoryCalendar} />
      <Stack.Screen name="PhotoUpload" component={PhotoUpload} />
      <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
      <Stack.Screen name="CharacterScreen" component={CharacterScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="QuestionHistoryScreen" component={QuestionHistoryScreen} />
      <Stack.Screen name="QuestionDetailScreen" component={QuestionDetailScreen} />
      <Stack.Screen name="EventAdd" component={EventAddScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    </Stack.Navigator>
  );
}
