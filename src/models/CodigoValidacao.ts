import { DataTypes, Model } from "sequelize";
import { sequelize } from '../config/database.js';

export class CodigoValidacao extends Model {}

CodigoValidacao.init(
    {
        email_admin:{
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        codigo_validacao: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'CodigoValidacao',
        tableName: 'codigos_validacao',
        timestamps: false
    }
);
