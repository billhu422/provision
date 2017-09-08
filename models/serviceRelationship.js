'use strict';
module.exports = function(sequelize, DataTypes) {
  var serviceRelationship = sequelize.define('serviceRelationship', {
    abcId: DataTypes.INTEGER,
    subId: DataTypes.INTEGER,
    type: DataTypes.STRING,
  });

  return serviceRelationship;
};
