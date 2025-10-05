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

interface ConsultantStats {
  totalClients: number;
  activeApplications: number;
  completedApplications: number;
  successRate: number;
  monthlyEarnings: number;
  pendingTasks: number;
}

interface Client {
  id: string;
  name: string;
  company: string;
  sector: string;
  applicationStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  lastContact: string;
  priority: 'high' | 'medium' | 'low';
}

interface Task {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
}

const ConsultantDashboardScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<ConsultantStats>({
    totalClients: 0,
    activeApplications: 0,
    completedApplications: 0,
    successRate: 0,
    monthlyEarnings: 0,
    pendingTasks: 0,
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
        totalClients: 45,
        activeApplications: 23,
        completedApplications: 156,
        successRate: 87.5,
        monthlyEarnings: 45000,
        pendingTasks: 8,
      });
      
      setClients([
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          company: 'Tech Solutions Ltd.',
          sector: 'Teknoloji',
          applicationStatus: 'pending',
          lastContact: '2 gün önce',
          priority: 'high'
        },
        {
          id: '2',
          name: 'Fatma Kaya',
          company: 'Green Energy Co.',
          sector: 'Enerji',
          applicationStatus: 'in_review',
          lastContact: '1 hafta önce',
          priority: 'medium'
        },
        {
          id: '3',
          name: 'Mehmet Demir',
          company: 'Food Industries',
          sector: 'Gıda',
          applicationStatus: 'approved',
          lastContact: '3 gün önce',
          priority: 'low'
        }
      ]);
      
      setTasks([
        {
          id: '1',
          title: 'KOBİ başvuru dosyası hazırlama',
          client: 'Ahmet Yılmaz',
          dueDate: 'Bugün',
          priority: 'high',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Ar-Ge teşvik başvurusu inceleme',
          client: 'Fatma Kaya',
          dueDate: 'Yarın',
          priority: 'medium',
          status: 'in_progress'
        },
        {
          id: '3',
          title: 'İhracat teşvik raporu hazırlama',
          client: 'Mehmet Demir',
          dueDate: '3 gün sonra',
          priority: 'low',
          status: 'pending'
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
      case 'in_progress':
        return '#3B82F6';
      case 'approved':
      case 'completed':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
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
            <Text style={styles.headerTitle}>Danışman Paneli</Text>
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
              title="Toplam Müşteri"
              value={stats.totalClients.toString()}
              subtitle="5 yeni müşteri"
              color="#3B82F6"
              icon="👥"
            />
            <StatCard
              title="Aktif Başvuru"
              value={stats.activeApplications.toString()}
              subtitle="İnceleme aşamasında"
              color="#F59E0B"
              icon="📄"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Başarı Oranı"
              value={`%${stats.successRate}`}
              subtitle="Son 6 ay ortalaması"
              color="#10B981"
              icon="📈"
            />
            <StatCard
              title="Aylık Kazanç"
              value={`₺${stats.monthlyEarnings.toLocaleString()}`}
              subtitle="Bu ay"
              color="#8B5CF6"
              icon="💰"
            />
          </View>
        </Animated.View>

        {/* Recent Clients */}
        <Animated.View style={[styles.clientsContainer, animatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Müşteriler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.clientsList}>
            {clients.map((client) => (
              <TouchableOpacity key={client.id} style={styles.clientItem}>
                <View style={styles.clientInfo}>
                  <View style={styles.clientHeader}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(client.priority) }]}>
                      <Text style={styles.priorityText}>
                        {client.priority === 'high' ? 'Yüksek' : client.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.clientCompany}>{client.company}</Text>
                  <Text style={styles.clientSector}>{client.sector}</Text>
                  <View style={styles.clientFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(client.applicationStatus) }]}>
                      <Text style={styles.statusText}>
                        {client.applicationStatus === 'pending' ? 'Beklemede' :
                         client.applicationStatus === 'in_review' ? 'İncelemede' :
                         client.applicationStatus === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </Text>
                    </View>
                    <Text style={styles.lastContact}>{client.lastContact}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Pending Tasks */}
        <Animated.View style={[styles.tasksContainer, animatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bekleyen Görevler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <TouchableOpacity key={task.id} style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>
                        {task.priority === 'high' ? 'Acil' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.taskClient}>Müşteri: {task.client}</Text>
                  <View style={styles.taskFooter}>
                    <Text style={styles.taskDueDate}>📅 {task.dueDate}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                      <Text style={styles.statusText}>
                        {task.status === 'pending' ? 'Beklemede' :
                         task.status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                      </Text>
                    </View>
                  </View>
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
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>Müşteri Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>Yeni Başvuru</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Raporlar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Mesajlar</Text>
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
  clientsContainer: {
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
  clientsList: {
    space: 12,
  },
  clientItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  clientCompany: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  clientSector: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  clientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastContact: {
    fontSize: 12,
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  tasksContainer: {
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
  tasksList: {
    space: 12,
  },
  taskItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  taskClient: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#374151',
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

export default ConsultantDashboardScreen;