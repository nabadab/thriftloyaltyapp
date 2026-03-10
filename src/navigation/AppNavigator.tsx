import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LoginScreen } from '../screens/LoginScreen';
import { VerifyOTPScreen } from '../screens/VerifyOTPScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { StoreSelectorScreen } from '../screens/StoreSelectorScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f0f0f',
    card: '#1a1a1a',
    border: '#333',
    primary: '#0a84ff',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5f5f7',
    card: '#ffffff',
    border: '#e0e0e0',
    primary: '#0a84ff',
  },
};

export const AppNavigator: React.FC = () => {
  const scheme = useColorScheme();
  const navTheme = scheme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="StoreSelector"
          component={StoreSelectorScreen}
          options={{ presentation: 'modal' }}
        />
        {/* TODO: Add Profile, TransactionHistory, Offers, LoyaltyCard screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
