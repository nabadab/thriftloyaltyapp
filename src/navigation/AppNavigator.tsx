import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { BootstrapScreen } from '../screens/BootstrapScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { VerifyOTPScreen } from '../screens/VerifyOTPScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { StoreSelectorScreen } from '../screens/StoreSelectorScreen';
import { TransactionHistoryScreen } from '../screens/TransactionHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0d1210',
    card: '#161d1a',
    border: '#26302b',
    primary: '#10b981',
    text: '#f4f6f5',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#faf9f6',
    card: '#ffffff',
    border: '#ece9e3',
    primary: '#10b981',
    text: '#1c1c1e',
  },
};

export const AppNavigator: React.FC = () => {
  const scheme = useColorScheme();
  const navTheme = scheme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Bootstrap"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Bootstrap" component={BootstrapScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="StoreSelector"
          component={StoreSelectorScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistoryScreen}
          options={{ presentation: 'modal' }}
        />
        {/* TODO: Add Profile screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
