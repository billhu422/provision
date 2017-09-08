'use strict';
module.exports = function(sequelize, DataTypes) {
  var service = sequelize.define('service', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  });

  service.associate = function(models) {
    service.belongsToMany(models.service, { through: 'serviceRelationship', as: 'relationship' });
  };

  return service;
};
