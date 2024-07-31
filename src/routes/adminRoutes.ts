import { Router } from 'express';
import { cadastrarAdmin, loginAdmin, acessarInfo, aceitarAdmin } from '../controllers/adminController.js';
import { verificaToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/cadastrar', cadastrarAdmin);
router.post('/login', loginAdmin);
router.get('/acessa-info', verificaToken, acessarInfo);
router.post('/aceitar-admin', aceitarAdmin);

export default router;
