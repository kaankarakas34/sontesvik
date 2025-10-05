const { Notification, User, Sector } = require('../models');
const { Op } = require('sequelize');
const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Get all notifications with pagination and filtering
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      targetConsultants,
      targetUsers,
      isActive
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search in title and content
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by target consultants
    if (targetConsultants !== undefined) {
      whereClause.targetConsultants = targetConsultants === 'true';
    }

    // Filter by target users
    if (targetUsers !== undefined) {
      whereClause.targetUsers = targetUsers === 'true';
    }

    // Filter by active status
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Create new notification
const createNotification = async (req, res) => {
  try {
    const {
      title,
      content,
      link,
      targetConsultants = false,
      targetUsers = false,
      targetSectors = []
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve içerik alanları zorunludur'
      });
    }

    if (!targetConsultants && !targetUsers) {
      return res.status(400).json({
        success: false,
        message: 'En az bir hedef kitle seçilmelidir (Danışman veya Kullanıcı)'
      });
    }

    // Validate sectors if provided
    if (targetSectors && targetSectors.length > 0) {
      const validSectors = await Sector.findAll({
        where: { id: { [Op.in]: targetSectors } },
        attributes: ['id']
      });

      if (validSectors.length !== targetSectors.length) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz sektör ID\'leri bulundu'
        });
      }
    }

    const notification = await Notification.create({
      title,
      content,
      link: link || null,
      targetConsultants,
      targetUsers,
      targetSectors: targetSectors.length > 0 ? targetSectors : null,
      createdBy: req.user.id,
      sentAt: new Date()
    });

    // Fetch the created notification with creator info
    const createdNotification = await Notification.findByPk(notification.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Bildirim başarıyla oluşturuldu',
      data: createdNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      link,
      targetConsultants,
      targetUsers,
      targetSectors,
      isActive
    } = req.body;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    // Validate sectors if provided
    if (targetSectors && targetSectors.length > 0) {
      const validSectors = await Sector.findAll({
        where: { id: { [Op.in]: targetSectors } },
        attributes: ['id']
      });

      if (validSectors.length !== targetSectors.length) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz sektör ID\'leri bulundu'
        });
      }
    }

    await notification.update({
      title: title || notification.title,
      content: content || notification.content,
      link: link !== undefined ? link : notification.link,
      targetConsultants: targetConsultants !== undefined ? targetConsultants : notification.targetConsultants,
      targetUsers: targetUsers !== undefined ? targetUsers : notification.targetUsers,
      targetSectors: targetSectors !== undefined ? (targetSectors.length > 0 ? targetSectors : null) : notification.targetSectors,
      isActive: isActive !== undefined ? isActive : notification.isActive
    });

    // Fetch updated notification with creator info
    const updatedNotification = await Notification.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Bildirim başarıyla güncellendi',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Bildirim başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.count();
    const activeNotifications = await Notification.count({ where: { isActive: true } });
    const consultantNotifications = await Notification.count({ where: { targetConsultants: true } });
    const userNotifications = await Notification.count({ where: { targetUsers: true } });

    res.json({
      success: true,
      data: {
        total: totalNotifications,
        active: activeNotifications,
        targetingConsultants: consultantNotifications,
        targetingUsers: userNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim istatistikleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Room bildirim fonksiyonları
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { userId: req.user.id };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const notifications = await NotificationService.getUnreadNotifications(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    logger.error('Error getting unread notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış bildirimler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const success = await NotificationService.markAsRead(
      notificationId,
      req.user.id
    );

    if (success) {
      res.json({
        success: true,
        message: 'Bildirim okundu olarak işaretlendi'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim işaretlenirken bir hata oluştu',
      error: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const success = await NotificationService.markAllAsRead(req.user.id);

    if (success) {
      res.json({
        success: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Bildirimler işaretlenirken bir hata oluştu'
      });
    }
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler işaretlenirken bir hata oluştu',
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış bildirim sayısı getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationStats,
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};