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

interface DashboardStats {
  totalUsers: number;
  totalIncentives: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'application_submitted' | 'incentive_created' | 'application_approved';
  message: string;
  timestamp: string;
  user?: string;
}

const AdminDashboardScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalIncentives: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    monthlyGrowth: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
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
        totalUsers: 1247,
        totalIncentives: 89,
        totalApplications: 3456,
        pendingApplications: 234,
        approvedApplications: 2890,
        rejectedApplications: 332,
        monthlyGrowth: 12.5,
      });
      
      setRecentActivities([
        {
          id: '1',
          type: 'user_registered',
          message: 'Yeni kullanıcı kaydı: Ahmet Yılmaz',
          timestamp: '2 dakika önce',
          user: 'Ahmet Yılmaz'
        },
        {
          id: '2',
          type: 'application_submitted',
          message: 'Yeni başvuru: KOBİ Destek Programı',
          timestamp: '15 dakika önce',
          user: 'Fatma Kaya'
        },
        {
          id: '3',
          type: 'application_approved',
          message: 'Başvuru onaylandı: Ar-Ge Teşvik Programı',
          timestamp: '1 saat önce',
          user: 'Mehmet Demir'
        },
        {
          id: '4',
          type: 'incentive_created',
          message: 'Yeni teşvik programı eklendi',
          timestamp: '3 saat önce'
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

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return '👤';
      case 'application_submitted':
        return '📄';
      case 'application_approved':
        return '✅';
      case 'incentive_created':
        return '🎯';
      default:
        return '🔔';
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
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.statsContainer, animatedStyle]}>
          <View style={styles.statsRow}>
            <StatCard
              title="Toplam Kullanıcı"
              value={stats.totalUsers.toLocaleString()}
              subtitle={`+${stats.monthlyGrowth}% bu ay`}
              color="#3B82F6"
              icon="👥"
            />
            <StatCard
              title="Aktif Teşvikler"
              value={stats.totalIncentives.toString()}
              subtitle="12 yeni teşvik"
              color="#10B981"
              icon="🎯"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Toplam Başvuru"
              value={stats.totalApplications.toLocaleString()}
              subtitle={`${stats.pendingApplications} beklemede`}
              color="#8B5CF6"
              icon="📄"
            />
            <StatCard
              title="Bekleyen Başvuru"
              value={stats.pendingApplications.toString()}
              subtitle="Acil inceleme gerekli"
              color="#F59E0B"
              icon="⏰"
            />
          </View>
        </Animated.View>

        {/* Application Status Chart */}
        <Animated.View style={[styles.chartContainer, animatedStyle]}>
          <Text style={styles.sectionTitle}>Başvuru Durumu Dağılımı</Text>
          <View style={styles.chartContent}>
            <View style={styles.chartItem}>
              <View style={styles.chartLegend}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Onaylanan</Text>
              </View>
              <Text style={styles.chartValue}>
                {stats.approvedApplications} (%{((stats.approvedApplications / stats.totalApplications) * 100).toFixed(1)})
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: '#10B981',
                    width: `${(stats.approvedApplications / stats.totalApplications) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.chartItem}>
              <View style={styles.chartLegend}>
                <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Beklemede</Text>
              </View>
              <Text style={styles.chartValue}>
                {stats.pendingApplications} (%{((stats.pendingApplications / stats.totalApplications) * 100).toFixed(1)})
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: '#F59E0B',
                    width: `${(stats.pendingApplications / stats.totalApplications) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.chartItem}>
              <View style={styles.chartLegend}>
                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Reddedilen</Text>
              </View>
              <Text style={styles.chartValue}>
                {stats.rejectedApplications} (%{((stats.rejectedApplications / stats.totalApplications) * 100).toFixed(1)})
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: '#EF4444',
                    width: `${(stats.rejectedApplications / stats.totalApplications) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Recent Activities */}
        <Animated.View style={[styles.activitiesContainer, animatedStyle]}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>{getActivityIcon(activity.type)}</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsContainer, animatedStyle]}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>Kullanıcı Yönetimi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>Başvuru İnceleme</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Teşvik Yönetimi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Raporlar</Text>
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
  chartContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  chartContent: {
    space: 16,
  },
  chartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  activitiesContainer: {
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
  activitiesList: {
    space: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
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

export default AdminDashboardScreen;