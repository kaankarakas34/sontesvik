import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tabs,
  Tooltip,
  Popconfirm,
  Avatar,
  Badge,
  Divider,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  BankOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  CrownOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { userService, User, UserStats, Company } from '../../services/userService';
import { sectorsService, Sector } from '../../services/sectorsService';
import { membershipService } from '../../services/membershipService';
import { useAppSelector } from '../../store/hooks';

const { Option } = Select;
const { Title, Text } = Typography;

// Custom styles for modern red-white theme
const modernStyles = {
  pageContainer: {
    background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
    minHeight: '100vh',
    padding: '24px',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.15)',
    marginBottom: '24px',
  },
  headerTitle: {
    color: '#ffffff',
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '16px',
    margin: 0,
  },
  statsCard: {
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    background: '#ffffff',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    border: 'none',
    borderRadius: '8px',
    height: '40px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  secondaryButton: {
    borderColor: '#dc2626',
    color: '#dc2626',
    borderRadius: '8px',
    height: '40px',
    fontWeight: '600',
  },
  filterCard: {
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    background: '#ffffff',
  },
  tableCard: {
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    background: '#ffffff',
  },

};

// Types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  company?: string;
  city?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  inactiveUsers: number;
  adminUsers?: number;
  regularUsers?: number;
  suspendedUsers?: number;
}

