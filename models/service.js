'use strict';
module.exports = function(sequelize, DataTypes) {
  var service = sequelize.define('service', {
      orderId:DataTypes.STRING,
      orderItemId:DataTypes.STRING,
      isBundle:DataTypes.BIGINT(1),
      name:DataTypes.STRING,
      description: DataTypes.STRING,
      provider:DataTypes.STRING,
      subscriber:DataTypes.STRING,
      orderDate:DataTypes.DATETIME,
      startDate:DataTypes.DATETIME,
      terminateDate:DataTypes.DATETIME,
      status:DataTypes.STRING,
      serialNumber:DataTypes.STRING,
      BLOB:DataTypes.STRING(1024),
      candidateId:DataTypes.STRING,
      specificationId:DataTypes.STRING
  });

  service.associate = function(models) {
    service.belongsToMany(models.service, { through: 'serviceRelationship', as: 'relationship' });
  };

  return service;
};
