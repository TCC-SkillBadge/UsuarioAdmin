import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UA, CodigoValidacao } from './UsuarioAdministrativo.DAOclass.js'
import { SenhaIncorreta, ServicoIndisponivel, UsuarioAdministrativoNaoEncontrado, CodigoInvalido, AdminNaoAceito, ViolacaoUnique } from './ErrorList.js'

dotenv.config()
const { PORT_SERVICE, JWT_UA_ACCESS_KEY, JWT_EXPIRATION_TIME, SALT_ROUNDS } = process.env

const appServer = express()
appServer.use(express.json())
appServer.use(cors())

await UA.sync()
await CodigoValidacao.sync()

const verificaAceitacaoAdmin = async (req: any, res: any, next: any) => {
    const { email_admin, codigo_validacao } = req.body
    try{
        await CodigoValidacao.sync()
        const codigoValidacao = await CodigoValidacao.findByPk(email_admin)
        console.log(codigoValidacao)
        if(codigoValidacao){
            const codigoValidacaoCorreto = await bcrypt.compare(codigo_validacao, codigoValidacao.getDataValue('codigo_validacao'))
            if(codigoValidacaoCorreto){
                next()
            }
            else{
                res.status(401).send(new CodigoInvalido())
                return
            }
        }
        else{
            res.status(404).send(new AdminNaoAceito())
            return
        }
    }
    catch(err){
        console.error("Erro na operação 'VerificaAceitacaoAdmin' no serviço de Usuários Administrativos", err)
        res.send(err)
        return
    }
}

const verificaToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')
    if(!token){
        return res.status(401).send('Token não fornecido')
    }
    let chave: string | undefined
    switch(req.query.tipoUsuario){
        case 'UA':
            chave = JWT_UA_ACCESS_KEY
            break
    }
    jwt.verify(token[1], chave!, (err: any, result: any) => {
        if(err){
            return res.status(403).send('Token Inválido')
        }
        req.usuario = result.usuario
        next()
    })

}

appServer.post('/cadastrar', verificaAceitacaoAdmin, async (req: any, res: any) => {
    console.log("Requisição de Cadastro de Usuário Administrativo")
    const { email_admin, senha, nome_admin, cargo } = req.body
    try{
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
            const novoUA = await UA.create({ email_admin, senha: senhaHash, nome_admin, cargo})
            if(novoUA){
                res.status(201).send('Usuário Administrativo Cadastrado com Sucesso')
            }
            else{
                res.status(503).send(new ServicoIndisponivel())
            }
        }
        catch(err: any){
            console.error("Erro no UA.create()", err)
            switch(err.errors[0].type){
                case 'unique violation':
                    res.status(409).send(new ViolacaoUnique())
                    break
            }
        }
    }
    catch(err){
        console.error("Erro na operação 'Cadastrar' no serviço de Usuários Administrativos", err)
        return res.send(err)
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
        res.send(err)
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
        res.send(err)
    }
})

appServer.post('/aceitar-admin', async (req: any, res: any) => {
    const { email_admin, codigo_validacao } = req.body
    try{
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
            const novoCodigo = await CodigoValidacao.create({ email_admin, codigo_validacao: codigoHash })
            if(novoCodigo){
                res.status(201).send('Código de Validação para Admin Criado com Sucesso')
            }
            else{
                res.status(503).send(new ServicoIndisponivel())
            }
        }
        catch(err){
            console.error("Erro no CodigoValidacao.create()", err)
            res.send(err)
        }
    }
    catch(err){
        console.error("Erro na operação 'Aceitar Admin' no serviço de Usuários Administrativos", err)
        res.send(err)
    }
})

appServer.listen(PORT_SERVICE, () => console.log(`Usuário Administrativo. Executando Porta ${PORT_SERVICE}`))