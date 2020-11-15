const { Model, DataTypes } = require('sequelize');

const sequelize = require('../configs/sequelize');

class Image extends Model { };
Image.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    imageId: DataTypes.STRING,  
    imageRepoTags: DataTypes.ARRAY(DataTypes.STRING),
    imageRepoDigests: DataTypes.ARRAY(DataTypes.STRING),
    imageParentId: DataTypes.STRING,  
    imageCreated: DataTypes.STRING,
    imageContainer: DataTypes.STRING,
    imageExposedPort: DataTypes.INTEGER,
    imageEnv: DataTypes.ARRAY(DataTypes.STRING),
    imageCmd: DataTypes.ARRAY(DataTypes.STRING),
    imageWorkDir: DataTypes.STRING
}, {
    paranoid: true,
    timestamps: true,
    modelName: 'images',
    sequelize: sequelize.getSequelize()
});

module.exports = Image;