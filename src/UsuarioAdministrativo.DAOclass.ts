import dotenv from 'dotenv'
import { Sequelize, DataTypes, Model } from "sequelize"

dotenv.config()
const { HOST, USER, PASSWORD, DATABASE, PORT_DATABASE_CONNECTION, SSL } = process.env

const sequelize = new Sequelize({
    database: DATABASE,
    username: USER,
    password: PASSWORD,
    host: HOST,
    port: +PORT_DATABASE_CONNECTION!,
    ssl: SSL === 'REQUIRED' ? true : false,
    dialect: 'mysql'
})

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
)

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
)