const { User, Application, /* ConsultantAssignmentLog */ } = require('../models');
const { Op } = require('sequelize');

class ConsultantAssignmentService {
  /**
   * Otomatik danışman atama algoritması
   * Kullanıcının sektörüne göre en az yük altındaki aktif danışmanı otomatik ata
   */
  static async autoAssignConsultant(applicationId, userSectorId) {
    try {
      console.log(`🔍 Otomatik danışman ataması başlatılıyor - Başvuru: ${applicationId}, SektörId: ${userSectorId}`);

      // Uygun danışmanları bul
      const availableConsultants = await this.findAvailableConsultants(userSectorId);
      
      if (availableConsultants.length === 0) {
        console.log('⚠️ Uygun danışman bulunamadı');
        return {
          success: false,
          message: 'Uygun danışman bulunamadı'
        };
      }

      // En az yük altındaki danışmanı seç
      const selectedConsultant = await this.selectBestConsultant(availableConsultants);
      
      // Danışmanı ata
      const assignment = await this.assignConsultantToApplication(
        applicationId, 
        selectedConsultant.id, 
        null, // Otomatik atama olduğu için assignedBy null
        'automatic',
        'Otomatik sektör bazlı atama'
      );

      console.log(`✅ Danışman başarıyla atandı - Danışman: ${selectedConsultant.firstName} ${selectedConsultant.lastName}`);

      return {
        success: true,
        consultantId: selectedConsultant.id,
        consultantName: `${selectedConsultant.firstName} ${selectedConsultant.lastName}`,
        assignmentId: assignment.id
      };

    } catch (error) {
      console.error('❌ Otomatik danışman atama hatası:', error);
      return {
        success: false,
        message: 'Danışman atama işlemi başarısız oldu',
        error: error.message
      };
    }
  }

  /**
   * Uygun danışmanları bul
   */
  static async findAvailableConsultants(sectorId) {
    const consultants = await User.findAll({
      where: {
        role: 'consultant',
        consultantStatus: 'active',
        isApproved: true,
        isActive: true,
        sectorId: sectorId
      },
      include: [
        {
          model: Application,
          as: 'assignedApplications',
          where: {
            status: ['pending', 'under_review', 'additional_info_required']
          },
          required: false
        }
      ],
      order: [['consultantRating', 'DESC']]
    });

    // Kapasite kontrolü
    return consultants.filter(consultant => {
      const activeApplications = consultant.assignedApplications?.length || 0;
      return activeApplications < consultant.maxConcurrentApplications;
    });
  }

  /**
   * En iyi danışmanı seç (eğer birden fazla uygun danışman varsa random seç)
   */
  static async selectBestConsultant(consultants) {
    // Önce aktif başvuru sayısına göre sırala (en az olan önce)
    const consultantsWithLoad = await Promise.all(
      consultants.map(async (consultant) => {
        const activeApplications = await Application.count({
          where: {
            assignedConsultantId: consultant.id,
            status: ['pending', 'under_review', 'additional_info_required']
          }
        });

        return {
          ...consultant.toJSON(),
          activeApplications,
          loadPercentage: (activeApplications / consultant.maxConcurrentApplications) * 100
        };
      })
    );

    // Yük yüzdesine göre sırala (en düşük önce), sonra puana göre
    const ordered = consultantsWithLoad
      .sort((a, b) => {
        if (a.loadPercentage !== b.loadPercentage) {
          return a.loadPercentage - b.loadPercentage;
        }
        return b.consultantRating - a.consultantRating;
      })
      .map(c => consultants.find(con => con.id === c.id));

    // Eğer birden fazla danışman varsa, en iyi 3 arasından random seç
    if (ordered.length > 1) {
      const topConsultants = ordered.slice(0, Math.min(3, ordered.length));
      const randomIndex = Math.floor(Math.random() * topConsultants.length);
      console.log(`🎲 Birden fazla uygun danışman bulundu, random seçim yapılıyor. Toplam: ${ordered.length}, Seçilen: ${randomIndex + 1}. sıradaki danışman`);
      return topConsultants[randomIndex];
    }

    // Tek danışman varsa onu döndür
    return ordered[0];
  }

  /**
   * Manuel danışman atama
   */
  static async manualAssignConsultant(applicationId, consultantId, assignedBy, reason = '') {
    try {
      console.log(`🔍 Manuel danışman ataması - Başvuru: ${applicationId}, Danışman: ${consultantId}`);

      // Danışman kontrolü
      const consultant = await User.findOne({
        where: {
          id: consultantId,
          role: 'consultant',
          consultantStatus: 'active',
          isApproved: true,
          isActive: true
        }
      });

      if (!consultant) {
        return {
          success: false,
          message: 'Geçerli danışman bulunamadı'
        };
      }

      // Mevcut atamayı kontrol et
      const application = await Application.findByPk(applicationId);
      if (!application) {
        return {
          success: false,
          message: 'Başvuru bulunamadı'
        };
      }

      const previousConsultantId = application.assignedConsultantId;

      // Danışmanı ata
      const assignment = await this.assignConsultantToApplication(
        applicationId,
        consultantId,
        assignedBy,
        'manual',
        reason,
        previousConsultantId
      );

      console.log(`✅ Manuel danışman ataması başarılı`);

      return {
        success: true,
        consultantId: consultant.id,
        consultantName: `${consultant.firstName} ${consultant.lastName}`,
        assignmentId: assignment.id,
        previousConsultantId
      };

    } catch (error) {
      console.error('❌ Manuel danışman atama hatası:', error);
      return {
        success: false,
        message: 'Manuel danışman atama işlemi başarısız oldu',
        error: error.message
      };
    }
  }