const UsersPage: React.FC = () => {
  const { user: currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const isAdmin = currentUser?.role === 'admin';
  
  // Debug logs
  console.log('DEBUG - Current User:', currentUser);
  console.log('DEBUG - Is Admin:', isAdmin);
  console.log('DEBUG - User Role:', currentUser?.role);
  console.log('DEBUG - Is Authenticated:', isAuthenticated);
  
  // Alert for debugging
  if (currentUser) {
    console.log('User found with role:', currentUser.role);
  } else {
    console.log('No user found - need to login');
  }
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [companySearchText, setCompanySearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [companyPagination, setCompanyPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [memberships, setMemberships] = useState<any[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [membershipStats, setMembershipStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [companyDetailModalVisible, setCompanyDetailModalVisible] = useState(false);
  const [isEditMembershipModalVisible, setIsEditMembershipModalVisible] = useState(false);
  const [isCreateMembershipModalVisible, setIsCreateMembershipModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingMembership, setEditingMembership] = useState<any | null>(null); // Replace 'any' with Membership type
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [editMembershipForm] = Form.useForm();
  const [createMembershipForm] = Form.useForm();
  
  // Membership details modal state
  const [isMembershipDetailsModalVisible, setIsMembershipDetailsModalVisible] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  
  // Fetch sectors for consultant assignment
  const fetchSectors = async () => {
    try {
      const response = await sectorsService.getSectors({ limit: 100, sortBy: 'name', sortOrder: 'ASC', isActive: true });
      setSectors(response.data?.sectors || []);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setSectors([]);
    }
  };


  // Fetch users
  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        status: statusFilter === 'all' ? undefined : statusFilter,
        role: roleFilter === 'all' ? undefined : roleFilter,
      });
      
      if (response.success) {
        setUsers(response.data.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!isAdmin) return;
    
    try {
      setStatsLoading(true);
      const response = await userService.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    if (!isAdmin) return;
    
    try {
      setCompaniesLoading(true);
      const response = await userService.getCompanies({
        page: companyPagination.current,
        limit: companyPagination.pageSize,
        search: companySearchText,
      });
      
      if (response.success) {
        setCompanies(response.data.companies || []);
        setCompanyPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      message.error('Şirketler yüklenirken hata oluştu');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      setMembershipsLoading(true);
      const response = await membershipService.getAllMemberships();
      if (response.success) {
        setMemberships(response.data.memberships);
      } else {
        message.error(response.message || 'Üyelikler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
      message.error('Üyelikler yüklenirken hata oluştu');
    } finally {
      setMembershipsLoading(false);
    }
  };

  // Fetch membership statistics
  const fetchMembershipStats = async () => {
    try {
      const response = await membershipService.getMembershipStats();
      if (response.success) {
        setMembershipStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching membership stats:', error);
    }
  };

  // Fetch notifications for expiring memberships
  const fetchNotifications = async () => {
    try {
      const response = await membershipService.getAllMemberships();
      if (response.success) {
        const expiringMemberships = response.data.memberships.filter((membership: any) => {
          const endDate = new Date(membership.endDate);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 5 && daysUntilExpiry >= 0;
        });
        setNotifications(expiringMemberships);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
      fetchSectors();
    }
  }, [isAdmin, pagination.current, pagination.pageSize, searchText, statusFilter, roleFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'companies') {
      fetchCompanies();
    } else if (isAdmin && activeTab === 'membership') {
      fetchMemberships();
      fetchMembershipStats();
      fetchNotifications();
    }
  }, [isAdmin, activeTab, companyPagination.current, companyPagination.pageSize, companySearchText]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle company search
  const handleCompanySearch = (value: string) => {
    setCompanySearchText(value);
    setCompanyPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (type: string, value: string) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'role') {
      setRoleFilter(value);
    }
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle user actions
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      sectorId: user.sectorId || undefined,
    });
    setEditModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        message.success('Kullanıcı başarıyla silindi');
        fetchUsers();
        fetchStats();
      } else {
        message.error(response.message || 'Kullanıcı silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Kullanıcı silinirken hata oluştu');
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      const response = await userService.updateUserStatus(userId, 'active');
      if (response.success) {
        message.success('Kullanıcı başarıyla onaylandı');
        fetchUsers();
        fetchStats();
      } else {
        message.error(response.message || 'Kullanıcı onaylanırken hata oluştu');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      message.error('Kullanıcı onaylanırken hata oluştu');
    }
  };

  const handleRejectUser = async (userId: number) => {
    try {
      const response = await userService.updateUserStatus(userId, 'inactive');
      if (response.success) {
        message.success('Kullanıcı başarıyla reddedildi');
        fetchUsers();
        fetchStats();
      } else {
        message.error(response.message || 'Kullanıcı reddedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      message.error('Kullanıcı reddedilirken hata oluştu');
    }
  };

  // Handle view company details
  const handleViewCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setCompanyDetailModalVisible(true);
  };

  // Handle form submissions
  const handleEditSubmit = async (values: any) => {
    if (!selectedUser) return;

    try {
      const response = await userService.updateUser(selectedUser.id, values);
      if (response.success) {
        message.success('Kullanıcı başarıyla güncellendi');
        setEditModalVisible(false);
        fetchUsers();
        fetchStats();
      } else {
        message.error(response.message || 'Kullanıcı güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Kullanıcı güncellenirken hata oluştu');
    }
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      const response = await userService.createUser(values);
      if (response.success) {
        message.success('Kullanıcı başarıyla oluşturuldu');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchUsers();
        fetchStats();
      } else {
        message.error(response.message || 'Kullanıcı oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('Kullanıcı oluşturulurken hata oluştu');
    }
  };

  const handleEditMembership = (membership: any) => {
    setEditingMembership(membership);
    editMembershipForm.setFieldsValue(membership);
    setIsEditMembershipModalVisible(true);
  };

  const handleEditMembershipSubmit = async (values: any) => {
    try {
      const response = await membershipService.updateMembership(editingMembership.id, values);
      if (response.success) {
        message.success('Üyelik başarıyla güncellendi');
        setIsEditMembershipModalVisible(false);
        editMembershipForm.resetFields();
        fetchMemberships();
      } else {
        message.error(response.message || 'Üyelik güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating membership:', error);
      message.error('Üyelik güncellenirken hata oluştu');
    }
  };

  const handleViewMembershipDetails = (membership: any) => {
    Modal.info({
      title: 'Üyelik Detayları',
      width: 600,
      content: (
        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Şirket:</strong> {membership.User?.firstName} {membership.User?.lastName}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Email:</strong> {membership.User?.email}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Başlangıç Tarihi:</strong> {new Date(membership.startDate).toLocaleDateString('tr-TR')}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Bitiş Tarihi:</strong> {new Date(membership.endDate).toLocaleDateString('tr-TR')}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Aylık Ücret:</strong> {membership.monthlyFee?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Ödeme Durumu:</strong> {
              membership.paymentStatus === 'paid' ? 'Ödendi' :
              membership.paymentStatus === 'pending' ? 'Beklemede' : 'Gecikmiş'
            }
          </div>
        </div>
      ),
    });
  };

  const handleCreateMembershipSubmit = async (values: any) => {
    try {
      const response = await membershipService.createMembership(values);
      if (response.success) {
        message.success('Üyelik başarıyla oluşturuldu');
        setIsCreateMembershipModalVisible(false);
        createMembershipForm.resetFields();
        fetchMemberships();
      } else {
        message.error(response.message || 'Üyelik oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Error creating membership:', error);
      message.error('Üyelik oluşturulurken hata oluştu');
    }
  };

  const handleRenewMembership = (membership: any) => {
    const currentEndDate = new Date(membership.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1); // Add 1 year
    
    Modal.confirm({
      title: 'Üyelik Yenileme',
      icon: <ReloadOutlined style={{ color: '#059669' }} />,
      content: (
        <div style={{ marginTop: '16px' }}>
          <p><strong>Şirket:</strong> {membership.User?.firstName} {membership.User?.lastName}</p>
          <p><strong>Mevcut Bitiş Tarihi:</strong> {currentEndDate.toLocaleDateString('tr-TR')}</p>
          <p><strong>Yeni Bitiş Tarihi:</strong> {newEndDate.toLocaleDateString('tr-TR')}</p>
          <p><strong>Aylık Ücret:</strong> {membership.monthlyFee?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
          <p style={{ marginTop: '16px', color: '#059669', fontWeight: '600' }}>
            Bu üyeliği 1 yıl daha uzatmak istediğinizden emin misiniz?
          </p>
        </div>
      ),
      okText: 'Evet, Yenile',
      cancelText: 'İptal',
      okButtonProps: {
        style: {
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          border: 'none'
        }
      },
      onOk: async () => {
        try {
          const renewalData = {
            ...membership,
            endDate: newEndDate.toISOString(),
            paymentStatus: 'pending' // Reset payment status for new period
          };
          
          const response = await membershipService.updateMembership(membership.id, renewalData);
          if (response.success) {
            message.success('Üyelik başarıyla yenilendi');
            fetchMemberships();
          } else {
            message.error(response.message || 'Üyelik yenilenirken hata oluştu');
          }
        } catch (error) {
          console.error('Error renewing membership:', error);
          message.error('Üyelik yenilenirken hata oluştu');
        }
      }
    });
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      active: { color: '#52c41a', icon: <CheckCircleOutlined />, text: 'Aktif' },
      pending: { color: '#faad14', icon: <ExclamationCircleOutlined />, text: 'Beklemede' },
      inactive: { color: '#d9d9d9', icon: <CloseCircleOutlined />, text: 'Pasif' },
      suspended: { color: '#ff4d4f', icon: <CloseCircleOutlined />, text: 'Askıya Alınmış' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  };

  // Get role display
  const getRoleDisplay = (role: string) => {
    const roleConfig = {
      admin: { color: '#722ed1', icon: <CrownOutlined />, text: 'Admin' },
      member: { color: '#1890ff', icon: <UserOutlined />, text: 'Üye' },
      company: { color: '#13c2c2', icon: <BankOutlined />, text: 'Şirket' },
    };
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
  };

  // Table columns for users
  const columns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 250,
      render: (_, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={40} 
            style={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              color: '#ffffff',
              fontWeight: 'bold'
            }}
          >
            {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MailOutlined /> {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 180,
      render: (_, record: User) => (
        <div>
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <PhoneOutlined /> {record.phone}
            </div>
          )}
          {record.city && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              📍 {record.city}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const roleDisplay = getRoleDisplay(role);
        return (
          <Tag 
            icon={roleDisplay.icon} 
            color={roleDisplay.color}
            style={{ borderRadius: '6px', fontWeight: '500' }}
          >
            {roleDisplay.text}
          </Tag>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const statusDisplay = getStatusDisplay(status);
        return (
          <Badge 
            status={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'error'}
            text={
              <span style={{ color: statusDisplay.color, fontWeight: '500' }}>
                {statusDisplay.icon} {statusDisplay.text}
              </span>
            }
          />
        );
      },
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString('tr-TR')}
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_, record: User) => (
        <Space size="small">
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              style={{ color: '#dc2626' }}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="Onayla">
                <Popconfirm
                  title="Kullanıcıyı onaylamak istediğinizden emin misiniz?"
                  onConfirm={() => handleApproveUser(record.id)}
                  okText="Evet"
                  cancelText="Hayır"
                >
                  <Button
                    type="text"
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a' }}
                  />
                </Popconfirm>
              </Tooltip>
              
              <Tooltip title="Reddet">
                <Popconfirm
                  title="Kullanıcıyı reddetmek istediğinizden emin misiniz?"
                  onConfirm={() => handleRejectUser(record.id)}
                  okText="Evet"
                  cancelText="Hayır"
                >
                  <Button
                    type="text"
                    icon={<CloseCircleOutlined />}
                    style={{ color: '#ff4d4f' }}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
          
          <Tooltip title="Sil">
            <Popconfirm
              title="Kullanıcıyı silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: '#ff4d4f' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Company columns
  const companyColumns = [
    {
      title: 'Şirket Adı',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>
          <BankOutlined style={{ marginRight: '8px', color: '#dc2626' }} />
          {name}
        </div>
      ),
    },
    {
      title: 'Vergi No',
      dataIndex: 'taxNumber',
      key: 'taxNumber',
      width: 150,
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
    },
    {
      title: 'Kullanıcı Sayısı',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      align: 'center' as const,
      render: (count: number) => (
        <Tag color="blue" style={{ borderRadius: '6px' }}>{count}</Tag>
      ),
    },
    {
      title: 'Toplam Başvuru',
      dataIndex: 'totalApplications',
      key: 'totalApplications',
      width: 120,
      align: 'center' as const,
      render: (count: number) => (
        <Tag color="purple" style={{ borderRadius: '6px' }}>{count}</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_, record: Company) => (
        <Tooltip title="Şirket Detaylarını Görüntüle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewCompanyDetails(record)}
            style={{ color: '#dc2626' }}
          />
        </Tooltip>
      ),
    },
  ];

  const membershipColumns = [
    {
      title: 'Şirket Adı',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text: string, record: any) => (
        <div style={{ fontWeight: '600', color: '#1f2937' }}>
          {record.User?.firstName} {record.User?.lastName}
        </div>
      ),
    },
    {
      title: 'Üyelik Başlangıç Tarihi',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => (
        <span style={{ color: '#6b7280' }}>
          {new Date(date).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Üyelik Bitiş Tarihi',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => {
        const endDate = new Date(date);
        const today = new Date();
        const isExpired = endDate < today;
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysRemaining <= 5 && daysRemaining >= 0;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ 
              color: isExpired ? '#dc2626' : isExpiringSoon ? '#f59e0b' : '#6b7280',
              fontWeight: isExpired || isExpiringSoon ? '600' : 'normal'
            }}>
              {endDate.toLocaleDateString('tr-TR')}
            </span>
            {isExpiringSoon && !isExpired && (
              <Tag color="orange" size="small" style={{ fontSize: '10px', margin: 0 }}>
                🔔 {daysRemaining} gün kaldı!
              </Tag>
            )}
            {isExpired && (
              <Tag color="red" size="small" style={{ fontSize: '10px', margin: 0 }}>
                ❌ Süresi Dolmuş
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ödeme Türü',
      key: 'paymentType',
      render: (_, record: any) => {
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        
        return (
          <Tag color={monthsDiff >= 12 ? 'green' : 'blue'} style={{ fontWeight: '600' }}>
            {monthsDiff >= 12 ? '📅 Yıllık' : '📆 Aylık'}
          </Tag>
        );
      },
    },
    {
      title: 'Aylık Ücret',
      dataIndex: 'monthlyFee',
      key: 'monthlyFee',
      render: (fee: number) => (
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {fee?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      title: 'Ödeme Durumu',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => {
        const statusConfig = {
          paid: { color: '#059669', text: 'Ödendi', icon: '✓' },
          pending: { color: '#f59e0b', text: 'Beklemede', icon: '⏳' },
          overdue: { color: '#dc2626', text: 'Gecikmiş', icon: '⚠️' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
          <Tag color={config.color} style={{ fontWeight: '600' }}>
            {config.icon} {config.text}
          </Tag>
        );
      },
    },
        const statusConfig = {
          paid: { color: '#059669', text: 'Ödendi', icon: '✓' },
          pending: { color: '#f59e0b', text: 'Beklemede', icon: '⏳' },
          overdue: { color: '#dc2626', text: 'Gecikmiş', icon: '⚠️' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
          <Tag color={config.color} style={{ fontWeight: '600' }}>
            {config.icon} {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Yenileme Durumu',
      key: 'renewalStatus',
      render: (_, record) => {
        const endDate = new Date(record.endDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status, color, icon;
        if (daysUntilExpiry < 0) {
          status = 'Süresi Dolmuş';
          color = '#dc2626';
          icon = '🔴';
        } else if (daysUntilExpiry <= 7) {
          status = 'Acil Yenileme';
          color = '#dc2626';
          icon = '🚨';
        } else if (daysUntilExpiry <= 30) {
          status = 'Yenileme Gerekli';
          color = '#f59e0b';
          icon = '⚠️';
        } else {
          status = 'Aktif';
          color = '#059669';
          icon = '✅';
        }
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Tag color={color} style={{ fontWeight: '600', margin: 0 }}>
              {icon} {status}
            </Tag>
            {daysUntilExpiry >= 0 && (
              <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                {daysUntilExpiry} gün kaldı
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => {
        const endDate = new Date(record.endDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const needsRenewal = daysUntilExpiry <= 30;
        
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {needsRenewal && (
              <Button 
                type="primary" 
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => handleRenewMembership(record)}
                style={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                Yenile
              </Button>
            )}
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditMembership(record)}
              style={{ 
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                border: 'none',
                borderRadius: '6px'
              }}
            >
              Düzenle
            </Button>
            <Button 
              type="default" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewMembershipDetails(record)}
              style={{ borderRadius: '6px' }}
            >
              Detay
            </Button>
          </div>
        );
      },
    },
  ];

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div style={modernStyles.pageContainer}>
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 24px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          border: '1px solid #fee2e2'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚫</div>
          <Title level={2} style={{ color: '#dc2626', marginBottom: '16px' }}>
            Erişim Reddedildi
          </Title>
          <Text style={{ fontSize: '16px', color: '#6b7280' }}>
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={modernStyles.pageContainer}>
      {/* Modern Header */}
      <Card style={modernStyles.headerCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <Title level={2} style={modernStyles.headerTitle}>
              👥 Kullanıcı Yönetimi
            </Title>
            <Text style={modernStyles.headerSubtitle}>
              Sistem kullanıcılarını ve şirketleri yönetin
            </Text>
          </div>
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => {
              if (activeTab === 'users') {
                fetchUsers();
                fetchStats();
              } else if (activeTab === 'companies') {
                fetchCompanies();
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            Yenile
          </Button>
        </div>
      </Card>

      {/* Stats Cards - Only show for users tab */}
      {activeTab === 'users' && (
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              style={modernStyles.statsCard}
              hoverable
              className="stats-card-hover"
            >
              <Statistic
                title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Toplam Kullanıcı</span>}
                value={stats?.totalUsers || 0}
                prefix={<TeamOutlined style={{ color: '#dc2626' }} />}
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              style={modernStyles.statsCard}
              hoverable
              className="stats-card-hover"
            >
              <Statistic
                title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Aktif Kullanıcı</span>}
                value={stats?.activeUsers || 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              style={modernStyles.statsCard}
              hoverable
              className="stats-card-hover"
            >
              <Statistic
                title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Bekleyen Kullanıcı</span>}
                value={stats?.pendingUsers || 0}
                prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontWeight: 'bold', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              style={modernStyles.statsCard}
              hoverable
              className="stats-card-hover"
            >
              <Statistic
                title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Pasif Kullanıcı</span>}
                value={stats?.inactiveUsers || 0}
                prefix={<CloseCircleOutlined style={{ color: '#6b7280' }} />}
                valueStyle={{ color: '#6b7280', fontWeight: 'bold', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Modern Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ marginBottom: '24px' }}
        size="large"
        items={[
          {
            key: 'users',
            label: (
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                <UserOutlined />
                Kullanıcılar
              </span>
            ),
            children: (
              <>
                {/* User Filters */}
                <Card style={modernStyles.filterCard}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={24} md={8} lg={8}>
                      <Input
                        placeholder="Kullanıcı ara..."
                        prefix={<SearchOutlined style={{ color: '#dc2626' }} />}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Col>
                    <Col xs={12} sm={8} md={4} lg={4}>
                      <Select
                        placeholder="Durum"
                        value={statusFilter}
                        onChange={(value) => handleFilterChange('status', value)}
                        style={{ width: '100%' }}
                        size="large"
                      >
                        <Option value="all">Tüm Durumlar</Option>
                        <Option value="active">Aktif</Option>
                        <Option value="pending">Beklemede</Option>
                        <Option value="suspended">Askıya Alınmış</Option>
                        <Option value="inactive">Pasif</Option>
                      </Select>
                    </Col>
                    <Col xs={12} sm={8} md={4} lg={4}>
                      <Select
                        placeholder="Rol"
                        value={roleFilter}
                        onChange={(value) => handleFilterChange('role', value)}
                        style={{ width: '100%' }}
                        size="large"
                      >
                        <Option value="all">Tüm Roller</Option>
                        <Option value="admin">Admin</Option>
                        <Option value="member">Üye</Option>
                        <Option value="company">Şirket</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={8} md={8} lg={8}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setCreateModalVisible(true)}
                          size="large"
                          style={modernStyles.primaryButton}
                        >
                          Yeni Kullanıcı
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Users Table */}
                <Card style={modernStyles.tableCard}>
                  <Table
                    columns={columns}
                    dataSource={users}
                    loading={statsLoading || loading}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => (
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>
                          {range[0]}-{range[1]} / {total} kullanıcı
                        </span>
                      ),
                      onChange: (page, pageSize) => {
                        setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
                      },
                    }}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    size="middle"
                  />
                </Card>
              </>
            ),
          },
          ...(isAdmin ? [
            {
              key: 'companies',
              label: (
                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                  <BankOutlined />
                  Şirketler
                </span>
              ),
              children: (
                <>
                  {/* Company Filters */}
                  <Card style={modernStyles.filterCard}>
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={16} md={16} lg={16}>
                        <Input
                          placeholder="Şirket ara..."
                          prefix={<SearchOutlined style={{ color: '#dc2626' }} />}
                          value={companySearchText}
                          onChange={(e) => handleCompanySearch(e.target.value)}
                          allowClear
                          size="large"
                          style={{ borderRadius: '8px' }}
                        />
                      </Col>
                    </Row>
                  </Card>

                  {/* Companies Table */}
                  <Card style={modernStyles.tableCard}>
                    <Table
                      columns={companyColumns}
                      dataSource={companies}
                      loading={companiesLoading}
                      pagination={{
                        current: companyPagination.current,
                        pageSize: companyPagination.pageSize,
                        total: companyPagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => (
                          <span style={{ color: '#6b7280', fontWeight: '500' }}>
                            {range[0]}-{range[1]} / {total} şirket
                          </span>
                        ),
                        onChange: (page, pageSize) => {
                          setCompanyPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
                        },
                      }}
                      rowKey="id"
                      scroll={{ x: 800 }}
                      size="middle"
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: 'membership',
              label: (
                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                  <CrownOutlined />
                  Üyelik Yönetimi
                </span>
              ),
              children: (
                <div>
                  {/* Membership Renewal Dashboard */}
                  <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card 
                      style={modernStyles.statsCard}
                      hoverable
                      className="stats-card-hover"
                    >
                      <Statistic
                        title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Toplam Üyelik</span>}
                        value={memberships?.length || 0}
                        prefix={<CrownOutlined style={{ color: '#dc2626' }} />}
                        valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card 
                      style={modernStyles.statsCard}
                      hoverable
                      className="stats-card-hover"
                    >
                      <Statistic
                        title={<span style={{ color: '#6b7280', fontWeight: '600' }}>5 Gün İçinde Dolacak</span>}
                        value={memberships?.filter(m => {
                          const daysUntilExpiry = Math.ceil((new Date(m.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntilExpiry <= 5 && daysUntilExpiry >= 0;
                        }).length || 0}
                        prefix={<ExclamationCircleOutlined style={{ color: '#dc2626' }} />}
                        valueStyle={{ color: '#dc2626', fontWeight: 'bold', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card 
                      style={modernStyles.statsCard}
                      hoverable
                      className="stats-card-hover"
                    >
                      <Statistic
                        title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Aylık Ödemeler</span>}
                        value={memberships?.filter(m => {
                          const startDate = new Date(m.startDate);
                          const endDate = new Date(m.endDate);
                          const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
                          return monthsDiff < 12;
                        }).length || 0}
                        prefix={<CalendarOutlined style={{ color: '#3b82f6' }} />}
                        valueStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card 
                      style={modernStyles.statsCard}
                      hoverable
                      className="stats-card-hover"
                    >
                      <Statistic
                        title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Yıllık Ödemeler</span>}
                        value={memberships?.filter(m => {
                          const startDate = new Date(m.startDate);
                          const endDate = new Date(m.endDate);
                          const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
                          return monthsDiff >= 12;
                        }).length || 0}
                        prefix={<CalendarOutlined style={{ color: '#10b981' }} />}
                        valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Notifications Panel */}
                {notifications.length > 0 && (
                  <Card 
                    style={{ 
                      ...modernStyles.filterCard, 
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      border: '1px solid #f59e0b',
                      marginBottom: '24px'
                    }}
                  >
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Space>
                          <BellOutlined style={{ color: '#f59e0b', fontSize: '20px' }} />
                          <Text strong style={{ color: '#92400e', fontSize: '16px' }}>
                            Dikkat! {notifications.length} üyelik 5 gün içinde sona erecek
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Button 
                          type="link" 
                          onClick={() => setShowNotifications(!showNotifications)}
                          style={{ color: '#92400e', fontWeight: '600' }}
                        >
                          {showNotifications ? 'Gizle' : 'Detayları Göster'}
                        </Button>
                      </Col>
                    </Row>
                    {showNotifications && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f59e0b' }}>
                        {notifications.map((membership: any) => {
                          const daysRemaining = Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <div key={membership.id} style={{ 
                              background: 'rgba(255, 255, 255, 0.7)', 
                              padding: '12px', 
                              borderRadius: '8px', 
                              marginBottom: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <Text strong>{membership.User?.firstName} {membership.User?.lastName}</Text>
                                <br />
                                <Text type="secondary">
                                  Bitiş Tarihi: {new Date(membership.endDate).toLocaleDateString('tr-TR')} 
                                  ({daysRemaining} gün kaldı)
                                </Text>
                              </div>
                              <Button 
                                type="primary" 
                                size="small"
                                onClick={() => handleRenewMembership(membership)}
                                style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                              >
                                Hemen Yenile
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}
                        title={<span style={{ color: '#6b7280', fontWeight: '600' }}>Süresi Dolmuş</span>}
                        value={memberships?.filter(m => {
                          const daysUntilExpiry = Math.ceil((new Date(m.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntilExpiry < 0;
                        }).length || 0}
                        prefix={<StopOutlined style={{ color: '#6b7280' }} />}
                        valueStyle={{ color: '#6b7280', fontWeight: 'bold', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Membership Actions */}
                <Card style={modernStyles.filterCard}>
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          size="large"
                          onClick={() => setIsCreateMembershipModalVisible(true)}
                          style={modernStyles.primaryButton}
                        >
                          Yeni Üyelik
                        </Button>
                        <Button
                          icon={<ReloadOutlined />}
                          size="large"
                          onClick={fetchMemberships}
                          style={modernStyles.secondaryButton}
                        >
                          Yenile
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                <Card style={modernStyles.tableCard}>
                  <Table
                    columns={membershipColumns}
                    dataSource={memberships}
                    loading={membershipsLoading}
                    rowKey="id"
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => (
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>
                          {range[0]}-{range[1]} / {total} üyelik
                        </span>
                      ),
                    }}
                    scroll={{ x: 1000 }}
                  />
                </Card>
                </>
              ),
            }
          ] : [])
        ]}
      />

      {/* Edit User Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '18px' }}>
            <EditOutlined /> Kullanıcı Düzenle
          </span>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ad"
                name="firstName"
                rules={[{ required: true, message: 'Ad gereklidir' }]}
              >
                <Input size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Soyad"
                name="lastName"
                rules={[{ required: true, message: 'Soyad gereklidir' }]}
              >
                <Input size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'E-posta gereklidir' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
            ]}
          >
            <Input size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          
          <Form.Item label="Telefon" name="phone">
            <Input size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rol"
                name="role"
                rules={[{ required: true, message: 'Rol gereklidir' }]}
              >
                <Select size="large" style={{ borderRadius: '8px' }}>
                  <Option value="admin">Admin</Option>
                  <Option value="member">Üye</Option>
                  <Option value="company">Şirket</Option>
                  <Option value="consultant">Danışman</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Durum"
                name="status"
                rules={[{ required: true, message: 'Durum gereklidir' }]}
              >
                <Select size="large">
                  <Option value="active">Aktif</Option>
                  <Option value="pending">Beklemede</Option>
                  <Option value="inactive">Pasif</Option>
                  <Option value="suspended">Askıya Alınmış</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Consultant sector assignment */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
            {({ getFieldValue }) =>
              getFieldValue('role') === 'consultant' ? (
                <Form.Item label="Sektör" name="sectorId" rules={[{ required: false }]}> 
                  <Select
                    size="large"
                    placeholder="Sektör seçin"
                    loading={false}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    style={{ borderRadius: '8px' }}
                  >
                    {sectors.map((s) => (
                      <Option key={s.id} value={s.id}>{s.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
          
          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setEditModalVisible(false)}
                size="large"
                style={modernStyles.secondaryButton}
              >
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={modernStyles.primaryButton}
              >
                Güncelle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '18px' }}>
            <PlusOutlined /> Yeni Kullanıcı Oluştur
          </span>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ad"
                name="firstName"
                rules={[{ required: true, message: 'Ad gereklidir' }]}
              >
                <Input size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Soyad"
                name="lastName"
                rules={[{ required: true, message: 'Soyad gereklidir' }]}
              >
                <Input size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'E-posta gereklidir' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
            ]}
          >
            <Input size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          
          <Form.Item
            label="Şifre"
            name="password"
            rules={[
              { required: true, message: 'Şifre gereklidir' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
            ]}
          >
            <Input.Password size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          
          <Form.Item label="Telefon" name="phone">
            <Input size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rol"
                name="role"
                rules={[{ required: true, message: 'Rol gereklidir' }]}
              >
                <Select size="large">
                  <Option value="admin">Admin</Option>
                  <Option value="member">Üye</Option>
                  <Option value="company">Şirket</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Durum"
                name="status"
                rules={[{ required: true, message: 'Durum gereklidir' }]}
              >
                <Select size="large">
                  <Option value="active">Aktif</Option>
                  <Option value="pending">Beklemede</Option>
                  <Option value="inactive">Pasif</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setCreateModalVisible(false)}
                size="large"
                style={modernStyles.secondaryButton}
              >
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={modernStyles.primaryButton}
              >
                Oluştur
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Company Detail Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '18px' }}>
            <BankOutlined /> Şirket Detayları
          </span>
        }
        open={companyDetailModalVisible}
        onCancel={() => setCompanyDetailModalVisible(false)}
        footer={
          <Button 
            onClick={() => setCompanyDetailModalVisible(false)}
            size="large"
            style={modernStyles.primaryButton}
          >
            Kapat
          </Button>
        }
        width={700}
        style={{ borderRadius: '12px' }}
      >
        {selectedCompany && (
          <div style={{ marginTop: '24px' }}>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card style={{ background: '#fef2f2', border: '1px solid #fee2e2' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      size={64} 
                      style={{ 
                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        marginBottom: '16px'
                      }}
                    >
                      <BankOutlined style={{ fontSize: '32px' }} />
                    </Avatar>
                    <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                      {selectedCompany.name}
                    </Title>
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Vergi Numarası"
                    value={selectedCompany.taxNumber}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Şehir"
                    value={selectedCompany.city}
                    prefix="📍"
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Kullanıcı Sayısı"
                    value={selectedCompany.userCount}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Toplam Başvuru"
                    value={selectedCompany.totalApplications}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit Membership Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '18px' }}>
            <EditOutlined /> Üyelik Bilgilerini Düzenle
          </span>
        }
        open={isEditMembershipModalVisible}
        onCancel={() => setIsEditMembershipModalVisible(false)}
        footer={null}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        <Form 
          form={editMembershipForm} 
          layout="vertical" 
          onFinish={handleEditMembershipSubmit}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="companyName" 
                label="Şirket Adı"
              >
                <Input 
                  disabled 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="startDate" 
                label="Üyelik Başlangıç Tarihi"
                rules={[{ required: true, message: 'Başlangıç tarihi gereklidir' }]}
              >
                <DatePicker 
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="endDate" 
                label="Üyelik Bitiş Tarihi"
                rules={[{ required: true, message: 'Bitiş tarihi gereklidir' }]}
              >
                <DatePicker 
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="monthlyFee" 
                label="Aylık Ücret (TL)"
                rules={[
                  { required: true, message: 'Aylık ücret gereklidir' },
                  { type: 'number', min: 0, message: 'Ücret 0\'dan büyük olmalıdır' }
                ]}
              >
                <InputNumber 
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                  min={0}
                  step={100}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="paymentStatus" 
                label="Ödeme Durumu"
                rules={[{ required: true, message: 'Ödeme durumu gereklidir' }]}
              >
                <Select 
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="paid">
                    <span style={{ color: '#059669' }}>✓ Ödendi</span>
                  </Option>
                  <Option value="pending">
                    <span style={{ color: '#f59e0b' }}>⏳ Beklemede</span>
                  </Option>
                  <Option value="overdue">
                    <span style={{ color: '#dc2626' }}>⚠️ Gecikmiş</span>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setIsEditMembershipModalVisible(false)}
                size="large"
                style={modernStyles.secondaryButton}
              >
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={modernStyles.primaryButton}
              >
                Güncelle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Membership Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '18px' }}>
            <PlusOutlined /> Yeni Üyelik Oluştur
          </span>
        }
        open={isCreateMembershipModalVisible}
        onCancel={() => setIsCreateMembershipModalVisible(false)}
        footer={null}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        <Form 
          form={createMembershipForm} 
          layout="vertical" 
          onFinish={handleCreateMembershipSubmit}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="companyId" 
                label="Şirket Seçin"
                rules={[{ required: true, message: 'Şirket seçimi gereklidir' }]}
              >
                <Select 
                  size="large"
                  style={{ borderRadius: '8px' }}
                  placeholder="Şirket seçin..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users.filter(user => user.role === 'company').map(company => (
                    <Option key={company.id} value={company.id}>
                      {company.firstName} {company.lastName} - {company.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="startDate" 
                label="Üyelik Başlangıç Tarihi"
                rules={[{ required: true, message: 'Başlangıç tarihi gereklidir' }]}
              >
                <DatePicker 
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="endDate" 
                label="Üyelik Bitiş Tarihi"
                rules={[{ required: true, message: 'Bitiş tarihi gereklidir' }]}
              >
                <DatePicker 
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="monthlyFee" 
                label="Aylık Ücret (TL)"
                rules={[
                  { required: true, message: 'Aylık ücret gereklidir' },
                  { type: 'number', min: 0, message: 'Ücret 0\'dan büyük olmalıdır' }
                ]}
              >
                <InputNumber 
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                  min={0}
                  step={100}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="paymentStatus" 
                label="Ödeme Durumu"
                rules={[{ required: true, message: 'Ödeme durumu gereklidir' }]}
                initialValue="pending"
              >
                <Select 
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="paid">
                    <span style={{ color: '#059669' }}>✓ Ödendi</span>
                  </Option>
                  <Option value="pending">
                    <span style={{ color: '#f59e0b' }}>⏳ Beklemede</span>
                  </Option>
                  <Option value="overdue">
                    <span style={{ color: '#dc2626' }}>⚠️ Gecikmiş</span>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setIsCreateMembershipModalVisible(false)}
                size="large"
                style={modernStyles.secondaryButton}
              >
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={modernStyles.primaryButton}
              >
                Oluştur
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Membership Details Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '18px' }}>
            <EyeOutlined /> Üyelik Detayları
          </span>
        }
        open={isMembershipDetailsModalVisible}
        onCancel={() => setIsMembershipDetailsModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsMembershipDetailsModalVisible(false)}
            size="large"
            style={modernStyles.secondaryButton}
          >
            Kapat
          </Button>
        ]}
        width={600}
        style={{ borderRadius: '12px' }}
      >
        {selectedMembership && (
          <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Şirket Bilgileri</h4>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    {selectedMembership.companyName}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                    {selectedMembership.companyEmail}
                  </p>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>Başlangıç Tarihi</h4>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    {selectedMembership.startDate ? new Date(selectedMembership.startDate).toLocaleDateString('tr-TR') : '-'}
                  </p>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #fcd34d'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Bitiş Tarihi</h4>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    {selectedMembership.endDate ? new Date(selectedMembership.endDate).toLocaleDateString('tr-TR') : '-'}
                  </p>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  background: '#f0fdf4', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>Aylık Ücret</h4>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#059669' }}>
                    ₺{selectedMembership.monthlyFee?.toLocaleString('tr-TR') || '0'}
                  </p>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  background: selectedMembership.paymentStatus === 'paid' ? '#f0fdf4' : 
                             selectedMembership.paymentStatus === 'pending' ? '#fffbeb' : '#fef2f2', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: selectedMembership.paymentStatus === 'paid' ? '1px solid #bbf7d0' : 
                          selectedMembership.paymentStatus === 'pending' ? '1px solid #fed7aa' : '1px solid #fecaca'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: selectedMembership.paymentStatus === 'paid' ? '#166534' : 
                           selectedMembership.paymentStatus === 'pending' ? '#92400e' : '#991b1b'
                  }}>
                    Ödeme Durumu
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: selectedMembership.paymentStatus === 'paid' ? '#059669' : 
                           selectedMembership.paymentStatus === 'pending' ? '#f59e0b' : '#dc2626'
                  }}>
                    {selectedMembership.paymentStatus === 'paid' ? '✓ Ödendi' : 
                     selectedMembership.paymentStatus === 'pending' ? '⏳ Beklemede' : '⚠️ Gecikmiş'}
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;