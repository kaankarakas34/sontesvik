const { Application, ApplicationRoom, User, Incentive, IncentiveGuide } = require('../models');
const ApplicationRoomService = require('./applicationRoomService');
const { v4: uuidv4 } = require('uuid');

class MultiIncentiveApplicationService {
  /**
   * Çoklu teşvikler için tek bir başvuru ve room oluştur
   * @param {Object} params - Parametreler
   * @param {string} params.userId - Kullanıcı ID
   * @param {string[]} params.incentiveIds - Seçilen teşvik ID'leri
   * @param {Object} params.applicationData - Başvuru verileri
   */
  static async createMultiIncentiveApplication({ userId, incentiveIds, applicationData }) {
    const transaction = await Application.sequelize.transaction();
    
    try {
      console.log(`🚀 Çoklu teşvik başvurusu oluşturuluyor - Kullanıcı: ${userId}, Teşvikler: ${incentiveIds.length} adet`);

      // 1. Kullanıcı bilgilerini al
      const user = await User.findByPk(userId, {
        include: ['sector'],
        transaction
      });

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // 2. Teşvik bilgilerini al
      const incentives = await Incentive.findAll({
        where: { id: incentiveIds },
        include: [
          { model: IncentiveGuide, as: 'guide' }
        ],
        transaction
      });

      if (incentives.length !== incentiveIds.length) {
        throw new Error('Bazı teşvikler bulunamadı');
      }

      // 3. Tek bir başvuru oluştur (çoklu teşvik başvurusu)
      const combinedTitle = `${user.companyName || user.firstName} - Çoklu Teşvik Başvurusu`;
      const combinedDescription = `${user.firstName} ${user.lastName} tarafından ${incentives.length} adet teşvik için oluşturulan çoklu başvuru. Teşvikler: ${incentives.map(i => i.title).join(', ')}`;
      
      // Toplam maksimum tutarı hesapla
      const totalMaxAmount = incentives.reduce((sum, incentive) => {
        return sum + (parseFloat(incentive.maxAmount) || 100000);
      }, 0);

      const application = await Application.create({
        ...applicationData,
        id: uuidv4(),
        userId,
        incentiveId: null, // Çoklu teşvik olduğu için tek teşvik ID'si yok
        projectTitle: combinedTitle,
        projectDescription: combinedDescription,
        requestedAmount: totalMaxAmount,
        currency: 'TRY',
        priority: 'high', // Çoklu teşvik olduğu için yüksek öncelik
        status: 'submitted',
        applicationNumber: this.generateApplicationNumber(),
        metadata: {
          type: 'multi_incentive',
          incentiveCount: incentives.length,
          incentiveIds: incentiveIds,
          incentiveTitles: incentives.map(i => i.title),
          combinedApplication: true
        }
      }, { transaction });

      console.log(`✅ Çoklu başvuru oluşturuldu: ${application.id}`);

      // 4. ApplicationRoom oluştur
      const roomName = `${user.companyName || user.firstName} - Çoklu Teşvik Odası`;
      const roomDescription = `${incentives.length} adet teşvik için oluşturulan başvuru odası`;

      const room = await ApplicationRoom.create({
        applicationId: application.id,
        roomName,
        roomDescription,
        status: 'active',
        priority: 'high',
        lastActivityAt: new Date(),
        consultantNotes: `${incentives.length} adet teşvik için çoklu başvuru oluşturuldu.`,
        settings: {
          allowFileUpload: true,
          allowMessaging: true,
          autoNotifications: true,
          maxFileSize: 10485760,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'],
          multiIncentiveMode: true,
          incentiveIds: incentiveIds,
          incentiveCount: incentives.length
        },
        stats: {
          messageCount: 0,
          documentCount: 0,
          lastMessageAt: null,
          consultantResponseTime: null
        }
      }, { transaction });

      console.log(`✅ Room oluşturuldu: ${room.id}`);

      // 5. Danışman ataması yap
      let assignmentResult = null;
      if (user.sectorId) {
        try {
          const ConsultantAssignmentService = require('./consultantAssignmentService');
          assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
            application.id,
            user.sectorId
          );

          if (assignmentResult.success) {
            await room.update({
              priority: 'urgent',
              consultantNotes: `${incentives.length} adet teşvik için çoklu başvuru. Danışman atandı: ${assignmentResult.consultantName}`
            }, { transaction });

            console.log(`✅ Danışman atandı: ${assignmentResult.consultantName}`);
          }
        } catch (assignmentError) {
          console.warn('⚠️ Danışman ataması başarısız:', assignmentError.message);
        }
      }

      // 6. Hoş geldin mesajı gönder
      await this.sendMultiIncentiveWelcomeMessage(room.id, user, incentives, assignmentResult, transaction);

      await transaction.commit();

      console.log(`🎉 Çoklu teşvik başvurusu tamamlandı - Başvuru: ${application.id}, Room: ${room.id}`);

      return {
        success: true,
        application,
        room,
        incentives,
        assignment: assignmentResult,
        message: `${incentives.length} adet teşvik için başvuru oluşturuldu ve room oluşturuldu`
      };

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Çoklu teşvik başvurusu hatası:', error);
      throw error;
    }
  }

  /**
   * Çoklu teşvik hoş geldin mesajı gönder
   */
  static async sendMultiIncentiveWelcomeMessage(roomId, user, incentives, assignmentResult, transaction) {
    try {
      const ApplicationMessage = require('../models').ApplicationMessage;
      
      let welcomeMessage = `Merhaba ${user.firstName} ${user.lastName},\n\n`;
      welcomeMessage += `🎉 Çoklu teşvik başvuru odanız başarıyla oluşturuldu!\n\n`;
      welcomeMessage += `📋 **Seçtiğiniz Teşvikler (${incentives.length} adet):**\n`;
      
      incentives.forEach((incentive, index) => {
        welcomeMessage += `${index + 1}. **${incentive.title}**\n`;
        if (incentive.shortDescription) {
          welcomeMessage += `   ${incentive.shortDescription}\n`;
        }
        if (incentive.maxAmount) {
          welcomeMessage += `   Maksimum destek: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(incentive.maxAmount)}\n`;
        }
        welcomeMessage += `\n`;
      });

      welcomeMessage += `🔧 **Bu odada yapabilecekleriniz:**\n`;
      welcomeMessage += `• Tüm teşviklerin kılavuzlarını tablar halinde inceleyebilirsiniz\n`;
      welcomeMessage += `• Gerekli belgeleri yükleyebilirsiniz\n`;
      welcomeMessage += `• Danışmanınızla iletişim kurabilirsiniz\n`;
      welcomeMessage += `• Başvuru sürecinizi takip edebilirsiniz\n\n`;

      if (assignmentResult?.success) {
        welcomeMessage += `👨‍💼 **Danışmanınız:** ${assignmentResult.consultantName}\n`;
        welcomeMessage += `Danışmanınız en kısa sürede sizinle iletişime geçecektir.\n\n`;
      } else {
        welcomeMessage += `⏳ **Danışman Ataması:** Danışman ataması yapılmaktadır. Atama tamamlandığında bilgilendirileceksiniz.\n\n`;
      }

      welcomeMessage += `💡 **İpuçları:**\n`;
      welcomeMessage += `• Lütfen tüm gerekli belgeleri eksiksiz yükleyin\n`;
      welcomeMessage += `• Her teşvikin kılavuzunu dikkatlice okuyun\n`;
      welcomeMessage += `• Sorularınızı danışmanınıza sorabilirsiniz\n\n`;

      welcomeMessage += `İyi çalışmalar dileriz! 🚀`;

      // Sistem mesajı olarak kaydet
      await ApplicationMessage.create({
        applicationId: room.applicationId,
        senderId: null, // Sistem mesajı
        receiverId: user.id,
        subject: '🎉 Çoklu Teşvik Başvurunuz Hazır!',
        message: welcomeMessage,
        messageType: 'system',
        priority: 'high',
        status: 'sent',
        isRead: false,
        metadata: {
          type: 'multi_incentive_welcome',
          incentiveCount: incentives.length,
          roomId: roomId
        }
      }, { transaction });

      console.log(`✅ Çoklu teşvik hoş geldin mesajı gönderildi`);

    } catch (error) {
      console.error('❌ Hoş geldin mesajı gönderilemedi:', error);
      // Bu hata kritik değil, devam et
    }
  }

  /**
   * Başvuru numarası üret
   */
  static generateApplicationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MULTI-${year}${month}${day}-${random}`;
  }
}

module.exports = MultiIncentiveApplicationService;