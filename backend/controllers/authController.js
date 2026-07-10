// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateToken } = require('../utils/tokenGenerator');
// controllers/authController.js
// controllers/authController.js

const register = async (req, res) => {
    try {
        const { 
            tipo_usuario, 
            tipo_pessoa, 
            nome_razao_social, 
            nome_fantasia, 
            cpf_cnpj, 
            email, 
            senha, 
            telefone,
            celular,
            inscricao_estadual,
            registro_nacional_transportador,
            cnh,
            cnh_categoria,
            cnh_validade
        } = req.body;

        console.log('Cadastro - Tipo recebido:', tipo_usuario);
        console.log('Inscricao Estadual:', inscricao_estadual);
        console.log('Registro Nacional Transportador:', registro_nacional_transportador);

        // Validações basicas
        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

        const [existing] = await db.query('SELECT id FROM pessoas WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'E-mail ja cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.query(
            `INSERT INTO pessoas (
                tipo_pessoa, 
                nome_razao_social, 
                nome_fantasia, 
                cpf_cnpj, 
                email, 
                senha, 
                telefone,
                celular,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APROVADO')`,
            [
                tipo_pessoa, 
                nome_razao_social, 
                nome_fantasia || null, 
                cpf_cnpj, 
                email, 
                hashedPassword, 
                telefone || null,
                celular || null
            ]
        );

        const pessoaId = result.insertId;

        // Inserir na tabela especifica de acordo com o tipo
        if (tipo_usuario === 'embarcador') {
            await db.query(
                'INSERT INTO embarcadores (pessoa_id, inscricao_estadual) VALUES (?, ?)',
                [pessoaId, inscricao_estadual || null]
            );
            console.log('Embarcador criado');

        } else if (tipo_usuario === 'frota') {
            await db.query(
                `INSERT INTO transportadores 
                 (pessoa_id, tipo_transportador, inscricao_estadual, registro_nacional_transportador) 
                 VALUES (?, ?, ?, ?)`,
                [pessoaId, 'FROTA', inscricao_estadual || null, registro_nacional_transportador || null]
            );
            console.log('Frota criada');

        } else if (tipo_usuario === 'autonomo') {
            await db.query(
                `INSERT INTO transportadores 
                 (pessoa_id, tipo_transportador, registro_nacional_transportador) 
                 VALUES (?, ?, ?)`,
                [pessoaId, 'AUTONOMO', registro_nacional_transportador || null]
            );
            console.log('Autonomo criado');

        } else if (tipo_usuario === 'vinculado') {
            // Validar campos obrigatorios do vinculado
            if (!cnh) {
                return res.status(400).json({ error: 'CNH é obrigatória para motorista vinculado' });
            }
            if (!cnh_categoria) {
                return res.status(400).json({ error: 'Categoria CNH é obrigatória' });
            }
            if (!cnh_validade) {
                return res.status(400).json({ error: 'Validade da CNH é obrigatória' });
            }

            // Buscar uma frota existente
            const [frota] = await db.query(
                'SELECT id FROM transportadores WHERE tipo_transportador = "FROTA" LIMIT 1'
            );
            
            if (frota.length === 0) {
                return res.status(400).json({ 
                    error: 'Nenhuma frota cadastrada. Cadastre uma frota primeiro.' 
                });
            }
            
            const frotaId = frota[0].id;
            
            console.log('Frota encontrada para vinculacao:', frotaId);
            console.log('CNH:', cnh);
            console.log('Categoria CNH:', cnh_categoria);
            console.log('Validade CNH:', cnh_validade);

            await db.query(
                `INSERT INTO motoristas_vinculados 
                 (pessoa_id, transportador_id, cnh, cnh_categoria, cnh_validade, data_admissao, status) 
                 VALUES (?, ?, ?, ?, ?, NOW(), 'ATIVO')`,
                [pessoaId, frotaId, cnh, cnh_categoria, cnh_validade]
            );
            
            console.log('Motorista vinculado criado');
        }

        // Buscar o usuario criado
        const [userCreated] = await db.query(
            'SELECT id, nome_razao_social, email FROM pessoas WHERE id = ?',
            [pessoaId]
        );

        // Detectar o tipo correto
        let tipoRetorno = tipo_usuario;

        const [embarcador] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [pessoaId]
        );
        if (embarcador.length > 0) tipoRetorno = 'embarcador';

        const [transportador] = await db.query(
            'SELECT id, tipo_transportador FROM transportadores WHERE pessoa_id = ?',
            [pessoaId]
        );
        if (transportador.length > 0) {
            tipoRetorno = transportador[0].tipo_transportador === 'FROTA' ? 'frota' : 'autonomo';
        }

        const [vinculado] = await db.query(
            'SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?',
            [pessoaId]
        );
        if (vinculado.length > 0) {
            tipoRetorno = 'vinculado';
        }

        console.log('Tipo final detectado:', tipoRetorno);

        const token = generateToken(pessoaId, email, tipoRetorno);

        res.status(201).json({
            message: 'Cadastro realizado com sucesso',
            token,
            user: {
                id: pessoaId,
                nome: nome_razao_social,
                email: email,
                tipo: tipoRetorno
            }
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