const MultiIncentiveApplicationService = require('../services/multiIncentiveApplicationService');
const { Incentive } = require('../models');

/**
 * Çoklu teşvik başvurusu oluştur
 * @route POST /api/multi-incentive-applications
 * @access Private
 */
const createMultiIncentiveApplication = async (req, res) => {
  try {
    const { incentiveIds, projectTitle, projectDescription, requestedAmount, currency, priority } = req.body;
    const userId = req.user.id;
    
    // Create applicationData object from individual fields
    const applicationData = {
      projectTitle,
      projectDescription,
      requestedAmount,
      currency,
      priority
    };

    // Validasyon
    if (!incentiveIds || !Array.isArray(incentiveIds) || incentiveIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'En az bir teşvik seçmelisiniz'
      });
    }

    if (incentiveIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'En fazla 10 teşvik seçebilirsiniz'
      });
    }

    // Teşviklerin varlığını kontrol et
    const incentives = await Incentive.findAll({
      where: { id: incentiveIds },
      attributes: ['id', 'title', 'status']
    });

    if (incentives.length !== incentiveIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Bazı teşvikler bulunamadı'
      });
    }

    // Aktif olmayan teşvikleri kontrol et
    const inactiveIncentives = incentives.filter(i => i.status !== 'active');
    if (inactiveIncentives.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Şu teşvikler şu anda aktif değil: ${inactiveIncentives.map(i => i.title).join(', ')}`
      });
    }

    // Çoklu teşvik başvurusu oluştur
    const result = await MultiIncentiveApplicationService.createMultiIncentiveApplication({
      userId,
      incentiveIds,
      applicationData: applicationData || {}
    });

    res.status(201).json({
      success: true,
      message: `${incentiveIds.length} adet teşvik için başvuru oluşturuldu`,
      data: {
        application: result.application,
        room: result.room,
        incentives: result.incentives,
        assignment: result.assignment
      }
    });

  } catch (error) {
    console.error('Çoklu teşvik başvurusu hatası:', error);
    
    if (error.message.includes('bulunamadı')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Başvuru oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  createMultiIncentiveApplication
};