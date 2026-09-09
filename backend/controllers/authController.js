// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateToken } = require('../utils/tokenGenerator');

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
            porte_empresa, // ADICIONADO: Capturando o porte da empresa enviado pelo front-end
            registro_nacional_transportador,
            cnh,
            cnh_categoria,
            cnh_validade
        } = req.body;

        console.log('Cadastro - Tipo recebido:', tipo_usuario);
        console.log('Inscricao Estadual:', inscricao_estadual);
        console.log('Porte da Empresa:', porte_empresa);
        console.log('Registro Nacional Transportador:', registro_nacional_transportador);

        // Validações básicas
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

        // Inserir na tabela específica de acordo com o tipo
        if (tipo_usuario === 'embarcador') {
            // ATUALIZADO: Agora salvando a inscricao_estadual e o porte_empresa juntos
            await db.query(
                'INSERT INTO embarcadores (pessoa_id, inscricao_estadual, porte_empresa) VALUES (?, ?, ?)',
                [pessoaId, inscricao_estadual || null, porte_empresa || null]
            );
            console.log('Embarcador criado com sucesso com Inscrição Estadual e Porte');

        } else if (tipo_usuario === 'frota') {
            await db.query(
                `INSERT INTO transportadores 
                 (pessoa_id, tipo_transportador, inscricao_estadual, registro_nacional_transportador) 
                 VALUES (?, ?, ?, ?)`,
                [pessoaId, 'FROTA', inscricao_estadual || null, registro_nacional_transportador || null]
            );
            console.log('Frota criada');

        } else if (tipo_usuario === 'autonomo') {
            // Salvando os dados de CNH diretamente na tabela transportadores conforme ajuste anterior
            await db.query(
                `INSERT INTO transportadores 
                 (pessoa_id, tipo_transportador, registro_nacional_transportador, cnh, cnh_categoria, cnh_validade) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    pessoaId, 
                    'AUTONOMO', 
                    registro_nacional_transportador || null, 
                    cnh || null, 
                    cnh_categoria || null, 
                    cnh_validade || null
                ]
            );
            console.log('Autônomo criado com sucesso com os dados de CNH direto em transportadores');

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
                "SELECT id FROM transportadores WHERE tipo_transportador = 'FROTA' LIMIT 1"
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

        // Detectar o tipo correto para geração do token correto
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

        // 3. Identifica o Tipo de Usuário e captura o ID da tabela específica
        let tipo = 'usuario';
        let perfil_id = null; 
        
        if (user.is_admin) {
            tipo = 'admin';
        } else {
            const [embarcador] = await db.query('SELECT id FROM embarcadores WHERE pessoa_id = ?', [user.id]);
            if (embarcador.length > 0) {
                tipo = 'embarcador';
                perfil_id = embarcador[0].id;
            }

            const [transportador] = await db.query('SELECT id, tipo_transportador FROM transportadores WHERE pessoa_id = ?', [user.id]);
            if (transportador.length > 0) {
                tipo = transportador[0].tipo_transportador === 'FROTA' ? 'frota' : 'autonomo';
                perfil_id = transportador[0].id;
            }

            const [vinculado] = await db.query('SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?', [user.id]);
            if (vinculado.length > 0) {
                tipo = 'vinculado';
                perfil_id = vinculado[0].id;
            }
        }

        console.log(`🔑 Usuário [${user.email}] logado. Tipo detectado: ${tipo.toUpperCase()} | Perfil ID específico: ${perfil_id}`);

        const token = generateToken(user.id, user.email, tipo);

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                perfil_id: perfil_id,
                nome: user.nome_razao_social,
                email: user.email,
                tipo,
                status: user.status,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, tipo_pessoa, nome_razao_social, email, telefone, status, is_admin FROM pessoas WHERE id = ?',
            [req.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = users[0];

        let tipo = 'usuario';
        let perfil_id = null; 
        
        if (user.is_admin) {
            tipo = 'admin';
        } else {
            const [embarcador] = await db.query('SELECT id FROM embarcadores WHERE pessoa_id = ?', [user.id]);
            if (embarcador.length > 0) {
                tipo = 'embarcador';
                perfil_id = embarcador[0].id;
            }

            const [transportador] = await db.query('SELECT id, tipo_transportador FROM transportadores WHERE pessoa_id = ?', [user.id]);
            if (transportador.length > 0) {
                tipo = transportador[0].tipo_transportador === 'FROTA' ? 'frota' : 'autonomo';
                perfil_id = transportador[0].id;
            }

            const [vinculado] = await db.query('SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?', [user.id]);
            if (vinculado.length > 0) {
                tipo = 'vinculado';
                perfil_id = vinculado[0].id;
            }
        }

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

const ensureRecoveryTableExists = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS recuperacao_senha (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pessoa_id INT NOT NULL,
                codigo VARCHAR(6) NOT NULL,
                expiracao DATETIME NOT NULL,
                usado TINYINT(1) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    } catch (e) {
        console.warn('Aviso: erro ao verificar/criar tabela recuperacao_senha:', e.message);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'E-mail é obrigatório' });
        }

        const [users] = await db.query('SELECT id, nome_razao_social, email FROM pessoas WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'E-mail não encontrado no sistema' });
        }

        const user = users[0];
        
        // Gerar código de 6 dígitos aleatório
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        await ensureRecoveryTableExists();

        // Inserir registro com 15 minutos de validade
        await db.query(
            `INSERT INTO recuperacao_senha (pessoa_id, codigo, expiracao, usado)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)`,
            [user.id, codigo]
        );

        console.log(`🔑 Código de recuperação gerado para [${email}]: ${codigo}`);

        res.json({
            message: 'Código de verificação enviado com sucesso!',
            email: user.email,
            codigo: codigo
        });
    } catch (error) {
        console.error('Erro em forgotPassword:', error);
        res.status(500).json({ error: error.message || 'Erro interno ao solicitar recuperação de senha' });
    }
};

const verifyCode = async (req, res) => {
    try {
        const { email, codigo } = req.body;
        if (!email || !codigo) {
            return res.status(400).json({ error: 'E-mail e código são obrigatórios' });
        }

        const [users] = await db.query('SELECT id FROM pessoas WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userId = users[0].id;

        await ensureRecoveryTableExists();

        const [records] = await db.query(
            `SELECT id FROM recuperacao_senha 
             WHERE pessoa_id = ? AND codigo = ? AND usado = 0 AND expiracao > NOW()
             ORDER BY id DESC LIMIT 1`,
            [userId, codigo]
        );

        if (records.length === 0) {
            return res.status(400).json({ error: 'Código de verificação inválido ou expirado' });
        }

        res.json({ message: 'Código verificado com sucesso!', valido: true });
    } catch (error) {
        console.error('Erro em verifyCode:', error);
        res.status(500).json({ error: error.message || 'Erro interno ao verificar código' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, codigo, novaSenha } = req.body;
        if (!email || !codigo || !novaSenha) {
            return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios' });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
        }

        const [users] = await db.query('SELECT id FROM pessoas WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userId = users[0].id;

        await ensureRecoveryTableExists();

        const [records] = await db.query(
            `SELECT id FROM recuperacao_senha 
             WHERE pessoa_id = ? AND codigo = ? AND usado = 0 AND expiracao > NOW()
             ORDER BY id DESC LIMIT 1`,
            [userId, codigo]
        );

        if (records.length === 0) {
            return res.status(400).json({ error: 'Código de verificação inválido ou expirado' });
        }

        const recoveryId = records[0].id;

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha na tabela pessoas
        await db.query('UPDATE pessoas SET senha = ? WHERE id = ?', [hashedPassword, userId]);

        // Marcar o código de recuperação como usado
        await db.query('UPDATE recuperacao_senha SET usado = 1 WHERE id = ?', [recoveryId]);

        console.log(`✅ Senha redefinida com sucesso para o usuário [${email}]`);

        res.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
    } catch (error) {
        console.error('Erro em resetPassword:', error);
        res.status(500).json({ error: error.message || 'Erro interno ao redefinir senha' });
    }
};

module.exports = { register, login, getMe, forgotPassword, verifyCode, resetPassword };