import { DataTypes, Model } from "sequelize";
import { sequelize } from '../config/database.js';

export class UA extends Model {}

UA.init(
    {
        email_admin:{
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        senha: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nome_admin: {
            type: DataTypes.STRING(160),
            allowNull: false
        },
        cargo: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'UA',
        tableName: 'usuarios_administrativos',
        timestamps: false
    }
);