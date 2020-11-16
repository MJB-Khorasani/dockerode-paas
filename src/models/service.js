const { Model, DataTypes } = require('sequelize');

const sequelize = require('../configs/sequelize');
const Task = require('./task');

class Service extends Model { };
Service.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        unique: true,
        type: DataTypes.STRING
    },
    serviceID: DataTypes.STRING,
    serviceVersion: DataTypes.SMALLINT,
    serviceCreatedAt: DataTypes.DATE,
    serviceUpdatedAt: DataTypes.DATE,
    serviceName: DataTypes.STRING,
    serviceImage: DataTypes.STRING,
    serviceHostname: DataTypes.STRING,
    serviceMounts: DataTypes.ARRAY(DataTypes.JSON),
    serviceResources: DataTypes.JSON,
    servicePlacement: DataTypes.STRING,
    serviceReplicas: DataTypes.SMALLINT,
    servicePorts: DataTypes.ARRAY(DataTypes.JSON),
    serviceVirtualIPs: DataTypes.ARRAY(DataTypes.JSON),
    price: DataTypes.STRING
}, {
    paranoid: true,
    timestamps: true,
    modelName: 'services',
    sequelize: sequelize.getSequelize(),
});

// 1
Service.hasMany(Task);
// N
Task.belongsTo(Service);

module.exports = Service;