import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CodigoValidacao } from '../models/CodigoValidacao.js';
import { UA } from '../models/UsuarioAdministrativo.js';
import { 
    SenhaIncorreta, ServicoIndisponivel, UsuarioAdministrativoNaoEncontrado,
    CodigoInvalido, AdminNaoAceito, ViolacaoUnique 
} from '../utils/ErrorList.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js'; // Certifique-se de importar a interface correta

const { JWT_UA_ACCESS_KEY, JWT_EXPIRATION_TIME, SALT_ROUNDS } = process.env;

export const cadastrarAdmin = async (req: Request, res: Response) => {
    const { email_admin, senha, nome_admin, cargo, codigo_validacao } = req.body;
    try {
        // Verificar o código de validação
        const codigoValidacao = await CodigoValidacao.findByPk(email_admin);
        if (!codigoValidacao) {
            return res.status(404).send(new AdminNaoAceito());
        }

        const codigoValidacaoCorreto = await bcrypt.compare(codigo_validacao, codigoValidacao.getDataValue('codigo_validacao'));
        if (!codigoValidacaoCorreto) {
            return res.status(409).send(new CodigoInvalido());
        }

        // Se o código de validação for correto, proceder com o cadastro
        const senhaHash = await bcrypt.hash(senha, +SALT_ROUNDS!);
        await UA.create({ email_admin, senha: senhaHash, nome_admin, cargo });
        res.status(201).send({ message: 'Usuário Administrativo Cadastrado com Sucesso' });
    } catch (err: any) {
        console.error("Erro no UA.create()", err);
        switch(err.errors[0].type){
            case 'unique violation':
                res.status(409).send(new ViolacaoUnique());
                break;
            default:
                res.status(503).send(new ServicoIndisponivel());
        }
    }
}

export const loginAdmin = async (req: Request, res: Response) => {
    const { email_admin, senha } = req.body; // Usando req.body para POST
    try {
        const usuarioA = await UA.findByPk(email_admin as string);
        if (usuarioA) {
            const senhaDadaEstaCorreta = await bcrypt.compare(senha as string, usuarioA.getDataValue('senha'));
            if (senhaDadaEstaCorreta) {
                const token = jwt.sign(
                    { usuario: usuarioA.getDataValue('email_admin') },
                    JWT_UA_ACCESS_KEY!,
                    { expiresIn: JWT_EXPIRATION_TIME! }
                );
                res.status(200).json({ token, tipoUsuario: 'UA' });
            } else {
                res.status(401).send(new SenhaIncorreta());
            }
        } else {
            res.status(404).send(new UsuarioAdministrativoNaoEncontrado());
        }
    } catch (err) {
        console.error("Erro na operação 'Login' no serviço de Usuários Administrativos", err);
        res.status(503).send(new ServicoIndisponivel());
    }
}

export const acessarInfo = async (req: AuthenticatedRequest, res: Response) => {
    const { usuario } = req;
    try {
        const infoUE = await UA.findByPk(usuario as string);
        if (infoUE) {
            res.status(200).json(infoUE);
        } else {
            res.status(404).send(new UsuarioAdministrativoNaoEncontrado());
        }
    } catch (err) {
        console.error("Erro na operação 'AcessaInfo' no serviço de Usuários Administrativos", err);
        res.status(503).send(new ServicoIndisponivel());
    }
}

export const aceitarAdmin = async (req: Request, res: Response) => {
    const { email_admin, codigo_validacao } = req.body;
    try {
        const codigoHash = await bcrypt.hash(codigo_validacao, +SALT_ROUNDS!);
        await CodigoValidacao.create({ email_admin, codigo_validacao: codigoHash });
        res.status(201).send('Código de Validação para Admin Criado com Sucesso');
    } catch (err: any) {
        console.error("Erro no CodigoValidacao.create()", err);
        switch(err.errors[0].type){
            case 'unique violation':
                res.status(409).send(new ViolacaoUnique());
                break;
            default:
                res.status(503).send(new ServicoIndisponivel());
        }
    }
}
