const { ApplicationRoom, Application, User, ApplicationMessage, Document, DocumentType } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ApplicationRoomController {
  /**
   * Başvuru ID'sine göre room getir
   */
  static async getRoomByApplicationId(req, res) {
    try {
      const { applicationId } = req.params;

      const room = await ApplicationRoom.findOne({
        where: { applicationId },
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              },
              {
                model: User,
                as: 'assignedConsultant',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Bu başvuru için room bulunamadı'
        });
      }

      // Yetki kontrolü
      const hasAccess = req.user.role === 'admin' ||
                       (req.user.role === 'consultant' && room.application?.assignedConsultantId === req.user.id) ||
                       (req.user.role === 'company' && room.application?.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu room\'a erişim yetkiniz yok'
        });
      }

      res.json({
        success: true,
        data: room
      });

    } catch (error) {
      logger.error('Room getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Room bilgileri alınırken bir hata oluştu'
      });
    }
  }

  /**
   * Room'a belge yükle
   */
  static async uploadRoomDocument(req, res) {
    try {
      const { roomId } = req.params;
      const { documentTypeId, description } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi'
        });
      }

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Yetki kontrolü için application bilgisini al
      const application = await Application.findByPk(room.applicationId);
      const hasAccess = req.user.role === 'admin' ||
                       (req.user.role === 'consultant' && application.assignedConsultantId === req.user.id) ||
                       (req.user.role === 'company' && application.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu room\'a belge yükleme yetkiniz yok'
        });
      }

      // Dosya türü ve boyut kontrolleri
      const settings = room.settings || {};
      const allowedFileTypes = settings.allowedFileTypes || ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
      const maxFileSize = settings.maxFileSize || 10485760; // 10MB

      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
      if (!allowedFileTypes.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: `Bu dosya türü desteklenmiyor. İzin verilen türler: ${allowedFileTypes.join(', ')}`
        });
      }

      if (req.file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: `Dosya boyutu çok büyük. Maksimum boyut: ${Math.round(maxFileSize / 1024 / 1024)}MB`
        });
      }

      // Document oluştur
      const document = await Document.create({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentTypeId: documentTypeId || null,
        applicationId: room.applicationId,
        userId: req.user.id,
        description: description || null,
        status: 'pending'
      });

      // Room istatistiklerini güncelle
      const ApplicationRoomService = require('../services/applicationRoomService');
      await ApplicationRoomService.updateRoomOnNewDocument(room.id, req.user.id);

      // Bildirim gönder
      const NotificationService = require('../services/notificationService');
      await NotificationService.sendRoomDocumentNotification(
        room.id,
        req.user.id,
        req.file.originalname,
        documentWithType.type ? documentWithType.type.name : 'Belge'
      );

      // Document bilgilerini type ile birlikte getir
      const documentWithType = await Document.findByPk(document.id, {
        include: [
          {
            model: DocumentType,
            as: 'type',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: documentWithType,
        message: 'Belge başarıyla yüklendi'
      });

    } catch (error) {
      // Hata durumunda yüklenen dosyayı temizle
      if (req.file && require('fs').existsSync(req.file.path)) {
        require('fs').unlinkSync(req.file.path);
      }
      
      logger.error('Error uploading room document:', error);
      res.status(500).json({
        success: false,
        message: 'Belge yüklenirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Kullanıcının roomlarını listele
   */
  static async getUserRooms(req, res) {
    try {
      const { page = 1, limit = 10, status, priority } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      // Kullanıcı rolüne göre filtreleme
      if (req.user.role === 'consultant') {
        // Danışman sadece kendine atanan başvuruların roomlarını görebilir
        whereClause = {
          '$application.assignedConsultantId$': req.user.id
        };
      } else if (req.user.role === 'company') {
        // Şirket kullanıcısı sadece kendi başvurularının roomlarını görebilir
        whereClause = {
          '$application.userId$': req.user.id
        };
      }
      // Admin tüm roomları görebilir

      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;

      const rooms = await ApplicationRoom.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'companyName']
              },
              {
                model: User,
                as: 'assignedConsultant',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['priority', 'DESC'], ['lastActivityAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          rooms: rooms.rows,
          pagination: {
            total: rooms.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(rooms.count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching user rooms:', error);
      res.status(500).json({
        success: false,
        message: 'Roomlar getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Belirli bir room'u getir
   */
  static async getRoomById(req, res) {
    try {
      const { roomId } = req.params;

      const room = await ApplicationRoom.findByPk(roomId, {
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'companyName']
              },
              {
                model: User,
                as: 'assignedConsultant',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Yetki kontrolü
      const hasAccess = req.user.role === 'admin' ||
                       (req.user.role === 'consultant' && room.application.assignedConsultantId === req.user.id) ||
                       (req.user.role === 'company' && room.application.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu room\'a erişim yetkiniz yok'
        });
      }

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      logger.error('Error fetching room:', error);
      res.status(500).json({
        success: false,
        message: 'Room getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Room için mesajları getir
   */
  static async getRoomMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Yetki kontrolü için application bilgisini al
      const application = await Application.findByPk(room.applicationId);
      const hasAccess = req.user.role === 'admin' ||
                       (req.user.role === 'consultant' && application.assignedConsultantId === req.user.id) ||
                       (req.user.role === 'company' && application.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu room\'un mesajlarına erişim yetkiniz yok'
        });
      }

      const messages = await ApplicationMessage.findByApplicationId(room.applicationId, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Mesajları okundu olarak işaretle
      await ApplicationMessage.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            applicationId: room.applicationId,
            receiverId: req.user.id,
            isRead: false
          }
        }
      );

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      logger.error('Error fetching room messages:', error);
      res.status(500).json({
        success: false,
        message: 'Room mesajları getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Room'a mesaj gönder
   */
  static async sendRoomMessage(req, res) {
    try {
      const { roomId } = req.params;
      const { subject, message, messageType = 'general', priority = 'medium' } = req.body;

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Yetki kontrolü için application bilgisini al
      const application = await Application.findByPk(room.applicationId, {
        include: [
          { model: User, as: 'user' },
          { model: User, as: 'assignedConsultant' }
        ]
      });

      const hasAccess = req.user.role === 'admin' ||
                       (req.user.role === 'consultant' && application.assignedConsultantId === req.user.id) ||
                       (req.user.role === 'company' && application.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu room\'a mesaj gönderme yetkiniz yok'
        });
      }

      // Alıcıyı belirle
      let receiverId;
      if (req.user.role === 'company') {
        receiverId = application.assignedConsultantId;
      } else if (req.user.role === 'consultant') {
        receiverId = application.userId;
      }

      const newMessage = await ApplicationMessage.create({
        applicationId: room.applicationId,
        senderId: req.user.id,
        receiverId,
        subject,
        message,
        messageType,
        priority
      });

      // Room istatistiklerini güncelle
      await room.updateStats('message', { 
        isConsultant: req.user.role === 'consultant' 
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

      res.status(201).json({
        success: true,
        message: 'Mesaj başarıyla gönderildi',
        data: createdMessage
      });
    } catch (error) {
      logger.error('Error sending room message:', error);
      res.status(500).json({
        success: false,
        message: 'Mesaj gönderilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Room belgelerini getir
   */
  static async getRoomDocuments(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 10, documentType } = req.query;
      const offset = (page - 1) * limit;

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Yetki kontrolü
      const application = await Application.findByPk(room.applicationId);
      const hasAccess = req.user.role === 'admin' ||
                       (req.user.role === 'consultant' && application.assignedConsultantId === req.user.id) ||
                       (req.user.role === 'company' && application.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Bu room\'un belgelerine erişim yetkiniz yok'
        });
      }

      let whereClause = { applicationId: room.applicationId };
      if (documentType) whereClause.documentType = documentType;

      const documents = await Document.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['uploadedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          documents: documents.rows,
          pagination: {
            total: documents.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(documents.count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching room documents:', error);
      res.status(500).json({
        success: false,
        message: 'Room belgeleri getirilirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Room önceliğini güncelle (Sadece danışman)
   */
  static async updateRoomPriority(req, res) {
    try {
      const { roomId } = req.params;
      const { priority, reason } = req.body;

      if (req.user.role !== 'consultant' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Room önceliğini güncelleme yetkiniz yok'
        });
      }

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Danışman sadece kendi atandığı roomların önceliğini değiştirebilir
      if (req.user.role === 'consultant') {
        const application = await Application.findByPk(room.applicationId);
        if (application.assignedConsultantId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Bu room\'un önceliğini güncelleme yetkiniz yok'
          });
        }
      }

      const oldPriority = room.priority;
      await room.setPriority(priority, reason);

      // Bildirim gönder
      const NotificationService = require('../services/notificationService');
      await NotificationService.sendRoomPriorityChangeNotification(
        room.id,
        req.user.id,
        oldPriority,
        priority
      );

      res.json({
        success: true,
        message: 'Room önceliği başarıyla güncellendi',
        data: room
      });
    } catch (error) {
      logger.error('Error updating room priority:', error);
      res.status(500).json({
        success: false,
        message: 'Room önceliği güncellenirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Danışman notu ekle
   */
  static async addConsultantNote(req, res) {
    try {
      const { roomId } = req.params;
      const { note } = req.body;

      if (req.user.role !== 'consultant' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Danışman notu ekleme yetkiniz yok'
        });
      }

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Danışman sadece kendi atandığı roomlara not ekleyebilir
      if (req.user.role === 'consultant') {
        const application = await Application.findByPk(room.applicationId);
        if (application.assignedConsultantId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Bu room\'a not ekleme yetkiniz yok'
          });
        }
      }

      await room.addConsultantNote(note, req.user.id);

      // Bildirim gönder
      const NotificationService = require('../services/notificationService');
      await NotificationService.sendConsultantNoteNotification(
        room.id,
        req.user.id,
        note
      );

      res.json({
        success: true,
        message: 'Danışman notu başarıyla eklendi',
        data: room
      });
    } catch (error) {
      logger.error('Error adding consultant note:', error);
      res.status(500).json({
        success: false,
        message: 'Danışman notu eklenirken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Room durumunu güncelle
   */
  static async updateRoomStatus(req, res) {
    try {
      const { roomId } = req.params;
      const { status } = req.body;

      if (req.user.role !== 'consultant' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Room durumunu güncelleme yetkiniz yok'
        });
      }

      const room = await ApplicationRoom.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room bulunamadı'
        });
      }

      // Danışman sadece kendi atandığı roomların durumunu değiştirebilir
      if (req.user.role === 'consultant') {
        const application = await Application.findByPk(room.applicationId);
        if (application.assignedConsultantId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Bu room\'un durumunu güncelleme yetkiniz yok'
          });
        }
      }

      const oldStatus = room.status;
      room.status = status;
      await room.updateActivity();
      await room.save();

      // Bildirim gönder
      const NotificationService = require('../services/notificationService');
      await NotificationService.sendRoomStatusChangeNotification(
        room.id,
        req.user.id,
        oldStatus,
        status
      );

      res.json({
        success: true,
        message: 'Room durumu başarıyla güncellendi',
        data: room
      });
    } catch (error) {
      logger.error('Error updating room status:', error);
      res.status(500).json({
        success: false,
        message: 'Room durumu güncellenirken bir hata oluştu',
        error: error.message
      });
    }
  }
}

module.exports = ApplicationRoomController;