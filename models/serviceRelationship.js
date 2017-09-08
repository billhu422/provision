'use strict';
module.exports = function(sequelize, DataTypes) {
  var serviceRelationship = sequelize.define('serviceRelationship', {
    type: DataTypes.STRING,
  });

  return serviceRelationship;
};
