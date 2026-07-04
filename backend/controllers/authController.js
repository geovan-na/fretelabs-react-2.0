// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateToken } = require('../utils/tokenGenerator');

const register = async (req, res) => {
    try {
        const { tipo_usuario, tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone } = req.body;

        const [existing] = await db.query('SELECT id FROM pessoas WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.query(
            `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDENTE')`,
            [tipo_pessoa, nome_razao_social, nome_fantasia || null, cpf_cnpj, email, hashedPassword, telefone]
        );

        let tipo = tipo_usuario;
        if (tipo_usuario === 'embarcador') {
            await db.query('INSERT INTO embarcadores (pessoa_id) VALUES (?)', [result.insertId]);
        } else if (tipo_usuario === 'frota') {
            await db.query('INSERT INTO transportadores (pessoa_id, tipo_transportador) VALUES (?, ?)', [result.insertId, 'FROTA']);
        } else if (tipo_usuario === 'autonomo') {
            await db.query('INSERT INTO transportadores (pessoa_id, tipo_transportador) VALUES (?, ?)', [result.insertId, 'AUTONOMO']);
        }

        const token = generateToken(result.insertId, email, tipo);

        res.status(201).json({
            message: 'Cadastro realizado com sucesso',
            token,
            user: { id: result.insertId, nome: nome_razao_social, email, tipo: tipo_usuario }
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Busca a pessoa pelo e-mail
        const [users] = await db.query('SELECT * FROM pessoas WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos' });
        }

        const user = users[0];
        
        // 2. Valida a senha cryptografada
        const isValid = await bcrypt.compare(senha, user.senha);
        if (!isValid) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos' });
        }

        // 3. Identifica o Tipo de Usuário e captura o ID da tabela específica (Chave Primária)
        let tipo = 'usuario';
        let perfil_id = null; 
        
        if (user.is_admin) {
            tipo = 'admin';
        } else {
            // Verificação 1: É Embarcador?
            const [embarcador] = await db.query('SELECT id FROM embarcadores WHERE pessoa_id = ?', [user.id]);
            if (embarcador.length > 0) {
                tipo = 'embarcador';
                perfil_id = embarcador[0].id;
            }

            // Verificação 2: É Transportador (Frota ou Autônomo)?
            const [transportador] = await db.query('SELECT id, tipo_transportador FROM transportadores WHERE pessoa_id = ?', [user.id]);
            if (transportador.length > 0) {
                tipo = transportador[0].tipo_transportador === 'FROTA' ? 'frota' : 'autonomo';
                perfil_id = transportador[0].id;
            }

            // Verificação 3: É Motorista Vinculado de alguma frota?
            const [vinculado] = await db.query('SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?', [user.id]);
            if (vinculado.length > 0) {
                tipo = 'vinculado';
                perfil_id = vinculado[0].id;
            }
        }

        // Log no terminal do backend para ajudar no desenvolvimento/debug
        console.log(`🔑 Usuário [${user.email}] logado. Tipo detectado: ${tipo.toUpperCase()} | Perfil ID específico: ${perfil_id}`);

        // 4. Gera o token JWT (Passando o ID da tabela pessoas)
        const token = generateToken(user.id, user.email, tipo);

        // 5. Retorna o payload completo e limpo para o Frontend
        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,            // ID da tabela 'pessoas' (usado em logs gerais e auditoria)
                perfil_id: perfil_id,   // ID específico (usado nas Foreign Keys de fretes, propostas, etc.)
                nome: user.nome_razao_social,
                email: user.email,
                tipo,
                status: user.status,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getMe = async (req, res) => {
    try {
        // 1. Busca os dados básicos da pessoa
        const [users] = await db.query(
            'SELECT id, tipo_pessoa, nome_razao_social, email, telefone, status, is_admin FROM pessoas WHERE id = ?',
            [req.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = users[0];

        // 2. Identifica o Tipo de Usuário e captura o ID da tabela específica (Chave Primária)
        let tipo = 'usuario';
        let perfil_id = null; 
        
        if (user.is_admin) {
            tipo = 'admin';
        } else {
            // Verificação 1: É Embarcador?
            const [embarcador] = await db.query('SELECT id FROM embarcadores WHERE pessoa_id = ?', [user.id]);
            if (embarcador.length > 0) {
                tipo = 'embarcador';
                perfil_id = embarcador[0].id;
            }

            // Verificação 2: É Transportador (Frota ou Autônomo)?
            const [transportador] = await db.query('SELECT id, tipo_transportador FROM transportadores WHERE pessoa_id = ?', [user.id]);
            if (transportador.length > 0) {
                tipo = transportador[0].tipo_transportador === 'FROTA' ? 'frota' : 'autonomo';
                perfil_id = transportador[0].id;
            }

            // Verificação 3: É Motorista Vinculado?
            const [vinculado] = await db.query('SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?', [user.id]);
            if (vinculado.length > 0) {
                tipo = 'vinculado';
                perfil_id = vinculado[0].id;
            }
        }

        // 3. Retorna a resposta idêntica à estrutura que o Login entrega
        res.json({ 
            user: {
                id: user.id,
                perfil_id: perfil_id,
                nome: user.nome_razao_social,
                email: user.email,
                telefone: user.telefone,
                tipo,
                status: user.status,
                is_admin: user.is_admin
            } 
        });

    } catch (error) {
        console.error('Erro no getMe:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const forgotPassword = async (req, res) => {
    res.json({ message: 'Link de recuperação enviado' });
};

const resetPassword = async (req, res) => {
    res.json({ message: 'Senha redefinida com sucesso' });
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };