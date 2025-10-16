const { ApplicationMessage, Application, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Get messages for an application
const getApplicationMessages = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log('getApplicationMessages called:', { applicationId, userId: req.user.id, userRole: req.user.role });

    // Check if user has access to this application
    const application = await Application.findByPk(applicationId);
    if (!application) {
      console.log('Application not found:', applicationId);
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'consultant' && 
        application.userId !== req.user.id) {
      console.log('Authorization failed:', { userId: req.user.id, applicationUserId: application.userId, userRole: req.user.role });
      return res.status(403).json({
        success: false,
        message: 'Bu başvurunun mesajlarını görme yetkiniz yok'
      });
    }

    console.log('Fetching messages for application:', applicationId);
    console.log('Using findByApplicationId with params:', { applicationId, limit: parseInt(limit), offset: parseInt(offset) });
    
    const messages = await ApplicationMessage.findByApplicationId(applicationId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    console.log('Messages fetched:', messages.length);
    console.log('First message structure:', messages.length > 0 ? JSON.stringify(messages[0], null, 2) : 'No messages');
    console.log('Messages data sample:', messages.slice(0, 2));

    // Mark messages as read for the current user
    await ApplicationMessage.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          applicationId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    console.log('Sending response with messages:', messages.length);
    console.log('First message in response:', messages.length > 0 ? {
      id: messages[0].id,
      message: messages[0].message,
      sender: messages[0].sender,
      receiver: messages[0].receiver,
      createdAt: messages[0].createdAt
    } : 'No messages');

    res.json({
      success: true,
      data: messages
    });

    logger.info('Application messages fetched successfully', {
      userId: req.user.id,
      userRole: req.user.role,
      applicationId,
      messageCount: messages.length,
      hasUnread: messages.some(msg => msg.status === 'unread')
    });

  } catch (error) {
    logger.error('Error fetching application messages', {
      userId: req.user.id,
      userRole: req.user.role,
      applicationId,
      error: error.message,
      stack: error.stack
    });
    console.error('Error fetching application messages:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const {
      subject,
      message,
      messageType: rawMessageType,
      priority: rawPriority,
      receiverId,
      attachments = []
    } = req.body;

    console.log('sendMessage called:', { applicationId, userId: req.user.id, userRole: req.user.role });
    console.log('Request body:', req.body);

    // Normalize enums against model constraints
    const allowedTypes = ['question','answer','clarification','document_request','status_update','general'];
    const allowedPriorities = ['low','medium','high','urgent'];
    const normalizedType = allowedTypes.includes(rawMessageType) ? rawMessageType : 'general';
    const normalizedPriority = allowedPriorities.includes(rawPriority) ? rawPriority : 'medium';

    // Check if application exists
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'consultant' && 
        application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu başvuruya mesaj gönderme yetkiniz yok'
      });
    }

    // Determine receiver if not specified
    let finalReceiverId = receiverId;
    if (!finalReceiverId) {
      if (req.user.role === 'company') {
        // Company user sending → öncelik atanmış danışman
        const assignedConsultantId = application.assignedConsultantId;
        if (assignedConsultantId) {
          finalReceiverId = assignedConsultantId;
        } else {
          // Fallback: herhangi bir aktif danışman
          const consultant = await User.findOne({
            where: { role: 'consultant', consultantStatus: 'active', isActive: true, isApproved: true },
            order: [['createdAt', 'ASC']]
          });
          finalReceiverId = consultant ? consultant.id : null;
        }
      } else {
        // Consultant/admin sending to company
        finalReceiverId = application.userId;
      }
    }

    const newMessage = await ApplicationMessage.create({
      applicationId,
      senderId: req.user.id,
      receiverId: finalReceiverId,
      subject,
      message,
      messageType: normalizedType,
      priority: normalizedPriority,
      attachments
    });

    const createdMessage = await ApplicationMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    // Bildirim gönder
    const NotificationService = require('../services/notificationService');
    
    // Room ID'yi bul
    const { ApplicationRoom } = require('../models');
    const room = await ApplicationRoom.findOne({
      where: { applicationId: applicationId }
    });
    
    if (room) {
      await NotificationService.sendRoomMessageNotification(
        room.id,
        req.user.id,
        message
      );
    }

    console.log('Message created successfully:', {
      messageId: createdMessage.id,
      applicationId: createdMessage.applicationId,
      senderId: createdMessage.senderId,
      receiverId: createdMessage.receiverId,
      message: createdMessage.message,
      sender: createdMessage.sender,
      receiver: createdMessage.receiver
    });

    res.status(201).json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: createdMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Reply to a message
const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message, attachments = [] } = req.body;

    const parentMessage = await ApplicationMessage.findByPk(messageId, {
      include: [
        {
          model: Application,
          as: 'application'
        }
      ]
    });

    if (!parentMessage) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'consultant' && 
        parentMessage.application.userId !== req.user.id &&
        parentMessage.senderId !== req.user.id &&
        parentMessage.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu mesaja yanıt verme yetkiniz yok'
      });
    }

    const reply = await parentMessage.reply({
      senderId: req.user.id,
      receiverId: parentMessage.senderId === req.user.id ? parentMessage.receiverId : parentMessage.senderId,
      subject: `Re: ${parentMessage.subject}`,
      message,
      attachments,
      priority: parentMessage.priority
    });

    const createdReply = await ApplicationMessage.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Yanıt başarıyla gönderildi',
      data: createdReply
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Yanıt gönderilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get unread messages for current user
const getUnreadMessages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const unreadMessages = await ApplicationMessage.findUnreadMessages(req.user.id, {
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: unreadMessages
    });
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış mesajlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ApplicationMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    await message.markAsRead(req.user.id);

    res.json({
      success: true,
      message: 'Mesaj okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj okundu olarak işaretlenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const message = await ApplicationMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    // Check authorization (only sender, receiver, or admin can update status)
    if (req.user.role !== 'admin' && 
        message.senderId !== req.user.id && 
        message.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu mesajın durumunu güncelleme yetkiniz yok'
      });
    }

    await message.updateStatus(status);

    res.json({
      success: true,
      message: 'Mesaj durumu başarıyla güncellendi',
      data: message
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj durumu güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get message thread
const getMessageThread = async (req, res) => {
  try {
    const { messageId } = req.params;

    const messageThread = await ApplicationMessage.getMessageThread(messageId);
    if (!messageThread) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    // Check authorization
    const application = await Application.findByPk(messageThread.applicationId);
    if (req.user.role !== 'admin' && 
        req.user.role !== 'consultant' && 
        application.userId !== req.user.id &&
        messageThread.senderId !== req.user.id &&
        messageThread.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu mesaj dizisini görme yetkiniz yok'
      });
    }

    res.json({
      success: true,
      data: messageThread
    });
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj dizisi getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get user's all messages (inbox)
const getUserMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, messageType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    if (messageType) {
      whereClause.messageType = messageType;
    }

    const { count, rows: messages } = await ApplicationMessage.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'applicationNumber', 'projectTitle', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getApplicationMessages,
  sendMessage,
  replyToMessage,
  getUnreadMessages,
  markMessageAsRead,
  updateMessageStatus,
  getMessageThread,
  getUserMessages
};