import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js';
import { sequelize } from './config/database.js';

dotenv.config();

const appServer = express();
appServer.use(express.json());
appServer.use(cors());

const PORT = process.env.PORT || 7004;

sequelize.sync().then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.error('Unable to connect to the database:', err);
});

appServer.use('/admin', adminRoutes);

appServer.listen(PORT, () => console.log(`Usuário Administrativo. Executando Porta ${PORT}`));