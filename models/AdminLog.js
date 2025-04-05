const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminLog = sequelize.define('AdminLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['adminId']
      },
      {
        fields: ['action_type']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  AdminLog.associate = (models) => {
    AdminLog.belongsTo(models.Admin, { 
      foreignKey: 'adminId' 
    });
  };

  return AdminLog;
};