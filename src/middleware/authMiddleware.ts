import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenNaoFornecido, TokenExpirado, TokenInvalido } from '../utils/ErrorList.js';

const { JWT_UA_ACCESS_KEY } = process.env;

export interface AuthenticatedRequest extends Request {
    usuario?: string;
}

export const verificaToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ');
    if(!token){
        res.status(400).send(new TokenNaoFornecido());
        return;
    }
    jwt.verify(token[1], JWT_UA_ACCESS_KEY!, (err, result) => {
        if(err){
            console.error("Erro na verificação do Token", err);
            switch(err.name){
                case 'TokenExpiredError':
                    res.status(401).send(new TokenExpirado());
                    return;
                case 'JsonWebTokenError':
                    res.status(401).send(new TokenInvalido());
                    return;
            }
        }
        req.usuario = (result as any).usuario;
        next();
    });
}
