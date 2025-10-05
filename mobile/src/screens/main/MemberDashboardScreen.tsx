import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MemberStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalIncentiveAmount: number;
  activeIncentives: number;
}

interface Application {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedDate: string;
  amount: number;
  consultant?: string;
}

interface Incentive {
  id: string;
  title: string;
  description: string;
  category: string;
  maxAmount: number;
  deadline: string;
  eligibility: string;
  isRecommended: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  isRead: boolean;
}

const MemberDashboardScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<MemberStats>({
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    totalIncentiveAmount: 0,
    activeIncentives: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedIncentives, setRecommendedIncentives] = useState<Incentive[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    loadDashboardData();
    
    // Animate on mount
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalApplications: 12,
        approvedApplications: 8,
        pendingApplications: 3,
        rejectedApplications: 1,
        totalIncentiveAmount: 250000,
        activeIncentives: 5,
      });
      
      setApplications([
        {
          id: '1',
          title: 'KOBİ Ar-Ge Teşviki',
          type: 'Ar-Ge',
          status: 'approved',
          submittedDate: '15 Ocak 2024',
          amount: 150000,
          consultant: 'Ahmet Yılmaz'
        },
        {
          id: '2',
          title: 'İhracat Teşvik Başvurusu',
          type: 'İhracat',
          status: 'pending',
          submittedDate: '20 Ocak 2024',
          amount: 75000,
          consultant: 'Fatma Kaya'
        },
        {
          id: '3',
          title: 'Yatırım Teşvik Belgesi',
          type: 'Yatırım',
          status: 'in_review',
          submittedDate: '25 Ocak 2024',
          amount: 200000,
          consultant: 'Mehmet Demir'
        }
      ]);
      
      setRecommendedIncentives([
        {
          id: '1',
          title: 'Dijital Dönüşüm Teşviki',
          description: 'Şirketlerin dijital dönüşüm projelerine destek',
          category: 'Teknoloji',
          maxAmount: 500000,
          deadline: '30 Mart 2024',
          eligibility: 'KOBİ statüsündeki şirketler',
          isRecommended: true
        },
        {
          id: '2',
          title: 'Yeşil Enerji Yatırım Desteği',
          description: 'Yenilenebilir enerji yatırımlarına destek',
          category: 'Enerji',
          maxAmount: 1000000,
          deadline: '15 Nisan 2024',
          eligibility: 'Tüm şirketler',
          isRecommended: true
        }
      ]);
      
      setNotifications([
        {
          id: '1',
          title: 'Başvuru Onaylandı',
          message: 'KOBİ Ar-Ge Teşviki başvurunuz onaylandı.',
          type: 'success',
          date: '2 saat önce',
          isRead: false
        },
        {
          id: '2',
          title: 'Eksik Belge',
          message: 'İhracat teşvik başvurunuz için ek belgeler gerekli.',
          type: 'warning',
          date: '1 gün önce',
          isRead: false
        }
      ]);
      
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_review':
        return '#3B82F6';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'info':
      default:
        return '#3B82F6';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    color: string;
    icon: string;
  }> = ({ title, value, subtitle, color, icon }) => {
    const scaleAnim = useSharedValue(1);
    
    const animatedCardStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scaleAnim.value }],
      };
    });

    const handlePress = () => {
      scaleAnim.value = withSpring(0.95, { duration: 100 }, () => {
        scaleAnim.value = withSpring(1, { duration: 100 });
      });
    };

    return (
      <Animated.View style={[animatedCardStyle]}>
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: color }]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.statCardHeader}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={[styles.statSubtitle, { color }]}>{subtitle}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, animatedStyle]}>
          <View>
            <Text style={styles.headerTitle}>Kullanıcı Paneli</Text>
            <Text style={styles.headerSubtitle}>
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            {notifications.some(n => !n.isRead) && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.statsContainer, animatedStyle]}>
          <View style={styles.statsRow}>
            <StatCard
              title="Toplam Başvuru"
              value={stats.totalApplications.toString()}
              subtitle="Son 12 ay"
              color="#3B82F6"
              icon="📄"
            />
            <StatCard
              title="Onaylanan"
              value={stats.approvedApplications.toString()}
              subtitle="Başarılı başvuru"
              color="#10B981"
              icon="✅"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Toplam Tutar"
              value={`₺${stats.totalIncentiveAmount.toLocaleString()}`}
              subtitle="Alınan teşvik"
              color="#8B5CF6"
              icon="💰"
            />
            <StatCard
              title="Beklemede"
              value={stats.pendingApplications.toString()}
              subtitle="İnceleme aşamasında"
              color="#F59E0B"
              icon="⏳"
            />
          </View>
        </Animated.View>

        {/* Recent Applications */}
        <Animated.View style={[styles.applicationsContainer, animatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Başvurularım</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.applicationsList}>
            {applications.map((application) => (
              <TouchableOpacity key={application.id} style={styles.applicationItem}>
                <View style={styles.applicationInfo}>
                  <View style={styles.applicationHeader}>
                    <Text style={styles.applicationTitle}>{application.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                      <Text style={styles.statusText}>
                        {application.status === 'pending' ? 'Beklemede' :
                         application.status === 'in_review' ? 'İncelemede' :
                         application.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.applicationType}>{application.type}</Text>
                  <Text style={styles.applicationAmount}>₺{application.amount.toLocaleString()}</Text>
                  <View style={styles.applicationFooter}>
                    <Text style={styles.applicationDate}>📅 {application.submittedDate}</Text>
                    {application.consultant && (
                      <Text style={styles.consultantName}>👤 {application.consultant}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Recommended Incentives */}
        <Animated.View style={[styles.incentivesContainer, animatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Önerilen Teşvikler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.incentivesList}>
            {recommendedIncentives.filter(i => i.isRecommended).map((incentive) => (
              <TouchableOpacity key={incentive.id} style={styles.incentiveItem}>
                <View style={styles.incentiveInfo}>
                  <View style={styles.incentiveHeader}>
                    <Text style={styles.incentiveTitle}>{incentive.title}</Text>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>⭐ Önerilen</Text>
                    </View>
                  </View>
                  <Text style={styles.incentiveDescription}>{incentive.description}</Text>
                  <Text style={styles.incentiveCategory}>Kategori: {incentive.category}</Text>
                  <View style={styles.incentiveFooter}>
                    <Text style={styles.incentiveAmount}>Max: ₺{incentive.maxAmount.toLocaleString()}</Text>
                    <Text style={styles.incentiveDeadline}>📅 {incentive.deadline}</Text>
                  </View>
                  <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>Başvur</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsContainer, animatedStyle]}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>Yeni Başvuru</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Teşvik Ara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionText}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Destek</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  applicationsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  applicationsList: {
    space: 12,
  },
  applicationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicationInfo: {
    flex: 1,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  applicationType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  applicationAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  consultantName: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  incentivesContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incentivesList: {
    space: 12,
  },
  incentiveItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  incentiveInfo: {
    flex: 1,
  },
  incentiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incentiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: 'bold',
  },
  incentiveDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  incentiveCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  incentiveFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  incentiveAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  incentiveDeadline: {
    fontSize: 12,
    color: '#DC2626',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 80) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MemberDashboardScreen;