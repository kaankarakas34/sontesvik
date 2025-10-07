const { Notification, User, ApplicationRoom, Application } = require('../models');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Room mesaj bildirimi gönder
   */
  static async sendRoomMessageNotification(roomId, senderId, messageContent) {
    try {
      const room = await ApplicationRoom.findByPk(roomId, {
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              { model: User, as: 'user' },
              { model: User, as: 'assignedConsultant' }
            ]
          }
        ]
      });

      if (!room) {
        logger.error('Room bulunamadı:', roomId);
        return;
      }

      const sender = await User.findByPk(senderId);
      if (!sender) {
        logger.error('Gönderen kullanıcı bulunamadı:', senderId);
        return;
      }

      // Bildirim alacak kullanıcıları belirle
      const recipients = [];
      
      // Başvuru sahibine bildir (gönderen değilse)
      if (room.application.user && room.application.user.id !== senderId) {
        recipients.push(room.application.user);
      }

      // Danışmana bildir (gönderen değilse)
      if (room.application.assignedConsultant && room.application.assignedConsultant.id !== senderId) {
        recipients.push(room.application.assignedConsultant);
      }

      // Bildirimleri oluştur
      const notifications = recipients.map(recipient => ({
        userId: recipient.id,
        type: 'room_message',
        title: 'Yeni Mesaj',
        message: `${sender.firstName} ${sender.lastName} size bir mesaj gönderdi: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`,
        data: {
          roomId: roomId,
          applicationId: room.applicationId,
          senderId: senderId,
          senderName: `${sender.firstName} ${sender.lastName}`,
          roomName: room.roomName
        },
        isRead: false
      }));

      if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
        logger.info(`${notifications.length} room mesaj bildirimi gönderildi`);
      }

    } catch (error) {
      logger.error('Room mesaj bildirimi gönderme hatası:', error);
    }
  }

  /**
   * Room belge yükleme bildirimi gönder
   */
  static async sendRoomDocumentNotification(roomId, uploaderId, documentName, documentType) {
    try {
      const room = await ApplicationRoom.findByPk(roomId, {
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              { model: User, as: 'user' },
              { model: User, as: 'assignedConsultant' }
            ]
          }
        ]
      });

      if (!room) {
        logger.error('Room bulunamadı:', roomId);
        return;
      }

      const uploader = await User.findByPk(uploaderId);
      if (!uploader) {
        logger.error('Yükleyen kullanıcı bulunamadı:', uploaderId);
        return;
      }

      // Bildirim alacak kullanıcıları belirle
      const recipients = [];
      
      // Başvuru sahibine bildir (yükleyen değilse)
      if (room.application.user && room.application.user.id !== uploaderId) {
        recipients.push(room.application.user);
      }

      // Danışmana bildir (yükleyen değilse)
      if (room.application.assignedConsultant && room.application.assignedConsultant.id !== uploaderId) {
        recipients.push(room.application.assignedConsultant);
      }

      // Bildirimleri oluştur
      const notifications = recipients.map(recipient => ({
        userId: recipient.id,
        type: 'room_document',
        title: 'Yeni Belge Yüklendi',
        message: `${uploader.firstName} ${uploader.lastName} yeni bir belge yükledi: "${documentName}"`,
        data: {
          roomId: roomId,
          applicationId: room.applicationId,
          uploaderId: uploaderId,
          uploaderName: `${uploader.firstName} ${uploader.lastName}`,
          documentName: documentName,
          documentType: documentType,
          roomName: room.roomName
        },
        isRead: false
      }));

      if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
        logger.info(`${notifications.length} room belge bildirimi gönderildi`);
      }

    } catch (error) {
      logger.error('Room belge bildirimi gönderme hatası:', error);
    }
  }

  /**
   * Room durum değişikliği bildirimi gönder
   */
  static async sendRoomStatusChangeNotification(roomId, changerId, oldStatus, newStatus) {
    try {
      const room = await ApplicationRoom.findByPk(roomId, {
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              { model: User, as: 'user' },
              { model: User, as: 'assignedConsultant' }
            ]
          }
        ]
      });

      if (!room) {
        logger.error('Room bulunamadı:', roomId);
        return;
      }

      const changer = await User.findByPk(changerId);
      if (!changer) {
        logger.error('Değiştiren kullanıcı bulunamadı:', changerId);
        return;
      }

      // Durum metinleri
      const statusTexts = {
        'active': 'Aktif',
        'waiting_documents': 'Belge Bekleniyor',
        'under_review': 'İnceleme Altında',
        'additional_info_required': 'Ek Bilgi Gerekli',
        'approved': 'Onaylandı',
        'rejected': 'Reddedildi',
        'completed': 'Tamamlandı',
        'archived': 'Arşivlendi'
      };

      // Bildirim alacak kullanıcıları belirle
      const recipients = [];
      
      // Başvuru sahibine bildir (değiştiren değilse)
      if (room.application.user && room.application.user.id !== changerId) {
        recipients.push(room.application.user);
      }

      // Danışmana bildir (değiştiren değilse)
      if (room.application.assignedConsultant && room.application.assignedConsultant.id !== changerId) {
        recipients.push(room.application.assignedConsultant);
      }

      // Bildirimleri oluştur
      const notifications = recipients.map(recipient => ({
        userId: recipient.id,
        type: 'room_status_change',
        title: 'Oda Durumu Değişti',
        message: `${changer.firstName} ${changer.lastName} oda durumunu "${statusTexts[oldStatus] || oldStatus}" den "${statusTexts[newStatus] || newStatus}" olarak değiştirdi`,
        data: {
          roomId: roomId,
          applicationId: room.applicationId,
          changerId: changerId,
          changerName: `${changer.firstName} ${changer.lastName}`,
          oldStatus: oldStatus,
          newStatus: newStatus,
          oldStatusText: statusTexts[oldStatus] || oldStatus,
          newStatusText: statusTexts[newStatus] || newStatus,
          roomName: room.roomName
        },
        isRead: false
      }));

      if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
        logger.info(`${notifications.length} room durum değişikliği bildirimi gönderildi`);
      }

    } catch (error) {
      logger.error('Room durum değişikliği bildirimi gönderme hatası:', error);
    }
  }

  /**
   * Room öncelik değişikliği bildirimi gönder
   */
  static async sendRoomPriorityChangeNotification(roomId, changerId, oldPriority, newPriority) {
    try {
      const room = await ApplicationRoom.findByPk(roomId, {
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              { model: User, as: 'user' },
              { model: User, as: 'consultant' }
            ]
          }
        ]
      });

      if (!room) {
        logger.error('Room bulunamadı:', roomId);
        return;
      }

      const changer = await User.findByPk(changerId);
      if (!changer) {
        logger.error('Değiştiren kullanıcı bulunamadı:', changerId);
        return;
      }

      // Öncelik metinleri
      const priorityTexts = {
        'low': 'Düşük',
        'medium': 'Orta',
        'high': 'Yüksek',
        'urgent': 'Acil'
      };

      // Bildirim alacak kullanıcıları belirle
      const recipients = [];
      
      // Başvuru sahibine bildir (değiştiren değilse)
      if (room.application.user && room.application.user.id !== changerId) {
        recipients.push(room.application.user);
      }

      // Danışmana bildir (değiştiren değilse)
      if (room.application.consultant && room.application.consultant.id !== changerId) {
        recipients.push(room.application.consultant);
      }

      // Bildirimleri oluştur
      const notifications = recipients.map(recipient => ({
        userId: recipient.id,
        type: 'room_priority_change',
        title: 'Oda Önceliği Değişti',
        message: `${changer.firstName} ${changer.lastName} oda önceliğini "${priorityTexts[oldPriority] || oldPriority}" den "${priorityTexts[newPriority] || newPriority}" olarak değiştirdi`,
        data: {
          roomId: roomId,
          applicationId: room.applicationId,
          changerId: changerId,
          changerName: `${changer.firstName} ${changer.lastName}`,
          oldPriority: oldPriority,
          newPriority: newPriority,
          oldPriorityText: priorityTexts[oldPriority] || oldPriority,
          newPriorityText: priorityTexts[newPriority] || newPriority,
          roomName: room.roomName
        },
        isRead: false
      }));

      if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
        logger.info(`${notifications.length} room öncelik değişikliği bildirimi gönderildi`);
      }

    } catch (error) {
      logger.error('Room öncelik değişikliği bildirimi gönderme hatası:', error);
    }
  }

  /**
   * Danışman notu ekleme bildirimi gönder
   */
  static async sendConsultantNoteNotification(roomId, consultantId, noteContent) {
    try {
      const room = await ApplicationRoom.findByPk(roomId, {
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              { model: User, as: 'user' },
              { model: User, as: 'consultant' }
            ]
          }
        ]
      });

      if (!room) {
        logger.error('Room bulunamadı:', roomId);
        return;
      }

      const consultant = await User.findByPk(consultantId);
      if (!consultant) {
        logger.error('Danışman bulunamadı:', consultantId);
        return;
      }

      // Sadece başvuru sahibine bildir
      if (room.application.user && room.application.user.id !== consultantId) {
        const notification = {
          userId: room.application.user.id,
          type: 'consultant_note',
          title: 'Danışman Notu Eklendi',
          message: `${consultant.firstName} ${consultant.lastName} size bir not ekledi: "${noteContent.substring(0, 50)}${noteContent.length > 50 ? '...' : ''}"`,
          data: {
            roomId: roomId,
            applicationId: room.applicationId,
            consultantId: consultantId,
            consultantName: `${consultant.firstName} ${consultant.lastName}`,
            noteContent: noteContent,
            roomName: room.roomName
          },
          isRead: false
        };

        await Notification.create(notification);
        logger.info('Danışman notu bildirimi gönderildi');
      }

    } catch (error) {
      logger.error('Danışman notu bildirimi gönderme hatası:', error);
    }
  }

  /**
   * Kullanıcının okunmamış bildirimlerini getir
   */
  static async getUnreadNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.findAll({
        where: {
          userId: userId,
          isRead: false
        },
        order: [['createdAt', 'DESC']],
        limit: limit
      });

      return notifications;
    } catch (error) {
      logger.error('Okunmamış bildirimler getirme hatası:', error);
      return [];
    }
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          userId: userId
        }
      });

      if (notification) {
        await notification.update({ isRead: true });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Bildirim okundu işaretleme hatası:', error);
      return false;
    }
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  static async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true },
        {
          where: {
            userId: userId,
            isRead: false
          }
        }
      );

      return true;
    } catch (error) {
      logger.error('Tüm bildirimler okundu işaretleme hatası:', error);
      return false;
    }
  }
}

module.exports = NotificationService;