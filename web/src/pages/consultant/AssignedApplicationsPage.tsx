import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Pagination,
  Avatar,
  Divider,
  Alert,
  Spin,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined,
  FileTextOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import consultantService from '../../services/consultantService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  sector?: string;
  phone?: string;
}

interface Incentive {
  id: string;
  title: string;
  sector?: string;
}

const { Title } = Typography;
const { Option } = Select;

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
  };
  incentive: {
    id: string;
    title: string;
    sector?: string;
  };
}

interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AssignedApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const pageSize = 10;

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getAssignedApplications({
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      
      setApplications(response.applications);
      setTotalApplications(response.total);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Başvurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'draft': 'default',
      'pending': 'processing',
      'submitted': 'warning',
      'under_review': 'processing',
      'additional_info_required': 'warning',
      'approved': 'success',
      'rejected': 'error',
      'cancelled': 'default',
      'completed': 'success'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'draft': 'Taslak',
      'pending': 'Beklemede',
      'submitted': 'Gönderildi',
      'under_review': 'İnceleniyor',
      'additional_info_required': 'Ek Bilgi Gerekli',
      'approved': 'Onaylandı',
      'rejected': 'Reddedildi',
      'cancelled': 'İptal Edildi',
      'completed': 'Tamamlandı'
    };
    return statusTexts[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      title: 'Başvuru No',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text: string) => (
        <span className="font-mono text-sm">{text}</span>
      ),
    },
    {
      title: 'Başvuru Sahibi',
      key: 'user',
      render: (record: Application) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            className="bg-blue-500"
          />
          <div>
            <div className="font-medium">
              {record.user.firstName} {record.user.lastName}
            </div>
            {record.user.companyName && (
              <div className="text-sm text-gray-500">
                {record.user.companyName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Teşvik',
      key: 'incentive',
      render: (record: Application) => (
        <div>
          <div className="font-medium text-sm">
            {record.incentive?.title || 'Teşvik Bilgisi Bulunamadı'}
          </div>
          {record.incentive?.sector && (
            <div className="text-xs text-gray-500">
              {record.incentive.sector}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Atanma Tarihi',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Application) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/applications/${record.id}`)}
          >
            Görüntüle
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="!mb-2">
            <FileTextOutlined className="mr-3" />
            Atanan Başvurular
          </Title>
          <p className="text-gray-600">
            Size atanan başvuruları görüntüleyebilir ve yönetebilirsiniz.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Başvuru no, şirket adı veya başvuru sahibi ara..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Durum filtrele"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="pending">Beklemede</Option>
                <Option value="submitted">Gönderildi</Option>
                <Option value="under_review">İnceleniyor</Option>
                <Option value="additional_info_required">Ek Bilgi Gerekli</Option>
                <Option value="approved">Onaylandı</Option>
                <Option value="rejected">Reddedildi</Option>
                <Option value="completed">Tamamlandı</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={10}>
              <div className="text-sm text-gray-600">
                Toplam {totalApplications} başvuru bulundu
              </div>
            </Col>
          </Row>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Hata"
            description={error}
            type="error"
            showIcon
            closable
            className="mb-6"
            onClose={() => setError(null)}
          />
        )}

        {/* Applications Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Henüz size atanmış başvuru bulunmuyor"
                />
              ),
            }}
          />

          {/* Pagination */}
          {totalApplications > 0 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={currentPage}
                total={totalApplications}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} / ${total} başvuru`
                }
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AssignedApplicationsPage;