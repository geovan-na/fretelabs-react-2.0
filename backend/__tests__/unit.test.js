// backend/__tests__/unit.test.js
// Suíte de 5 testes unitários com Jest — Regras de negócio, utilitários e middlewares do FreteLabs

const jwt = require('jsonwebtoken');
const { validarCPF, validarCNPJ } = require('../utils/cpfValidator');
const { formatarMoeda, formatarTelefone } = require('../utils/formatters');
const { generateToken } = require('../utils/tokenGenerator');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

describe('FreteLabs — Testes Unitários do Backend (Jest)', () => {
    // =========================================================================
    // TESTE UNITÁRIO 1: Validação de CPF e CNPJ (cpfValidator.js)
    // =========================================================================
    test('1. Deve validar corretamente CPFs e CNPJs válidos e rejeitar documentos inválidos', () => {
        // CPF válido (com máscara e sem máscara)
        expect(validarCPF('529.982.247-25')).toBe(true);
        expect(validarCPF('52998224725')).toBe(true);

        // CPFs inválidos (sequência repetida, dígito incorreto, tamanho incorreto)
        expect(validarCPF('111.111.111-11')).toBe(false);
        expect(validarCPF('529.982.247-00')).toBe(false);
        expect(validarCPF('12345')).toBe(false);

        // CNPJ válido e inválidos
        expect(validarCNPJ('12.345.678/0001-90')).toBe(true);
        expect(validarCNPJ('00.000.000/0000-00')).toBe(false);
        expect(validarCNPJ('123456')).toBe(false);
    });

    // =========================================================================
    // TESTE UNITÁRIO 2: Formatação de Moeda (BRL) e Telefone (formatters.js)
    // =========================================================================
    test('2. Deve formatar valores de frete em Reais (BRL) e números de telefone corretamente', () => {
        const valorFormatado = formatarMoeda(3500);
        // Normaliza espaço não-quebrável (\u00A0) gerado pelo Intl.NumberFormat
        expect(valorFormatado.replace(/\u00A0/g, ' ')).toBe('R$ 3.500,00');

        expect(formatarTelefone('62998887766')).toBe('(62) 99888-7766');
        expect(formatarTelefone('6232123456')).toBe('(62) 3212-3456');
    });

    // =========================================================================
    // TESTE UNITÁRIO 3: Geração e Payload de Token JWT (tokenGenerator.js)
    // =========================================================================
    test('3. Deve gerar um token JWT válido contendo id, email e perfil do usuário', () => {
        const token = generateToken(5, 'vinculado3@fretelabs.com', 'VINCULADO');
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature

        const secret = process.env.JWT_SECRET || 'fretelabs_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        expect(decoded.id).toBe(5);
        expect(decoded.email).toBe('vinculado3@fretelabs.com');
        expect(decoded.tipo).toBe('VINCULADO');
    });

    // =========================================================================
    // TESTE UNITÁRIO 4: Middleware de Autenticação JWT (authMiddleware.js)
    // =========================================================================
    test('4. Deve bloquear requisições sem token (401), token inválido (403) e liberar token válido', () => {
        const criarResMock = () => {
            const res = {};
            res.status = jest.fn().mockReturnValue(res);
            res.json = jest.fn().mockReturnValue(res);
            return res;
        };

        // Caso A: Sem token -> 401
        const reqSemToken = { headers: {} };
        const resSemToken = criarResMock();
        const nextSemToken = jest.fn();
        authenticateToken(reqSemToken, resSemToken, nextSemToken);
        expect(resSemToken.status).toHaveBeenCalledWith(401);
        expect(nextSemToken).not.toHaveBeenCalled();

        // Caso B: Token inválido -> 403
        const reqInvalido = { headers: { authorization: 'Bearer token_falso_invalido' } };
        const resInvalido = criarResMock();
        const nextInvalido = jest.fn();
        authenticateToken(reqInvalido, resInvalido, nextInvalido);
        expect(resInvalido.status).toHaveBeenCalledWith(403);
        expect(nextInvalido).not.toHaveBeenCalled();

        // Caso C: Token válido -> chama next() e preenche dados do usuário na req
        const tokenValido = generateToken(2, 'embarcador@fretelabs.com', 'EMBARCADOR');
        const reqValido = { headers: { authorization: `Bearer ${tokenValido}` } };
        const resValido = criarResMock();
        const nextValido = jest.fn();
        authenticateToken(reqValido, resValido, nextValido);
        expect(nextValido).toHaveBeenCalledTimes(1);
        expect(reqValido.userId).toBe(2);
        expect(reqValido.userEmail).toBe('embarcador@fretelabs.com');
        expect(reqValido.userRole).toBe('EMBARCADOR');
    });

    // =========================================================================
    // TESTE UNITÁRIO 5: Validação de Cadastro e Login (validationMiddleware.js)
    // =========================================================================
    test('5. Deve validar campos obrigatórios, e-mail e tamanho mínimo de senha no cadastro e login', () => {
        const criarResMock = () => {
            const res = {};
            res.status = jest.fn().mockReturnValue(res);
            res.json = jest.fn().mockReturnValue(res);
            return res;
        };

        // Cadastro com senha curta (< 6 caracteres) -> 400
        const reqSenhaCurta = {
            body: { nome_razao_social: 'Frota Express', email: 'frota@fretelabs.com', senha: '123' }
        };
        const resSenhaCurta = criarResMock();
        const nextSenhaCurta = jest.fn();
        validateRegister(reqSenhaCurta, resSenhaCurta, nextSenhaCurta);
        expect(resSenhaCurta.status).toHaveBeenCalledWith(400);
        expect(resSenhaCurta.json).toHaveBeenCalledWith({ error: 'Senha deve ter no mínimo 6 caracteres' });
        expect(nextSenhaCurta).not.toHaveBeenCalled();

        // Cadastro válido -> chama next()
        const reqCadastroOk = {
            body: { nome_razao_social: 'Frota Express', email: 'frota@fretelabs.com', senha: 'senhaSegura123' }
        };
        const resCadastroOk = criarResMock();
        const nextCadastroOk = jest.fn();
        validateRegister(reqCadastroOk, resCadastroOk, nextCadastroOk);
        expect(nextCadastroOk).toHaveBeenCalledTimes(1);

        // Login sem senha -> 400
        const reqLoginInvalido = { body: { email: 'frota@fretelabs.com' } };
        const resLoginInvalido = criarResMock();
        const nextLoginInvalido = jest.fn();
        validateLogin(reqLoginInvalido, resLoginInvalido, nextLoginInvalido);
        expect(resLoginInvalido.status).toHaveBeenCalledWith(400);
        expect(nextLoginInvalido).not.toHaveBeenCalled();
    });
});
