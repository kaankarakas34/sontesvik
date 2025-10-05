import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/main';
import IncentivesScreen from '../screens/main/IncentivesScreen';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UserType, USER_TYPE_LABELS } from '../types/user';

export type AppDrawerParamList = {
  Home: undefined;
  Incentives: undefined;
  Applications: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  IncentiveDetail: { id: string };
  ApplicationDetail: { id: string };
  CreateApplication: { incentiveId?: string };
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();
const Stack = createStackNavigator<AppStackParamList>();

// Geçici placeholder ekranları
const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.title}>{title}</Text>
      <Text style={placeholderStyles.subtitle}>Bu ekran yakında gelecek...</Text>
    </View>
  );
};

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
const ApplicationsScreen = () => <PlaceholderScreen title="Başvurularım" />;
const ProfileScreen = () => <PlaceholderScreen title="Profil" />;
const SettingsScreen = () => <PlaceholderScreen title="Ayarlar" />;

const DrawerNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#DC2626',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#FFFFFF',
        },
        drawerActiveTintColor: '#DC2626',
        drawerInactiveTintColor: '#6B7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Incentives"
        component={IncentivesScreen}
        options={{
          title: user?.sector ? `${user.sector} Teşvikleri` : 'Teşvikler',
          drawerIcon: ({ color, size }) => (
            <Icon name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          title: 'Başvurularım',
          drawerIcon: ({ color, size }) => (
            <Icon name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          drawerIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
      
      {user?.userType === UserType.ADMIN && (
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Yönetim Paneli',
            drawerIcon: ({ color, size }) => (
              <Icon name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;