import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Card,
  Tabs,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Spin,
  Alert,
  message,
  Breadcrumb
} from 'antd';
import {
  MessageOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { RootState } from '../store';
import { ApplicationRoom, applicationRoomService } from '../services/applicationRoomService';
import RoomMessages from '../components/ApplicationRoom/RoomMessages';
import RoomDocuments from '../components/ApplicationRoom/RoomDocuments';
import RoomInfo from '../components/ApplicationRoom/RoomInfo';

const { Title, Text } = Typography;

const ApplicationRoomPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [room, setRoom] = useState<ApplicationRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');

  useEffect(() => {
    if (applicationId) {
      fetchRoom();
    }
  }, [applicationId]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await applicationRoomService.getRoomByApplicationId(applicationId!);
      
      if (response.success) {
        setRoom(response.data);
      } else {
        message.error('Oda bilgileri alınamadı');
        navigate('/applications');
      }
    } catch (error: any) {
      message.error(error.message || 'Bir hata oluştu');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'green',
      'waiting_documents': 'orange',
      'under_review': 'blue',
      'additional_info_required': 'purple',
      'approved': 'green',
      'rejected': 'red',
      'completed': 'cyan',
      'archived': 'default'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'active': 'Aktif',
      'waiting_documents': 'Belge Bekleniyor',
      'under_review': 'İnceleme Aşamasında',
      'additional_info_required': 'Ek Bilgi Gerekli',
      'approved': 'Onaylandı',
      'rejected': 'Reddedildi',
      'completed': 'Tamamlandı',
      'archived': 'Arşivlendi'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'default',
      'medium': 'blue',
      'high': 'orange',
      'urgent': 'red'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'urgent': 'Acil'
    };
    return texts[priority as keyof typeof texts] || priority;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!room) {
    return (
      <Alert
        message="Oda Bulunamadı"
        description="Aradığınız oda bulunamadı veya erişim yetkiniz bulunmuyor."
        type="error"
        showIcon
        action={
          <Button onClick={() => navigate('/applications')}>
            Başvurulara Dön
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FolderOutlined />
          <span>Başvurular</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Oda</Breadcrumb.Item>
        <Breadcrumb.Item>{room.roomName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/applications')}
                >
                  Geri
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                  {room.roomName}
                </Title>
              </Space>
              <Space>
                <Tag color={getStatusColor(room.status)}>
                  {getStatusText(room.status)}
                </Tag>
                <Tag color={getPriorityColor(room.priority)}>
                  {getPriorityText(room.priority)}
                </Tag>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              {room.application?.user && (
                <Space direction="vertical" size="small" style={{ textAlign: 'right' }}>
                  <Text type="secondary">Başvuran</Text>
                  <Text strong>
                    {room.application.user.firstName} {room.application.user.lastName}
                  </Text>
                </Space>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'messages',
              label: (
                <Space>
                  <MessageOutlined />
                  Mesajlar
                </Space>
              ),
              children: <RoomMessages roomId={room.id} />
            },
            {
              key: 'documents',
              label: (
                <Space>
                  <FileTextOutlined />
                  Belgeler
                </Space>
              ),
              children: <RoomDocuments roomId={room.id} />
            },
            {
              key: 'info',
              label: (
                <Space>
                  <InfoCircleOutlined />
                  Bilgiler
                </Space>
              ),
              children: <RoomInfo room={room} onUpdate={fetchRoomDetails} />
            }
          ]}
          size="large"
        />
      </Card>
    </div>
  );
};

export default ApplicationRoomPage;