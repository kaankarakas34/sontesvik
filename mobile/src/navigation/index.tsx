import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { RootState, AppDispatch } from '../store';
import { getCurrentUser } from '../store/slices/authSlice';

const RootNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Uygulama başladığında token varsa kullanıcı bilgilerini al
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, isLoading]);

  // Uygulama henüz başlatılmadıysa loading göster
  if (!isInitialized || (token && !user && isLoading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  // Token ve user varsa ana uygulamayı göster, yoksa auth ekranlarını göster
  return token && user ? <AppNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;