  /**
   * Danışman ataması yap
   */
  static async assignConsultantToApplication(applicationId, consultantId, assignedBy, assignmentType, reason = '', previousConsultantId = null) {
    const transaction = await Application.sequelize.transaction();

    try {
      // Application'ı güncelle
      await Application.update(
        {
          assignedConsultantId: consultantId,
          consultantAssignedAt: new Date(),
          consultantAssignmentType: assignmentType
        },
        {
          where: { id: applicationId },
          transaction
        }
      );

      // Atama logunu oluştur - geçici olarak devre dışı
      // const assignmentLog = await ConsultantAssignmentLog.create({
      //   applicationId,
      //   consultantId,
      //   assignedBy,
      //   assignmentType,
      //   reason,
      //   sector: 'by_sector_id',
      //   previousConsultantId,
      //   unassignedAt: null,
      //   unassignedBy: null,
      //   unassignmentReason: null
      // }, { transaction });

      await transaction.commit();
      
      // assignmentLog undefined olduğu için basit bir obje döndür
      return {
        id: `assignment_${Date.now()}`,
        applicationId,
        consultantId,
        assignedBy,
        assignmentType,
        createdAt: new Date()
      };

    } catch (error) {
      // Transaction durumunu kontrol et
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Danışman atamasını kaldır
   */
  static async unassignConsultant(applicationId, unassignedBy, unassignmentReason = '') {
    const transaction = await Application.sequelize.transaction();

    try {
      const application = await Application.findByPk(applicationId);
      if (!application || !application.assignedConsultantId) {
        return {
          success: false,
          message: 'Atanmış danışman bulunamadı'
        };
      }

      const consultantId = application.assignedConsultantId;

      // Aktif atama logunu bul ve güncelle - geçici olarak devre dışı
      // await ConsultantAssignmentLog.update(
      //   {
      //     unassignedAt: new Date(),
      //     unassignedBy,
      //     unassignmentReason
      //   },
      //   {
      //     where: {
      //       applicationId,
      //       consultantId,
      //       unassignedAt: null
      //     },
      //     transaction
      //   }
      // );

      // Application'ı güncelle
      await Application.update(
        {
          assignedConsultantId: null,
          consultantAssignedAt: null,
          consultantAssignmentType: null
        },
        {
          where: { id: applicationId },
          transaction
        }
      );

      await transaction.commit();

      return {
        success: true,
        message: 'Danışman ataması başarıyla kaldırıldı',
        consultantId
      };

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Danışman ataması kaldırma hatası:', error);
      return {
        success: false,
        message: 'Danışman ataması kaldırılamadı',
        error: error.message
      };
    }
  }

  /**
   * Danışman istatistiklerini al
   */
  static async getConsultantStats(consultantId) {
    try {
      const consultant = await User.findByPk(consultantId, {
        include: [
          {
            model: Application,
            as: 'assignedApplications',
            include: ['user']
          }
          // {
          //   model: ConsultantAssignmentLog,
          //   as: 'assignmentLogs'
          // }
        ]
      });

      if (!consultant || !consultant.isConsultant()) {
        return {
          success: false,
          message: 'Danışman bulunamadı'
        };
      }

      const totalAssignments = 0; // consultant.assignmentLogs?.length || 0;
      const activeAssignments = consultant.assignedApplications?.filter(app => 
        ['pending', 'under_review', 'additional_info_required'].includes(app.status)
      ).length || 0;

      const completedAssignments = consultant.assignedApplications?.filter(app => 
        ['approved', 'rejected'].includes(app.status)
      ).length || 0;

      const avgAssignmentDuration = await this.calculateAverageAssignmentDuration(consultantId);

      return {
        success: true,
        stats: {
          totalAssignments,
          activeAssignments,
          completedAssignments,
          averageRating: consultant.consultantRating || 0,
          reviewCount: consultant.consultantReviewCount || 0,
          averageAssignmentDuration: avgAssignmentDuration,
          loadPercentage: (activeAssignments / consultant.maxConcurrentApplications) * 100,
          status: consultant.consultantStatus
        }
      };

    } catch (error) {
      console.error('❌ Danışman istatistikleri alma hatası:', error);
      return {
        success: false,
        message: 'İstatistikler alınamadı',
        error: error.message
      };
    }
  }

  /**
   * Ortalama atama süresini hesapla
   */
  static async calculateAverageAssignmentDuration(consultantId) {
    // Geçici olarak devre dışı
    // const assignmentLogs = await ConsultantAssignmentLog.findAll({
    //   where: {
    //     consultantId,
    //     unassignedAt: { [Op.not]: null }
    //   }
    // });

    // if (assignmentLogs.length === 0) return 0;

    // const totalDuration = assignmentLogs.reduce((sum, log) => {
    //   return sum + (new Date(log.unassignedAt) - new Date(log.createdAt));
    // }, 0);

    // return Math.round(totalDuration / assignmentLogs.length / (1000 * 60 * 60)); // Saat cinsinden
    return 0; // Geçici olarak 0 döndür
  }
}

module.exports = ConsultantAssignmentService;