import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store';
import RootNavigator from './src/navigation';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
    <ActivityIndicator size="large" color="#DC2626" />
  </View>
);

const toastConfig = {
  // Toast konfigürasyonu buraya eklenecek
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootNavigator />
              <Toast config={toastConfig} />
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
