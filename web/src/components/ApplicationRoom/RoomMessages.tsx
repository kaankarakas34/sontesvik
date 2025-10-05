import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  List,
  Button,
  Input,
  Space,
  Typography,
  Avatar,
  Spin,
  Empty,
  message,
  Tag,
  Tooltip,
  Divider,
  Row,
  Col,
  Badge,
  Affix
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { applicationRoomService, RoomMessage } from '../../services/applicationRoomService';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface RoomMessagesProps {
  roomId: string;
}

const RoomMessages: React.FC<RoomMessagesProps> = ({ roomId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    hasMore: true
  });

  useEffect(() => {
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const response = await applicationRoomService.getRoomMessages(roomId, {
        page,
        limit: pagination.pageSize,
        order: 'ASC' // Oldest first for chat-like experience
      });

      if (response.success) {
        const newMessages = response.data.rows || [];
        
        if (append) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }

        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.count || 0,
          hasMore: newMessages.length === pagination.pageSize
        }));
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (pagination.hasMore && !loading) {
      await fetchMessages(pagination.current + 1, true);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      message.warning('Lütfen bir mesaj yazın');
      return;
    }

    try {
      setSending(true);
      
      const response = await applicationRoomService.sendRoomMessage(roomId, {
        content: messageText.trim(),
        messageType: 'text'
      });

      if (response.success) {
        setMessageText('');
        // Add the new message to the list immediately for better UX
        const newMessage: RoomMessage = {
          id: response.data.id,
          content: messageText.trim(),
          messageType: 'text',
          status: 'sent',
          sentAt: new Date().toISOString(),
          user: {
            id: user?.id || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            role: user?.role || 'member'
          },
          isFromConsultant: user?.role === 'consultant' || user?.role === 'admin'
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Optionally refresh to get the exact server state
        setTimeout(() => {
          fetchMessages();
        }, 1000);
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatusColor = (status: string) => {
    const colors = {
      'sent': 'blue',
      'delivered': 'green',
      'read': 'purple',
      'failed': 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getMessageStatusText = (status: string) => {
    const texts = {
      'sent': 'Gönderildi',
      'delivered': 'İletildi',
      'read': 'Okundu',
      'failed': 'Başarısız'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getMessageStatusIcon = (status: string) => {
    const icons = {
      'sent': <ClockCircleOutlined />,
      'delivered': <CheckCircleOutlined />,
      'read': <CheckCircleOutlined />,
      'failed': <ExclamationCircleOutlined />
    };
    return icons[status as keyof typeof icons];
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('tr-TR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  const isMyMessage = (messageUser: any) => {
    return messageUser.id === user?.id;
  };

  const shouldShowAvatar = (message: RoomMessage, index: number) => {
    if (index === messages.length - 1) return true;
    
    const nextMessage = messages[index + 1];
    return nextMessage.user.id !== message.user.id;
  };

  const shouldShowTimestamp = (message: RoomMessage, index: number) => {
    if (index === 0) return true;
    
    const prevMessage = messages[index - 1];
    const currentTime = new Date(message.sentAt);
    const prevTime = new Date(prevMessage.sentAt);
    
    // Show timestamp if more than 5 minutes apart
    return (currentTime.getTime() - prevTime.getTime()) > 5 * 60 * 1000;
  };

  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Container */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        backgroundColor: '#fafafa'
      }}>
        {/* Load More Button */}
        {pagination.hasMore && messages.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={loadMoreMessages}
              loading={loading}
            >
              Önceki mesajları yükle
            </Button>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <Empty 
            description="Henüz mesaj yok" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            {messages.map((message, index) => {
              const isMine = isMyMessage(message.user);
              const showAvatar = shouldShowAvatar(message, index);
              const showTimestamp = shouldShowTimestamp(message, index);

              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div style={{ 
                      textAlign: 'center', 
                      margin: '16px 0',
                      color: '#999',
                      fontSize: '12px'
                    }}>
                      {formatMessageTime(message.sentAt)}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: showAvatar ? '16px' : '4px',
                    alignItems: 'flex-end'
                  }}>
                    {!isMine && (
                      <div style={{ marginRight: '8px' }}>
                        {showAvatar ? (
                          <Avatar
                            size="small"
                            icon={message.isFromConsultant ? <TeamOutlined /> : <UserOutlined />}
                            style={{
                              backgroundColor: message.isFromConsultant ? '#1890ff' : '#52c41a'
                            }}
                          />
                        ) : (
                          <div style={{ width: '24px' }} />
                        )}
                      </div>
                    )}

                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start'
                    }}>
                      {showAvatar && !isMine && (
                        <div style={{ 
                          marginBottom: '4px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {message.user.firstName} {message.user.lastName}
                          {message.isFromConsultant && (
                            <Tag size="small" color="blue" style={{ marginLeft: '4px' }}>
                              Danışman
                            </Tag>
                          )}
                        </div>
                      )}

                      <div style={{
                        backgroundColor: isMine ? '#1890ff' : '#fff',
                        color: isMine ? '#fff' : '#000',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        wordBreak: 'break-word'
                      }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </div>
                      </div>

                      {isMine && showAvatar && (
                        <div style={{ 
                          marginTop: '4px',
                          fontSize: '11px',
                          color: '#999',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {getMessageStatusIcon(message.status)}
                          {getMessageStatusText(message.status)}
                        </div>
                      )}
                    </div>

                    {isMine && (
                      <div style={{ marginLeft: '8px' }}>
                        {showAvatar ? (
                          <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        ) : (
                          <div style={{ width: '24px' }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <Affix offsetBottom={0}>
        <Card 
          size="small" 
          style={{ 
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none'
          }}
        >
          <Row gutter={8} align="middle">
            <Col flex="auto">
              <TextArea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın... (Enter: gönder, Shift+Enter: yeni satır)"
                autoSize={{ minRows: 1, maxRows: 4 }}
                maxLength={1000}
                showCount
              />
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={sending}
                disabled={!messageText.trim()}
              >
                Gönder
              </Button>
            </Col>
          </Row>
        </Card>
      </Affix>
    </div>
  );
};

export default RoomMessages;