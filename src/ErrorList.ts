export class SenhaIncorreta extends Error {
    constructor(){
        super()
        this.name = 'SenhaIncorreta'
        this.message = 'Senha Incorreta'
    }
}
export class ServicoIndisponivel extends Error {
    constructor(){
        super()
        this.name = 'ServicoIndisponivel'
        this.message = 'Serviço Indisponível'
    }
}
export class CodigoInvalido extends Error {
    constructor(){
        super()
        this.name = 'CodigoInvalido'
        this.message = 'Código de Acesso Inválido'
    }
}
export class UsuarioAdministrativoNaoEncontrado extends Error {
    constructor(){
        super()
        this.name = 'UsuarioAdministrativoNaoEncontrado'
        this.message = 'Usuário Administrativo não Encontrado'
    }
}
export class AdminNaoAceito extends Error {
    constructor(){
        super()
        this.name = 'AdminNaoAceito'
        this.message = 'Admin não aceito pelo sistema'
    }

}
export class TokenNaoFornecido extends Error {
    constructor(){
        super()
        this.name = 'TokenNaoFornecido'
        this.message = 'Token não fornecido'
    }
}
export class TokenInvalido extends Error {
    constructor(){
        super()
        this.name = 'TokenInvalido'
        this.message = 'Token Inválido'
    }
}
export class TokenExpirado extends Error {
    constructor(){
        super()
        this.name = 'TokenExpirado'
        this.message = 'Token Expirado'
    }
}
export class ViolacaoUnique extends Error {
    constructor(){
        super()
        this.name = 'AdminJaCadastrado'
        this.message = 'Email Admin já cadastrado'
    }
}