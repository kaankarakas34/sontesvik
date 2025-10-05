import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { Button } from '../../components/ui';
import { logoutUser } from '../../store/slices/authSlice';
import { USER_TYPE_LABELS, SECTOR_LABELS } from '../../types/user';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Teşvik Başvuru Sistemi</Text>
      </View>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>Kullanıcı Bilgileri</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ad Soyad:</Text>
            <Text style={styles.infoValue}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-posta:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kullanıcı Tipi:</Text>
            <Text style={styles.infoValue}>
              {USER_TYPE_LABELS[user.userType]}
            </Text>
          </View>
          {user.sector && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sektör:</Text>
              <Text style={styles.infoValue}>
                {SECTOR_LABELS[user.sector]}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Text style={styles.actionsTitle}>Hızlı İşlemler</Text>
        <Button
          title="Teşvikleri Görüntüle"
          onPress={() => navigation.navigate('Incentives')}
          style={styles.actionButton}
        />
        <Button
          title="Başvurularım"
          onPress={() => navigation.navigate('Applications')}
          style={styles.actionButton}
        />
        <Button
          title="Profil Ayarları"
          onPress={() => navigation.navigate('Profile')}
          variant="outline"
          style={styles.actionButton}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Çıkış Yap"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#DC2626',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FEE2E2',
  },
  userInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  footer: {
    margin: 16,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default HomeScreen;