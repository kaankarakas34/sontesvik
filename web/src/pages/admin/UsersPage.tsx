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
  CrownOutlined,
} from '@ant-design/icons';
import { userService, User, UserStats, Company } from '../../services/userService';
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
  tabsStyle: {
    '.ant-tabs-tab': {
      borderRadius: '8px',
      fontWeight: '600',
    },
    '.ant-tabs-tab-active': {
      background: '#fef2f2',
      borderColor: '#dc2626',
    },
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
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
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

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [companyDetailModalVisible, setCompanyDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

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

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin, pagination.current, pagination.pageSize, searchText, statusFilter, roleFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'companies') {
      fetchCompanies();
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
                    style={{ 
                      '.ant-table-thead > tr > th': {
                        background: '#fef2f2',
                        borderBottom: '2px solid #fee2e2',
                        color: '#1f2937',
                        fontWeight: '600',
                      }
                    }}
                  />
                </Card>
              </>
            ),
          },
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
              </>
            ),
          },
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

      <style jsx>{`
        .stats-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
        }
        
        .ant-table-thead > tr > th {
          background: #fef2f2 !important;
          border-bottom: 2px solid #fee2e2 !important;
          color: #1f2937 !important;
          font-weight: 600 !important;
        }
        
        .ant-tabs-tab {
          border-radius: 8px !important;
          font-weight: 600 !important;
        }
        
        .ant-tabs-tab-active {
          background: #fef2f2 !important;
          border-color: #dc2626 !important;
        }
      `}</style>
    </div>
  );
};

export default UsersPage;