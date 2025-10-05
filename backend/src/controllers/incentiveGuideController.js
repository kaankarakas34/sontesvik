const { IncentiveGuide, Incentive, User } = require('../models');
const { Op } = require('sequelize');

// Get incentive guide by incentive ID
const getIncentiveGuide = async (req, res) => {
  try {
    const { incentiveId } = req.params;

    const guide = await IncentiveGuide.findOne({
      where: { incentiveId, isActive: true },
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description', 'status']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik klavuzu bulunamadı'
      });
    }

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error('Error fetching incentive guide:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzu getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Get all active incentive guides
const getAllIncentiveGuides = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isActive: true };
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: guides } = await IncentiveGuide.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description', 'incentive_type', 'max_amount', 'min_amount']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        guides,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching incentive guides:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzları getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Create new incentive guide (Admin only)
const createIncentiveGuide = async (req, res) => {
  try {
    const {
      incentiveId,
      title,
      content,
      regulations,
      requiredDocuments,
      applicationSteps,
      eligibilityCriteria,
      deadlines,
      contactInfo,
      faqs
    } = req.body;

    // Check if incentive exists
    const incentive = await Incentive.findByPk(incentiveId);
    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    // Check if guide already exists for this incentive
    const existingGuide = await IncentiveGuide.findOne({
      where: { incentiveId }
    });
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: 'Bu teşvik için zaten bir klavuz mevcut'
      });
    }

    const guide = await IncentiveGuide.create({
      incentiveId,
      title,
      content,
      regulations,
      requiredDocuments: requiredDocuments || [],
      applicationSteps: applicationSteps || [],
      eligibilityCriteria: eligibilityCriteria || {},
      deadlines: deadlines || {},
      contactInfo: contactInfo || {},
      faqs: faqs || [],
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    const createdGuide = await IncentiveGuide.findByPk(guide.id, {
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Teşvik klavuzu başarıyla oluşturuldu',
      data: createdGuide
    });
  } catch (error) {
    console.error('Error creating incentive guide:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzu oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Update incentive guide (Admin only)
const updateIncentiveGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const guide = await IncentiveGuide.findByPk(id);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik klavuzu bulunamadı'
      });
    }

    // Create new version if guide is published
    let updatedGuide;
    if (guide.publishedAt) {
      updatedGuide = await guide.createNewVersion({
        ...updateData,
        updatedBy: req.user.id
      });
    } else {
      await guide.update({
        ...updateData,
        updatedBy: req.user.id
      });
      updatedGuide = guide;
    }

    const result = await IncentiveGuide.findByPk(updatedGuide.id, {
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Teşvik klavuzu başarıyla güncellendi',
      data: result
    });
  } catch (error) {
    console.error('Error updating incentive guide:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzu güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Publish incentive guide (Admin only)
const publishIncentiveGuide = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await IncentiveGuide.findByPk(id);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik klavuzu bulunamadı'
      });
    }

    await guide.publish();

    res.json({
      success: true,
      message: 'Teşvik klavuzu başarıyla yayınlandı',
      data: guide
    });
  } catch (error) {
    console.error('Error publishing incentive guide:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzu yayınlanırken bir hata oluştu',
      error: error.message
    });
  }
};

// Unpublish incentive guide (Admin only)
const unpublishIncentiveGuide = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await IncentiveGuide.findByPk(id);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik klavuzu bulunamadı'
      });
    }

    await guide.unpublish();

    res.json({
      success: true,
      message: 'Teşvik klavuzu yayından kaldırıldı',
      data: guide
    });
  } catch (error) {
    console.error('Error unpublishing incentive guide:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzu yayından kaldırılırken bir hata oluştu',
      error: error.message
    });
  }
};

// Delete incentive guide (Admin only)
const deleteIncentiveGuide = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await IncentiveGuide.findByPk(id);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik klavuzu bulunamadı'
      });
    }

    await guide.destroy();

    res.json({
      success: true,
      message: 'Teşvik klavuzu başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting incentive guide:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik klavuzu silinirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getIncentiveGuide,
  getAllIncentiveGuides,
  createIncentiveGuide,
  updateIncentiveGuide,
  publishIncentiveGuide,
  unpublishIncentiveGuide,
  deleteIncentiveGuide
};