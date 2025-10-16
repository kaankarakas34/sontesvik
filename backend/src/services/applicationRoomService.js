const { ApplicationRoom, Application, User, ApplicationMessage, Document } = require('../models');
const ConsultantAssignmentService = require('./consultantAssignmentService');
const { Op } = require('sequelize');

class ApplicationRoomService {
  /**
   * Başvuru oluşturulduğunda otomatik room oluştur ve danışman ata
   */
  static async createRoomForApplication(applicationId, userId) {
    const transaction = await ApplicationRoom.sequelize.transaction();
    
    try {
      console.log(`🏠 Room oluşturuluyor - Başvuru: ${applicationId}, Kullanıcı: ${userId}`);

      // Başvuru bilgilerini al
      const application = await Application.findByPk(applicationId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'sectorId', 'companyName']
          }
        ]
      });

      if (!application) {
        throw new Error('Başvuru bulunamadı');
      }

      // Room adını oluştur
      const roomName = `${application.user.companyName || 'Şirket'} - Başvuru #${application.id}`;
      const roomDescription = `${application.user.firstName} ${application.user.lastName} tarafından oluşturulan başvuru odası`;

      // Room'u oluştur
      const room = await ApplicationRoom.create({
        applicationId: applicationId,
        roomName: roomName,
        roomDescription: roomDescription,
        status: 'active',
        priority: 'medium',
        lastActivityAt: new Date(),
        consultantNotes: '',
        settings: {
          allowFileUpload: true,
          allowMessaging: true,
          autoNotifications: true,
          maxFileSize: 10485760, // 10MB
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xlsx', 'xls']
        },
        stats: {
          messageCount: 0,
          documentCount: 0,
          lastMessageAt: null,
          consultantResponseTime: null
        }
      }, { transaction });

      // Danışman ataması yap
      let assignmentResult = null;
      if (application.user.sectorId) {
        assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
          applicationId,
          application.user.sectorId
        );

        if (assignmentResult.success) {
          // Room priority'sini güncelle - yeni atama yapıldığında önceliği artır
          await room.update({
            priority: 'urgent',
            consultantNotes: `Danışman otomatik atandı: ${assignmentResult.consultantName}`
          }, { transaction });

          console.log(`✅ Room oluşturuldu ve danışman atandı - Room: ${room.id}, Danışman: ${assignmentResult.consultantName}`);
        } else {
          console.log(`⚠️ Room oluşturuldu ancak danışman atanamadı - Room: ${room.id}`);
        }
      }

      // Hoş geldin mesajı gönder
      await this.sendWelcomeMessage(room.id, application.user, assignmentResult, transaction);

      await transaction.commit();

      return {
        success: true,
        room: room,
        assignment: assignmentResult,
        message: assignmentResult?.success ? 
          'Room oluşturuldu ve danışman atandı' : 
          'Room oluşturuldu, danışman ataması bekleniyor'
      };

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Room oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Hoş geldin mesajı gönder
   */
  static async sendWelcomeMessage(roomId, user, assignmentResult, transaction) {
    try {
      const room = await ApplicationRoom.findByPk(roomId);
      
      let welcomeMessage = `Merhaba ${user.firstName} ${user.lastName},\n\n`;
      welcomeMessage += `Başvuru odanız başarıyla oluşturuldu. Bu oda üzerinden:\n`;
      welcomeMessage += `• Belgelerinizi yükleyebilirsiniz\n`;
      welcomeMessage += `• Danışmanınızla iletişim kurabilirsiniz\n`;
      welcomeMessage += `• Başvuru sürecinizi takip edebilirsiniz\n\n`;

      if (assignmentResult?.success) {
        welcomeMessage += `Danışmanınız: ${assignmentResult.consultantName}\n`;
        welcomeMessage += `Danışmanınız en kısa sürede sizinle iletişime geçecektir.\n\n`;
      } else {
        welcomeMessage += `Danışman ataması yapılmaktadır. Atama tamamlandığında bilgilendirileceksiniz.\n\n`;
      }

      welcomeMessage += `İyi çalışmalar dileriz!`;

      // Sistem mesajı olarak kaydet
      await ApplicationMessage.create({
        applicationId: room.applicationId,
        senderId: null, // Sistem mesajı
        receiverId: user.id,
        subject: 'Hoş Geldiniz - Başvuru Odanız Hazır',
        message: welcomeMessage,
        messageType: 'system',
        priority: 'normal',
        status: 'sent',
        isRead: false
      }, { transaction });

      // Room stats güncelle
      await room.update({
        stats: {
          ...room.stats,
          messageCount: 1,
          lastMessageAt: new Date()
        },
        lastActivityAt: new Date()
      }, { transaction });

    } catch (error) {
      console.error('❌ Hoş geldin mesajı gönderme hatası:', error);
      // Bu hata room oluşturmayı engellemez
    }
  }

  /**
   * Room'a danışman atandığında priority güncelle
   */
  static async updateRoomOnConsultantAssignment(applicationId, consultantId, consultantName) {
    try {
      const room = await ApplicationRoom.findOne({
        where: { applicationId }
      });

      if (room) {
        await room.update({
          priority: 'urgent',
          consultantNotes: room.consultantNotes + 
            `\n[${new Date().toLocaleString('tr-TR')}] Danışman atandı: ${consultantName}`,
          lastActivityAt: new Date()
        });

        console.log(`🔥 Room priority URGENT yapıldı - Danışman atama nedeniyle: ${consultantName}`);
      }
    } catch (error) {
      console.error('❌ Room güncelleme hatası:', error);
    }
  }

  /**
   * Room'da yeni mesaj geldiğinde priority ve stats güncelle
   */
  static async updateRoomOnNewMessage(applicationId, messageType = 'user') {
    try {
      const room = await ApplicationRoom.findOne({
        where: { applicationId }
      });

      if (room) {
        const currentStats = room.stats || {};
        
        // Kullanıcıdan gelen mesajsa önceliği artır
        const newPriority = messageType === 'user' ? 'urgent' : room.priority;
        
        await room.update({
          priority: newPriority,
          stats: {
            ...currentStats,
            messageCount: (currentStats.messageCount || 0) + 1,
            lastMessageAt: new Date()
          },
          lastActivityAt: new Date()
        });

        if (messageType === 'user') {
          console.log(`🔥 Room priority URGENT yapıldı - Yeni kullanıcı mesajı nedeniyle`);
        }
      }
    } catch (error) {
      console.error('❌ Room mesaj güncelleme hatası:', error);
    }
  }

  /**
   * Room'da yeni belge yüklendiğinde stats güncelle
   */
  static async updateRoomOnNewDocument(roomId, userId) {
    try {
      const room = await ApplicationRoom.findByPk(roomId);

      if (room) {
        const currentStats = room.stats || {};
        const user = await User.findByPk(userId);
        
        // Kullanıcı türüne göre aktivite güncelle
        const activityUpdate = {};
        if (user.role === 'company') {
          activityUpdate.lastUserActivity = new Date();
        } else if (user.role === 'consultant') {
          activityUpdate.lastConsultantActivity = new Date();
        }
        
        await room.update({
          priority: 'urgent', // Yeni belge yüklendiğinde önceliği artır
          stats: {
            ...currentStats,
            totalDocuments: (currentStats.totalDocuments || 0) + 1,
            ...activityUpdate
          },
          lastActivityAt: new Date()
        });

        console.log(`🔥 Room priority URGENT yapıldı - Yeni belge yükleme nedeniyle (${user.role})`);
        
        // Belge yükleme sonrası room durumunu güncelle
        if (user.role === 'company' && room.status === 'waiting_documents') {
          await room.update({ status: 'under_review' });
          console.log(`📋 Room durumu 'under_review' olarak güncellendi`);
        }
      }
    } catch (error) {
      console.error('❌ Room belge güncelleme hatası:', error);
    }
  }

  /**
   * Room priority'sini manuel güncelle
   */
  static async updateRoomPriority(roomId, priority, consultantId, reason = '') {
    try {
      const room = await ApplicationRoom.findByPk(roomId);
      
      if (!room) {
        throw new Error('Room bulunamadı');
      }

      const consultant = await User.findByPk(consultantId);
      const consultantName = consultant ? `${consultant.firstName} ${consultant.lastName}` : 'Bilinmeyen';

      const noteEntry = `\n[${new Date().toLocaleString('tr-TR')}] Priority ${room.priority} -> ${priority} (${consultantName}): ${reason}`;

      await room.update({
        priority: priority,
        consultantNotes: room.consultantNotes + noteEntry,
        lastActivityAt: new Date()
      });

      return {
        success: true,
        message: 'Room priority başarıyla güncellendi'
      };

    } catch (error) {
      console.error('❌ Room priority güncelleme hatası:', error);
      return {
        success: false,
        message: 'Priority güncellenemedi',
        error: error.message
      };
    }
  }

  /**
   * Başvuru durumu değiştiğinde room durumunu güncelle
   */
  static async updateRoomOnApplicationStatusChange(applicationId, newStatus, consultantId = null) {
    try {
      const room = await ApplicationRoom.findOne({
        where: { applicationId }
      });

      if (!room) {
        console.log(`Room not found for application ${applicationId}`);
        return null;
      }

      // Application status'una göre room status'unu belirle
      let roomStatus = room.status;
      let priority = room.priority;

      switch (newStatus) {
        case 'submitted':
          roomStatus = 'waiting_documents';
          priority = 'medium';
          break;
        case 'under_review':
          roomStatus = 'under_review';
          priority = 'high';
          break;
        case 'additional_info_required':
          roomStatus = 'additional_info_required';
          priority = 'urgent';
          break;
        case 'approved':
          roomStatus = 'approved';
          priority = 'low';
          break;
        case 'rejected':
          roomStatus = 'rejected';
          priority = 'low';
          break;
        case 'completed':
          roomStatus = 'completed';
          priority = 'low';
          break;
        case 'cancelled':
          roomStatus = 'archived';
          priority = 'low';
          break;
      }

      // Room'u güncelle
      await room.update({
        status: roomStatus,
        priority: priority,
        lastActivityAt: new Date(),
        consultantNotes: consultantId ? `Status updated by consultant to ${newStatus}` : room.consultantNotes
      });

      console.log(`Room ${room.id} status updated to ${roomStatus} for application ${applicationId}`);
      return room;

    } catch (error) {
      console.error('Error updating room on application status change:', error);
      throw error;
    }
  }

  /**
   * Danışman için HOT priority room'ları getir
   */
  static async getHotPriorityRooms(consultantId, limit = 10) {
    try {
      const rooms = await ApplicationRoom.findAll({
        include: [
          {
            model: Application,
            as: 'application',
            where: {
              assignedConsultantId: consultantId
            },
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'companyName']
              }
            ]
          }
        ],
        where: {
          priority: 'urgent',
          status: 'active'
        },
        order: [['lastActivityAt', 'DESC']],
        limit: limit
      });

      return rooms;

    } catch (error) {
      console.error('HOT priority roomlar getirilirken hata:', error);
      return [];
    }
  }
}

module.exports = ApplicationRoomService;