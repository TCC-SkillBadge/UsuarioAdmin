import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UA, CodigoValidacao } from './UsuarioAdministrativo.DAOclass.js'
import { 
    SenhaIncorreta,
    ServicoIndisponivel,
    UsuarioAdministrativoNaoEncontrado,
    CodigoInvalido,
    AdminNaoAceito,
    ViolacaoUnique,
    TokenNaoFornecido,
    TokenExpirado,
    TokenInvalido 
} from './ErrorList.js'

const appServer = express()
appServer.use(express.json())
appServer.use(cors())

dotenv.config()
const { JWT_UA_ACCESS_KEY, JWT_EXPIRATION_TIME, SALT_ROUNDS } = process.env
const PORT = process.env.PORT || 6001

await UA.sync()
await CodigoValidacao.sync()

const verificaAceitacaoAdmin = async (req: any, res: any, next: any) => {
    const { email_admin, codigo_validacao } = req.body
    try{
        const codigoValidacao = await CodigoValidacao.findByPk(email_admin)
        if(codigoValidacao){
            const codigoValidacaoCorreto = await bcrypt.compare(codigo_validacao, codigoValidacao.getDataValue('codigo_validacao'))
            if(codigoValidacaoCorreto) next()
            else res.status(409).send(new CodigoInvalido())
        }
        else{
            res.status(404).send(new AdminNaoAceito())
        }
    }
    catch(err){
        console.error("Erro na operação 'VerificaAceitacaoAdmin' no serviço de Usuários Administrativos", err)
        res.status(503).send(new ServicoIndisponivel())
    }
}

const verificaToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')
    if(!token){
        res.status(400).send(new TokenNaoFornecido())
        return
    }
    let chave: string | undefined
    switch(req.query.tipoUsuario){
        case 'UA':
            chave = JWT_UA_ACCESS_KEY
            break
    }
    jwt.verify(token[1], chave!, (err: any, result: any) => {
        if(err){
            console.error("Erro na verificação do Token", err)
            switch(err.name){
                case 'TokenExpiredError':
                    res.status(401).send(new TokenExpirado())
                    return
                case 'JsonWebTokenError':
                    res.status(401).send(new TokenInvalido())
                    return
            }
        }
        req.usuario = result.usuario
        next() 
    })
}

appServer.post('/cadastrar', verificaAceitacaoAdmin, async (req: any, res: any) => {
    console.log("Requisição de Cadastro de Usuário Administrativo")
    const { email_admin, senha, nome_admin, cargo } = req.body
    let senhaHash: any, sucesso = false
    while(!sucesso){
        try{
            senhaHash = await bcrypt.hash(senha, +SALT_ROUNDS!)
            sucesso = true
        }
        catch(err){
            console.error("Erro no bcrypt.hash()", err)
        }
    }
    try{
        await UA.create({ email_admin, senha: senhaHash, nome_admin, cargo})
        res.status(201).send({ message: 'Usuário Administrativo Cadastrado com Sucesso' })
    }
    catch(err: any){
        console.error("Erro no UA.create()", err)
        switch(err.errors[0].type){
            case 'unique violation':
                res.status(409).send(new ViolacaoUnique())
                break
            default:
                res.status(503).send(new ServicoIndisponivel())
        }
    }
})

appServer.get('/login', async (req: any, res: any) => {
    console.log("Requisição de Login de Usuário Administrativo")
    const { email_admin, senha } = req.query
    try{
        const usuarioA = await UA.findByPk(email_admin as string)
        if(usuarioA){
            const senhaDadaEstaCorreta = await bcrypt.compare(senha as string, usuarioA.getDataValue('senha'))
            if(senhaDadaEstaCorreta){
                const token = jwt.sign(
                    { usuario: usuarioA.getDataValue('email_admin') },
                    JWT_UA_ACCESS_KEY!,
                    { expiresIn: JWT_EXPIRATION_TIME! }
                )
                const resposta = {
                    token,
                    tipoUsuario: 'UA'
                }
                res.status(200).json(resposta)
            }
            else{
                res.status(401).send(new SenhaIncorreta())
            }
        }
        else{
            res.status(404).send(new UsuarioAdministrativoNaoEncontrado())
        }
    }
    catch(err){
        console.error("Erro na operação 'Login' no serviço de Usuários Administrativos", err)
        res.status(503).send(new ServicoIndisponivel())
    }
})

appServer.get('/acessa-info', verificaToken, async (req: any, res: any) => {
    const { usuario } = req
    try {
        const infoUE = await UA.findByPk(usuario as string)
        if (infoUE) {
            res.status(200).json(infoUE);
        } else {
            res.status(404).send(new UsuarioAdministrativoNaoEncontrado())
        }
    }
    catch(err){
        console.error("Erro na operação 'AcessaInfo' no serviço de Usuários Administrativos", err)
        res.status(503).send(new ServicoIndisponivel())
    }
})

appServer.post('/aceitar-admin', async (req: any, res: any) => {
    const { email_admin, codigo_validacao } = req.body
    let codigoHash: any, sucesso = false
    while(!sucesso){
        try{
            codigoHash = await bcrypt.hash(codigo_validacao, +SALT_ROUNDS!)
            sucesso = true
        }
        catch(err){
            console.error("Erro no bcrypt.hash()", err)
        }
    }
    try{
        await CodigoValidacao.create({ email_admin, codigo_validacao: codigoHash })
        res.status(201).send('Código de Validação para Admin Criado com Sucesso')
    }
    catch(err: any){
        console.error("Erro no CodigoValidacao.create()", err)
        switch(err.errors[0].type){
            case 'unique violation':
                res.status(409).send(new ViolacaoUnique())
                break
            default:
                res.status(503).send(new ServicoIndisponivel())
        }
    }
})

appServer.listen(PORT, () => console.log(`Usuário Administrativo. Executando Porta ${PORT}`))