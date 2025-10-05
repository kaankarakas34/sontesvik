const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IncentiveCategory = sequelize.define('IncentiveCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Category name is required' },
        len: {
          args: [2, 100],
          msg: 'Category name must be between 2 and 100 characters'
        }
      }
    },
    nameEn: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'nameEn',
      validate: {
        len: {
          args: [0, 100],
          msg: 'English name cannot exceed 100 characters'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Slug is required' },
        is: {
          args: /^[a-z0-9-]+$/,
          msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_en'
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Level must be at least 1'
        },
        max: {
          args: [3],
          msg: 'Level cannot exceed 3'
        }
      }
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Icon class or name for UI display'
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-F]{6}$/i,
          msg: 'Color must be a valid hex color code'
        }
      }
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Category image URL or path'
    },
    incentiveCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional category-specific metadata'
    }
  }, {
    tableName: 'IncentiveCategories',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['level']
      },
      {
        fields: ['sort_order']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_popular']
      },
      {
        fields: ['is_featured']
      },
      {
        fields: ['incentive_count']
      },
      {
        fields: ['view_count']
      }
    ],
    hooks: {
      beforeCreate: (category) => {
        if (!category.slug && category.name) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
      },
      beforeUpdate: (category) => {
        if (category.changed('name') && !category.changed('slug')) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
      }
    }
  });

  // Define self-referencing association
  IncentiveCategory.associate = function(models) {
    // Parent-child relationship
    IncentiveCategory.belongsTo(models.IncentiveCategory, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    
    IncentiveCategory.hasMany(models.IncentiveCategory, {
      foreignKey: 'parentId',
      as: 'children'
    });
  };

  // Instance methods
  IncentiveCategory.prototype.getFullPath = async function() {
    const path = [this.name];
    let current = this;
    
    while (current.parentId) {
      current = await IncentiveCategory.findByPk(current.parentId);
      if (current) {
        path.unshift(current.name);
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  };

  IncentiveCategory.prototype.getAncestors = async function() {
    const ancestors = [];
    let current = this;
    
    while (current.parentId) {
      current = await IncentiveCategory.findByPk(current.parentId);
      if (current) {
        ancestors.unshift(current);
      } else {
        break;
      }
    }
    
    return ancestors;
  };

  IncentiveCategory.prototype.getDescendants = async function() {
    const descendants = [];
    
    const findChildren = async (categoryId) => {
      const children = await IncentiveCategory.findAll({
        where: { parentId: categoryId }
      });
      
      for (const child of children) {
        descendants.push(child);
        await findChildren(child.id);
      }
    };
    
    await findChildren(this.id);
    return descendants;
  };

  IncentiveCategory.prototype.isRoot = function() {
    return !this.parentId;
  };

  IncentiveCategory.prototype.isLeaf = async function() {
    const childCount = await IncentiveCategory.count({
      where: { parentId: this.id }
    });
    return childCount === 0;
  };

  IncentiveCategory.prototype.incrementIncentiveCount = async function() {
    return this.increment('incentiveCount');
  };

  IncentiveCategory.prototype.decrementIncentiveCount = async function() {
    if (this.incentiveCount > 0) {
      return this.decrement('incentiveCount');
    }
    return this;
  };

  IncentiveCategory.prototype.incrementViewCount = async function() {
    return this.increment('viewCount');
  };

  IncentiveCategory.prototype.generateSlug = function(name) {
    return (name || this.name)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  // Class methods
  IncentiveCategory.findActive = function() {
    return this.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
  };

  IncentiveCategory.findRoots = function() {
    return this.findAll({
      where: { 
        parentId: null,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
  };

  IncentiveCategory.findPopular = function() {
    return this.findAll({
      where: { 
        isPopular: true,
        isActive: true 
      },
      order: [['viewCount', 'DESC'], ['incentiveCount', 'DESC']]
    });
  };

  IncentiveCategory.findFeatured = function() {
    return this.findAll({
      where: { 
        isFeatured: true,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
  };

  IncentiveCategory.findByLevel = function(level) {
    return this.findAll({
      where: { 
        level: level,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
  };

  IncentiveCategory.findWithChildren = function() {
    return this.findAll({
      where: { isActive: true },
      include: [{
        model: IncentiveCategory,
        as: 'children',
        where: { isActive: true },
        required: false
      }],
      order: [
        ['sortOrder', 'ASC'], 
        ['name', 'ASC'],
        [{ model: IncentiveCategory, as: 'children' }, 'sortOrder', 'ASC'],
        [{ model: IncentiveCategory, as: 'children' }, 'name', 'ASC']
      ]
    });
  };

  IncentiveCategory.buildTree = async function() {
    const categories = await this.findAll({
      where: { isActive: true },
      order: [['level', 'ASC'], ['sortOrder', 'ASC'], ['name', 'ASC']]
    });
    
    const categoryMap = new Map();
    const tree = [];
    
    // Create map for quick lookup
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category.toJSON(),
        children: []
      });
    });
    
    // Build tree structure
    categories.forEach(category => {
      const categoryData = categoryMap.get(category.id);
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryData);
        }
      } else {
        tree.push(categoryData);
      }
    });
    
    return tree;
  };

  IncentiveCategory.findBySlug = function(slug) {
    return this.findOne({
      where: { 
        slug: slug,
        isActive: true 
      }
    });
  };

  return IncentiveCategory;
};