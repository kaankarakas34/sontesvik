const { Application, User, ConsultantAssignmentLog, ConsultantReview } = require('../models');
const ConsultantAssignmentService = require('../services/consultantAssignmentService');
const ApplicationRoomService = require('../services/applicationRoomService');
const { Op } = require('sequelize');

class ConsultantController {
  /**
   * Tüm danışmanları listele (Admin için)
   */
  static async getAllConsultants(req, res) {
    try {
      const { page = 1, limit = 10, sector, status, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        role: 'consultant'
      };

      if (sector) whereClause.sector = sector;
      if (status) whereClause.consultantStatus = status;
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const consultants = await User.findAndCountAll({
        where: whereClause,
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
        attributes: {
          exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires']
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Danışman yüklerini hesapla
      const consultantsWithLoad = consultants.rows.map(consultant => {
        const consultantData = consultant.toJSON();
        const activeApplications = consultantData.assignedApplications?.length || 0;
        
        return {
          ...consultantData,
          activeApplications,
          loadPercentage: (activeApplications / consultantData.maxConcurrentApplications) * 100,
          canAcceptMore: activeApplications < consultantData.maxConcurrentApplications
        };
      });

      res.json({
        success: true,
        data: {
          consultants: consultantsWithLoad,
          pagination: {
            total: consultants.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(consultants.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Danışman listeleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Danışmanlar listelenemedi',
        error: error.message
      });
    }
  }

  /**
   * Danışman dashboard verilerini getir
   */
  static async getConsultantDashboard(req, res) {
    try {
      const consultantId = req.user.id;

      // Danışman bilgilerini getir
      const consultant = await User.findByPk(consultantId, {
        attributes: {
          exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires']
        }
      });

      if (!consultant || !consultant.isConsultant()) {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için yetkiniz yok'
        });
      }

      // Atanmış başvuruları getir
      const assignedApplications = await Application.findAll({
        where: { assignedConsultantId: consultantId },
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'user', attributes: ['id','firstName','lastName','email','companyName'] },
          { model: require('../models').Incentive, as: 'incentive', attributes: ['id','title','description'] }
        ]
      });

      // Danışman değerlendirmelerini getir - şimdilik boş array döndür  
      const consultantReviews = [];

      if (!consultant || !consultant.isConsultant()) {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için yetkiniz yok'
        });
      }

      // İstatistikleri hesapla
      const applications = assignedApplications || [];
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        underReviewApplications: applications.filter(app => app.status === 'under_review').length,
        approvedApplications: applications.filter(app => app.status === 'approved').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
        averageRating: consultant.consultantRating || 0,
        reviewCount: consultant.consultantReviewCount || 0,
        loadPercentage: (applications.filter(app => ['pending', 'under_review'].includes(app.status)).length / consultant.maxConcurrentApplications) * 100
      };

      // Son 7 gün için başvuru trendi
      const last7Days = await ConsultantController.getLast7DaysStats(consultantId);

      // Aktif başvurular (son 30 gün)
      const activeApplications = applications.filter(app => {
        const appDate = new Date(app.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return appDate >= thirtyDaysAgo;
      }).slice(0, 10); // İlk 10'u göster

      res.json({
        success: true,
        data: {
          assignedApplications: applications,
          stats,
          weeklyStats: last7Days,
          recentReviews: consultantReviews,
          consultant: consultant.toJSON(),
        }
      });

    } catch (error) {
      console.error('❌ Danışman dashboard hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Dashboard verileri alınamadı',
        error: error.message
      });
    }
  }

  /**
   * Son 7 gün için istatistikler
   */
  static async getLast7DaysStats(consultantId) {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayStats = await Application.findAll({
        where: {
          assignedConsultantId: consultantId,
          createdAt: {
            [Op.between]: [date, nextDate]
          }
        },
        attributes: ['status']
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        total: dayStats.length,
        pending: dayStats.filter(s => s.status === 'pending').length,
        underReview: dayStats.filter(s => s.status === 'under_review').length,
        approved: dayStats.filter(s => s.status === 'approved').length,
        rejected: dayStats.filter(s => s.status === 'rejected').length
      });
    }

    return last7Days;
  }

  /**
   * Danışmanın atanan başvurularını getir
   */
  static async getAssignedApplications(req, res) {
    try {
      const consultantId = req.user.id;
      const { status, page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        assignedConsultantId: consultantId
      };

      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { applicationNumber: { [Op.iLike]: `%${search}%` } },
          { projectTitle: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const applications = await Application.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'sector', 'phone']
          },
          {
            model: require('../models/Incentive'),
            as: 'incentive'
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Basic logging for debugging incoming/outgoing data
      try {
        console.log('👤 Consultant assigned applications fetched', {
          consultantId,
          query: { status, page: Number(page), limit: Number(limit), search: search || null },
          total: applications.count,
          applicationIds: applications.rows.map(a => a.id)
        });
      } catch (_) { /* no-op */ }

      res.json({
        success: true,
        data: {
          applications: applications.rows,
          pagination: {
            total: applications.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(applications.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Atanmış başvurular getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Başvurular getirilemedi',
        error: error.message
      });
    }
  }

  /**
   * Başvuru detaylarını getir
   */
  static async getApplicationDetails(req, res) {
    try {
      const { applicationId } = req.params;
      const consultantId = req.user.id;

      const application = await Application.findOne({
        where: {
          id: applicationId,
          assignedConsultantId: consultantId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'sector', 'phone', 'address']
          },
          {
            model: require('../models/Incentive'),
            as: 'incentive'
          },
          {
            model: require('../models/Document'),
            as: 'documents'
          }
        ]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Başvuru bulunamadı veya size atanmamış'
        });
      }

      res.json({
        success: true,
        data: { application }
      });

    } catch (error) {
      console.error('❌ Başvuru detayı getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Başvuru detayı getirilemedi',
        error: error.message
      });
    }
  }

  /**
   * Başvuru durumunu güncelle
   */
  static async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, consultantNotes, consultantRating, consultantReview } = req.body;
      const consultantId = req.user.id;

      const application = await Application.findOne({
        where: {
          id: applicationId,
          assignedConsultantId: consultantId
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Başvuru bulunamadı veya size atanmamış'
        });
      }

      // Durum geçişlerini kontrol et
      const validTransitions = {
        'pending': ['under_review', 'additional_info_required'],
        'under_review': ['approved', 'rejected', 'additional_info_required'],
        'additional_info_required': ['under_review']
      };

      if (!validTransitions[application.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Geçersiz durum geçişi: ${application.status} -> ${status}`
        });
      }

      const updateData = {
        status,
        consultantNotes: consultantNotes || application.consultantNotes,
        consultantRating: consultantRating || application.consultantRating,
        consultantReview: consultantReview || application.consultantReview
      };

      // Duruma göre tarih alanlarını güncelle
      if (status === 'under_review') {
        updateData.reviewedAt = new Date();
        updateData.reviewedBy = consultantId;
      } else if (status === 'approved') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = consultantId;
      } else if (status === 'rejected') {
        updateData.rejectedAt = new Date();
      }

      await application.update(updateData);

      // Room durumunu da güncelle
      await ApplicationRoomService.updateRoomOnApplicationStatusChange(
        applicationId, 
        status, 
        consultantId
      );

      res.json({
        success: true,
        message: 'Başvuru durumu başarıyla güncellendi',
        data: { application }
      });

    } catch (error) {
      console.error('❌ Başvuru durumu güncelleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Başvuru durumu güncellenemedi',
        error: error.message
      });
    }
  }

  /**
   * Danışman performans istatistikleri
   */
  static async getConsultantPerformance(req, res) {
    try {
      const { consultantId } = req.params;
      const { startDate, endDate } = req.query;

      // Sadece admin ve danışman kendisi görebilir
      if (req.user.role !== 'admin' && req.user.id !== consultantId) {
        return res.status(403).json({
          success: false,
          message: 'Bu verileri görme yetkiniz yok'
        });
      }

      const stats = await ConsultantAssignmentService.getConsultantStats(consultantId);
      
      if (!stats.success) {
        return res.status(404).json({
          success: false,
          message: stats.message
        });
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Danışman performans hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Performans verileri alınamadı',
        error: error.message
      });
    }
  }

  /**
   * Yeni danışman oluştur (Admin için)
   */
  static async createConsultant(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için admin yetkisi gerekli'
        });
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        sector,
        consultantBio,
        consultantSpecializations,
        maxConcurrentApplications = 10
      } = req.body;

      // Email kontrolü
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu email adresi zaten kullanımda'
        });
      }

      // Geçici şifre oluştur
      const tempPassword = Math.random().toString(36).slice(-8);

      const consultant = await User.create({
        firstName,
        lastName,
        email,
        password: tempPassword,
        phone,
        role: 'consultant',
        sector,
        consultantBio,
        consultantSpecializations: consultantSpecializations || [],
        maxConcurrentApplications,
        isApproved: true,
        isActive: true,
        consultantStatus: 'active',
        assignedBy: req.user.id,
        assignedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Danışman başarıyla oluşturuldu',
        data: {
          consultant: {
            id: consultant.id,
            firstName: consultant.firstName,
            lastName: consultant.lastName,
            email: consultant.email,
            tempPassword // İlk giriş için geçici şifre
          }
        }
      });

    } catch (error) {
      console.error('❌ Danışman oluşturma hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Danışman oluşturulamadı',
        error: error.message
      });
    }
  }
}

module.exports = ConsultantController;