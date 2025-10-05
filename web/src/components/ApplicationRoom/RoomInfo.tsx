import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  Timeline,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Progress,
  Alert
} from 'antd';
import {
  InfoCircleOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { ApplicationRoom, applicationRoomService } from '../../services/applicationRoomService';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RoomInfoProps {
  room: ApplicationRoom;
  onRoomUpdate?: (updatedRoom: ApplicationRoom) => void;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ room, onRoomUpdate }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isConsultantOrAdmin = user?.role === 'consultant' || user?.role === 'admin';

  const handleUpdateRoom = async (values: any) => {
    try {
      setLoading(true);
      const response = await applicationRoomService.updateRoomStatus(room.id, {
        status: values.status,
        priority: values.priority
      });

      if (response.success) {
        message.success('Oda bilgileri güncellendi');
        setEditModalVisible(false);
        onRoomUpdate?.(response.data);
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (values: any) => {
    try {
      setLoading(true);
      const response = await applicationRoomService.addConsultantNote(room.id, values.note);

      if (response.success) {
        message.success('Not eklendi');
        setNoteModalVisible(false);
        form.resetFields();
        onRoomUpdate?.(response.data);
      }
    } catch (error: any) {
      message.error(error.message);
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
      'under_review': 'İnceleme Altında',
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

  const getPriorityIcon = (priority: string) => {
    const icons = {
      'low': <InfoCircleOutlined />,
      'medium': <ClockCircleOutlined />,
      'high': <ExclamationCircleOutlined />,
      'urgent': <WarningOutlined />
    };
    return icons[priority as keyof typeof icons] || <InfoCircleOutlined />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getProgressPercentage = () => {
    const status = room.status;
    const progressMap = {
      'active': 20,
      'waiting_documents': 40,
      'under_review': 60,
      'additional_info_required': 50,
      'approved': 90,
      'rejected': 100,
      'completed': 100,
      'archived': 100
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getProgressStatus = () => {
    const status = room.status;
    if (status === 'rejected') return 'exception';
    if (status === 'completed' || status === 'approved') return 'success';
    return 'active';
  };

  return (
    <div>
      {/* Room Header */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0 }}>
                {room.roomName}
              </Title>
              <Space>
                <Tag 
                  color={getStatusColor(room.status)} 
                  icon={<CheckCircleOutlined />}
                >
                  {getStatusText(room.status)}
                </Tag>
                <Tag 
                  color={getPriorityColor(room.priority)} 
                  icon={getPriorityIcon(room.priority)}
                >
                  {getPriorityText(room.priority)}
                </Tag>
              </Space>
            </Space>
          </Col>
          <Col>
            {isConsultantOrAdmin && (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setEditModalVisible(true)}
                >
                  Düzenle
                </Button>
                <Button
                  icon={<FileTextOutlined />}
                  onClick={() => setNoteModalVisible(true)}
                >
                  Not Ekle
                </Button>
              </Space>
            )}
          </Col>
        </Row>

        {/* Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <Progress
            percent={getProgressPercentage()}
            status={getProgressStatus()}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      </Card>

      {/* Room Statistics */}
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Mesaj"
              value={room.stats?.totalMessages || 0}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Belge"
              value={room.stats?.totalDocuments || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Bekleyen Belge"
              value={room.stats?.pendingDocuments || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Onaylanan Belge"
              value={room.stats?.approvedDocuments || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Room Details */}
      <Card title="Oda Detayları" style={{ marginTop: '16px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Oda ID">
            <Text code>{room.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Başvuru ID">
            <Text code>{room.applicationId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturulma Tarihi">
            <Space>
              <CalendarOutlined />
              {formatDate(room.createdAt)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Son Aktivite">
            <Space>
              <ClockCircleOutlined />
              {room.lastActivityAt ? formatDate(room.lastActivityAt) : 'Henüz aktivite yok'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={2}>
            {room.roomDescription || (
              <Text type="secondary">Açıklama eklenmemiş</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Application Info */}
      {room.application && (
        <Card title="Başvuru Bilgileri" style={{ marginTop: '16px' }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Başvuru Türü">
              {room.application.applicationType}
            </Descriptions.Item>
            <Descriptions.Item label="Başvuru Durumu">
              <Tag color={getStatusColor(room.application.status)}>
                {getStatusText(room.application.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Başvuran">
              <Space>
                <UserOutlined />
                {room.application.user?.firstName} {room.application.user?.lastName}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Danışman">
              {room.application.consultant ? (
                <Space>
                  <TeamOutlined />
                  {room.application.consultant.firstName} {room.application.consultant.lastName}
                </Space>
              ) : (
                <Text type="secondary">Atanmamış</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Consultant Notes */}
      {room.consultantNotes && (
        <Card title="Danışman Notları" style={{ marginTop: '16px' }}>
          <Alert
            message="Danışman Notu"
            description={room.consultantNotes}
            type="info"
            showIcon
          />
        </Card>
      )}

      {/* Room Settings */}
      {room.settings && Object.keys(room.settings).length > 0 && (
        <Card 
          title={
            <Space>
              <SettingOutlined />
              Oda Ayarları
            </Space>
          } 
          style={{ marginTop: '16px' }}
        >
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {JSON.stringify(room.settings, null, 2)}
          </pre>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        title="Oda Bilgilerini Düzenle"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleUpdateRoom}
          layout="vertical"
          initialValues={{
            status: room.status,
            priority: room.priority
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Durum"
                rules={[{ required: true, message: 'Durum seçin' }]}
              >
                <Select>
                  <Option value="active">Aktif</Option>
                  <Option value="waiting_documents">Belge Bekleniyor</Option>
                  <Option value="under_review">İnceleme Altında</Option>
                  <Option value="additional_info_required">Ek Bilgi Gerekli</Option>
                  <Option value="approved">Onaylandı</Option>
                  <Option value="rejected">Reddedildi</Option>
                  <Option value="completed">Tamamlandı</Option>
                  <Option value="archived">Arşivlendi</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Öncelik"
                rules={[{ required: true, message: 'Öncelik seçin' }]}
              >
                <Select>
                  <Option value="low">Düşük</Option>
                  <Option value="medium">Orta</Option>
                  <Option value="high">Yüksek</Option>
                  <Option value="urgent">Acil</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Güncelle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Note Modal */}
      <Modal
        title="Danışman Notu Ekle"
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleAddNote}
          layout="vertical"
        >
          <Form.Item
            name="note"
            label="Not"
            rules={[
              { required: true, message: 'Not içeriği gerekli' },
              { min: 10, message: 'Not en az 10 karakter olmalı' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Danışman notunuzu yazın..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setNoteModalVisible(false)}>
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<FileTextOutlined />}
              >
                Not Ekle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomInfo;