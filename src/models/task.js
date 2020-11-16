const { Model, DataTypes } = require('sequelize');

const sequelize = require('../configs/sequelize');

class Task extends Model { };
Task.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    taskID: DataTypes.STRING,
    taskVersion: DataTypes.SMALLINT,
    taskCreatedAt: DataTypes.DATE,
    taskUpdatedAt: DataTypes.DATE,
    taskServiceID: DataTypes.STRING,
    taskNodeID: DataTypes.STRING,
    taskState: DataTypes.ENUM('created', 'restarting', 'running', 'paused', 'exited', 'dead'),
    taskContainerID: DataTypes.STRING,
    taskDesiredState: DataTypes.STRING,
    taskNetworkID: DataTypes.STRING
}, {
    paranoid: true,
    timestamps: true,
    modelName: 'tasks',
    sequelize: sequelize.getSequelize(),
});

module.exports = Task;