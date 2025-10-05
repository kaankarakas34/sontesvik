const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConsultantReview = sequelize.define('ConsultantReview', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    consultantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consultant_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'reviewer_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    communicationRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'communication_rating',
      validate: {
        min: 1,
        max: 5
      }
    },
    expertiseRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'expertise_rating',
      validate: {
        min: 1,
        max: 5
      }
    },
    timelinessRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'timeliness_rating',
      validate: {
        min: 1,
        max: 5
      }
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_anonymous'
    },
    helpfulVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'helpful_votes'
    },
    totalVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_votes'
    }
  }, {
    tableName: 'consultant_reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['application_id', 'reviewer_id']
      },
      {
        fields: ['consultant_id']
      },
      {
        fields: ['reviewer_id']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Instance methods
  ConsultantReview.prototype.getAverageRating = function() {
    const ratings = [this.rating];
    if (this.communicationRating) ratings.push(this.communicationRating);
    if (this.expertiseRating) ratings.push(this.expertiseRating);
    if (this.timelinessRating) ratings.push(this.timelinessRating);
    
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  ConsultantReview.prototype.getHelpfulnessPercentage = function() {
    if (this.totalVotes === 0) return 0;
    return Math.round((this.helpfulVotes / this.totalVotes) * 100);
  };

  // Class methods
  ConsultantReview.findByConsultant = function(consultantId, options = {}) {
    return this.findAll({
      where: { consultantId },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  ConsultantReview.findByReviewer = function(reviewerId, options = {}) {
    return this.findAll({
      where: { reviewerId },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  ConsultantReview.getAverageRating = async function(consultantId) {
    const result = await this.findOne({
      where: { consultantId },
      attributes: [
        [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('rating')), 'avg_rating'],
        [sequelize.Sequelize.fn('COUNT', '*'), 'review_count']
      ],
      raw: true
    });

    return {
      averageRating: parseFloat(result.avg_rating) || 0,
      reviewCount: parseInt(result.review_count) || 0
    };
  };

  ConsultantReview.hasReviewed = async function(applicationId, reviewerId) {
    const review = await this.findOne({
      where: {
        applicationId,
        reviewerId
      }
    });
    return !!review;
  };

  // Define associations
  ConsultantReview.associate = function(models) {
    // ConsultantReview belongs to Application
    ConsultantReview.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });

    // ConsultantReview belongs to Consultant (User)
    ConsultantReview.belongsTo(models.User, {
      foreignKey: 'consultantId',
      as: 'consultant'
    });

    // ConsultantReview belongs to Reviewer (User)
    ConsultantReview.belongsTo(models.User, {
      foreignKey: 'reviewerId',
      as: 'reviewer'
    });
  };

  return ConsultantReview;
};