'use strict'
var Sequelize = require('sequelize');

var options = {
  timezone:'+08:00'
}

var sequelize = new Sequelize(config.dbConnection,options);

var service = sequelize.define('service', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
 });

var serviceRelationship = sequelize.define('serviceRelationship', {
    abcId: DataTypes.INTEGER,
    subId: DataTypes.INTEGER,
    type: DataTypes.STRING,
});

service.belongsToMany(service, { through: 'serviceRelationship', as: 'serviceRelationship' });

database.sequelize = sequelize;
database.Sequelize = Sequelize;

module.exports = database;