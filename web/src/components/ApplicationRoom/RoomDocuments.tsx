import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  List,
  Button,
  Upload,
  Space,
  Typography,
  Form,
  Input,
  Select,
  Modal,
  Spin,
  Empty,
  message,
  Tag,
  Tooltip,
  Progress,
  Row,
  Col,
  Divider
} from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { applicationRoomService, RoomDocument } from '../../services/applicationRoomService';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RoomDocumentsProps {
  roomId: string;
}

const RoomDocuments: React.FC<RoomDocumentsProps> = ({ roomId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  
  const [documents, setDocuments] = useState<RoomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RoomDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchDocuments();
  }, [roomId]);

  const fetchDocuments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await applicationRoomService.getRoomDocuments(roomId, {
        page,
        limit: pagination.pageSize
      });

      if (response.success) {
        setDocuments(response.data.rows || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.count || 0
        }));
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values: any) => {
    const { file, documentType, description, isRequired } = values;
    
    if (!file || !file.file) {
      message.error('Lütfen bir dosya seçin');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulated progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await applicationRoomService.uploadRoomDocument(roomId, file.file, {
        documentType,
        description,
        isRequired
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        message.success('Belge başarıyla yüklendi');
        setUploadModalVisible(false);
        form.resetFields();
        fetchDocuments(); // Refresh documents list
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (document: RoomDocument) => {
    try {
      const blob = await applicationRoomService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Belge indirildi');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handlePreview = (document: RoomDocument) => {
    setSelectedDocument(document);
    setPreviewModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'orange',
      'verified': 'green',
      'rejected': 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'Beklemede',
      'verified': 'Onaylandı',
      'rejected': 'Reddedildi'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': <ClockCircleOutlined />,
      'verified': <CheckCircleOutlined />,
      'rejected': <ExclamationCircleOutlined />
    };
    return icons[status as keyof typeof icons] || <FileOutlined />;
  };

  const formatFileSize = (bytes: number): string => {
    return applicationRoomService.formatFileSize(bytes);
  };

  const getFileIcon = (mimeType: string): string => {
    return applicationRoomService.getFileIcon(mimeType);
  };

  const isImageFile = (mimeType: string): boolean => {
    return applicationRoomService.isImageFile(mimeType);
  };

  const beforeUpload = (file: File) => {
    const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit
    if (!isValidSize) {
      message.error('Dosya boyutu 10MB\'dan küçük olmalıdır!');
      return false;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      message.error('Desteklenmeyen dosya formatı!');
      return false;
    }

    return false; // Prevent automatic upload
  };

  return (
    <div>
      {/* Upload Button */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setUploadModalVisible(true)}
        >
          Belge Yükle
        </Button>
      </div>

      {/* Documents List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : documents.length === 0 ? (
        <Empty 
          description="Henüz belge yüklenmemiş" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={documents}
          pagination={{
            ...pagination,
            onChange: fetchDocuments,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} belge`
          }}
          renderItem={(document) => (
            <List.Item>
              <Card
                size="small"
                hoverable
                actions={[
                  <Tooltip title="İndir">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(document)}
                    />
                  </Tooltip>,
                  <Tooltip title="Önizle">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(document)}
                    />
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  avatar={
                    <div style={{ fontSize: '24px' }}>
                      {getFileIcon(document.mimeType)}
                    </div>
                  }
                  title={
                    <Tooltip title={document.originalName}>
                      <Text ellipsis style={{ width: '150px' }}>
                        {document.originalName}
                      </Text>
                    </Tooltip>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Tag 
                        color={getStatusColor(document.status)} 
                        icon={getStatusIcon(document.status)}
                      >
                        {getStatusText(document.status)}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatFileSize(document.fileSize)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {document.user.firstName} {document.user.lastName}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {new Date(document.uploadedAt).toLocaleDateString('tr-TR')}
                      </Text>
                      {document.description && (
                        <Tooltip title={document.description}>
                          <Text ellipsis style={{ fontSize: '11px', color: '#666' }}>
                            {document.description}
                          </Text>
                        </Tooltip>
                      )}
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Upload Modal */}
      <Modal
        title="Belge Yükle"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          form.resetFields();
          setUploadProgress(0);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleUpload}
          layout="vertical"
        >
          <Form.Item
            name="file"
            label="Dosya"
            rules={[{ required: true, message: 'Lütfen bir dosya seçin' }]}
          >
            <Upload
              beforeUpload={beforeUpload}
              maxCount={1}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            >
              <Button icon={<UploadOutlined />}>Dosya Seç</Button>
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="documentType"
                label="Belge Türü"
              >
                <Select placeholder="Belge türünü seçin">
                  <Option value="identity">Kimlik Belgesi</Option>
                  <Option value="tax_certificate">Vergi Levhası</Option>
                  <Option value="trade_registry">Ticaret Sicil Belgesi</Option>
                  <Option value="financial_statement">Mali Tablo</Option>
                  <Option value="project_proposal">Proje Teklifi</Option>
                  <Option value="other">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isRequired"
                label="Zorunlu Belge"
              >
                <Select placeholder="Seçin">
                  <Option value={true}>Evet</Option>
                  <Option value={false}>Hayır</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea
              rows={3}
              placeholder="Belge hakkında açıklama (opsiyonel)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {uploading && (
            <div style={{ marginBottom: '16px' }}>
              <Progress percent={uploadProgress} status="active" />
            </div>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setUploadModalVisible(false)}>
                İptal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                icon={<UploadOutlined />}
              >
                Yükle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Belge Önizleme"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedDocument && handleDownload(selectedDocument)}>
            İndir
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Kapat
          </Button>
        ]}
        width={800}
      >
        {selectedDocument && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Dosya Adı:</Text>
                  <Text>{selectedDocument.originalName}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Boyut:</Text>
                  <Text>{formatFileSize(selectedDocument.fileSize)}</Text>
                </Space>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Durum:</Text>
                  <Tag color={getStatusColor(selectedDocument.status)}>
                    {getStatusText(selectedDocument.status)}
                  </Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Yükleyen:</Text>
                  <Text>{selectedDocument.user.firstName} {selectedDocument.user.lastName}</Text>
                </Space>
              </Col>
            </Row>

            {selectedDocument.description && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Açıklama:</Text>
                <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <Text>{selectedDocument.description}</Text>
                </div>
              </div>
            )}

            <Divider />

            {/* File Preview */}
            <div style={{ textAlign: 'center', minHeight: '200px' }}>
              {isImageFile(selectedDocument.mimeType) ? (
                <img
                  src={`/api/documents/${selectedDocument.id}/preview`}
                  alt={selectedDocument.originalName}
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ padding: '50px' }}>
                  <FileOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Text type="secondary">
                      Bu dosya türü için önizleme desteklenmiyor.
                      <br />
                      İndirme butonunu kullanarak dosyayı indirebilirsiniz.
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomDocuments;