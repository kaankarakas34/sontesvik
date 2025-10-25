import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  Statistic,
  DatePicker,
  Modal,
  Descriptions,
  Badge,
  Tooltip,
  Divider,
  Avatar
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { applicationsService } from '../../services/applicationsService';
import type { RootState } from '../../store';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Application {
  id: string;
  incentive: {
    id: string;
    title: string;
    description?: string;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'under_review';
  submissionDate?: string;
  createdAt: string;
  requestedAmount?: number;
  completionPercentage?: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: {
      name: string;
      sector: string;
    };
  };
  priority?: 'low' | 'medium' | 'high';
  reviewNotes?: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  underReview: number;
}

const AdminApplicationsPage: React.FC = () => {
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    underReview: 0
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Debug auth state
  useEffect(() => {
    console.log('Auth state in ApplicationsPage:', { isAuthenticated, user: user?.id, token: !!token });
    console.log('localStorage token:', localStorage.getItem('token'));
  }, [isAuthenticated, user, token]);

  // Fetch applications
  const fetchApplications = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
        filters: {
          ...(searchText && { search: searchText }),
          ...(statusFilter && { status: statusFilter }),
          ...(priorityFilter && { priority: priorityFilter }),
          ...(dateRange.length === 2 && {
            dateFrom: dateRange[0].format('YYYY-MM-DD'),
            dateTo: dateRange[1].format('YYYY-MM-DD')
          })
        }
      };

      const response = await applicationsService.getApplications(params);
      setApplications(response.data || []);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.pagination?.totalItems || 0
      }));

      // Calculate stats
      const allApplications = response.data || [];
      const newStats = {
        total: allApplications.length,
        pending: allApplications.filter((app: Application) => app.status === 'pending').length,
        approved: allApplications.filter((app: Application) => app.status === 'approved').length,
        rejected: allApplications.filter((app: Application) => app.status === 'rejected').length,
        draft: allApplications.filter((app: Application) => app.status === 'draft').length,
        underReview: allApplications.filter((app: Application) => app.status === 'under_review').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchText, statusFilter, priorityFilter, dateRange]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      under_review: 'warning'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Status text mapping
  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Taslak',
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      under_review: 'İnceleniyor'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  // Table columns
  const columns: ColumnsType<Application> = [
    {
      title: 'Başvuru ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <span className="font-mono text-sm">#{id.slice(-8)}</span>
      ),
    },
    {
      title: 'Başvuran',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div className="font-medium">
              {record.user.firstName} {record.user.lastName}
            </div>
            <div className="text-xs text-gray-500">{record.user.email}</div>
            {record.user.company && (
              <div className="text-xs text-gray-400">{record.user.company.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Teşvik',
      dataIndex: ['incentive', 'title'],
      key: 'incentive',
      width: 250,
      render: (title: string) => (
        <Tooltip title={title}>
          <span className="truncate block">{title}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        priority ? (
          <Tag color={getPriorityColor(priority)}>
            {priority === 'low' ? 'Düşük' : priority === 'medium' ? 'Orta' : 'Yüksek'}
          </Tag>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      title: 'Talep Edilen Tutar',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      width: 150,
      render: (amount: number) => (
        amount ? (
          <span className="font-medium">
            {new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY'
            }).format(amount)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      title: 'Tamamlanma',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      width: 120,
      render: (percentage: number) => (
        percentage !== undefined ? (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      title: 'Başvuru Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <span className="text-sm">
          {new Date(date).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedApplication(record);
            setDetailModalVisible(true);
          }}
        >
          Detay
        </Button>
      ),
    },
  ];

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <FileTextOutlined style={{ marginRight: '12px' }} />
                Başvuru Yönetimi
              </Title>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '8px 0 0 0' }}>
                Tüm teşvik başvurularını yönetin ve takip edin
              </p>
            </div>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchApplications()}
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white'
              }}
            >
              Yenile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stats-card-hover" style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Toplam Başvuru</span>}
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stats-card-hover" style={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)'
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Beklemede</span>}
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stats-card-hover" style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Onaylanan</span>}
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stats-card-hover" style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Reddedilen</span>}
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stats-card-hover" style={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.2)'
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>İnceleniyor</span>}
              value={stats.underReview}
              prefix={<ExclamationCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="stats-card-hover" style={{ 
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(107, 114, 128, 0.2)'
          }}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Taslak</span>}
              value={stats.draft}
              prefix={<FileTextOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ 
        marginBottom: '24px',
        borderRadius: '12px',
        border: '1px solid #fee2e2',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
      }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Başvuru ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum filtrele"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="draft">Taslak</Option>
              <Option value="pending">Beklemede</Option>
              <Option value="under_review">İnceleniyor</Option>
              <Option value="approved">Onaylandı</Option>
              <Option value="rejected">Reddedildi</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Öncelik filtrele"
              value={priorityFilter}
              onChange={setPriorityFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="low">Düşük</Option>
              <Option value="medium">Orta</Option>
              <Option value="high">Yüksek</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Applications Table */}
      <Card style={{ 
        borderRadius: '12px',
        border: '1px solid #fee2e2',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
      }}>
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} başvuru`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
              fetchApplications(page, pageSize);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: '8px', color: '#dc2626' }} />
            Başvuru Detayları
          </div>
        }
        open={!!detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Başvuru ID" span={2}>
                <span className="font-mono">#{selectedApplication.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Başvuran">
                {selectedApplication.user.firstName} {selectedApplication.user.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="E-posta">
                {selectedApplication.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Şirket" span={2}>
                {selectedApplication.user.company?.name || 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="Teşvik" span={2}>
                {selectedApplication.incentive.title}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={getStatusColor(selectedApplication.status)}>
                  {getStatusText(selectedApplication.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Öncelik">
                {selectedApplication.priority ? (
                  <Tag color={getPriorityColor(selectedApplication.priority)}>
                    {selectedApplication.priority === 'low' ? 'Düşük' : 
                     selectedApplication.priority === 'medium' ? 'Orta' : 'Yüksek'}
                  </Tag>
                ) : (
                  'Belirtilmemiş'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Talep Edilen Tutar">
                {selectedApplication.requestedAmount ? 
                  new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(selectedApplication.requestedAmount) : 
                  'Belirtilmemiş'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Tamamlanma">
                {selectedApplication.completionPercentage !== undefined ? 
                  `${selectedApplication.completionPercentage}%` : 
                  'Belirtilmemiş'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Başvuru Tarihi" span={2}>
                {new Date(selectedApplication.createdAt).toLocaleString('tr-TR')}
              </Descriptions.Item>
              {selectedApplication.reviewNotes && (
                <Descriptions.Item label="İnceleme Notları" span={2}>
                  {selectedApplication.reviewNotes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .stats-card-hover:hover {
          transform: translateY(-4px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminApplicationsPage;