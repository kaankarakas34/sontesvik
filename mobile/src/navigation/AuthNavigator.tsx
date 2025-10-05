import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, RegisterScreen } from '../screens/auth';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#DC2626',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Giriş Yap',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Üye Ol',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;