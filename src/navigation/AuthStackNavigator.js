import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import PartnerConnectScreen from '../screens/auth/PartnerConnectScreen';

const Stack = createNativeStackNavigator();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="PartnerConnect" component={PartnerConnectScreen} />
    </Stack.Navigator>
  );
}
