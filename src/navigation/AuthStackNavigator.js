import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SignupStep1Screen from '../screens/auth/SignupStep1Screen';
import SignupScreen from '../screens/auth/SignupScreen';
import EmailVerifyScreen from '../screens/auth/EmailVerifyScreen';
import PartnerConnectScreen from '../screens/auth/PartnerConnectScreen';

const Stack = createNativeStackNavigator();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignupStep1" component={SignupStep1Screen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} />
      <Stack.Screen name="PartnerConnect" component={PartnerConnectScreen} />
    </Stack.Navigator>
  );
}
