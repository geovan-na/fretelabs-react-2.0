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

const seedResetDatabase = async (req, res) => {
    try {
        const { secret } = req.body || {};
        if (secret !== 'fretelabs-reset-2026') {
            return res.status(403).json({ error: 'Acesso não autorizado para reset' });
        }

        console.log('🔄 Iniciando reset completo do banco de dados via API...');

        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        const tabelas = [
            'recuperacao_senha',
            'avaliacoes',
            'ocorrencias',
            'pagamentos_motoristas',
            'contratos',
            'propostas',
            'candidaturas',
            'fretes',
            'veiculos',
            'motoristas_vinculados',
            'dados_bancarios',
            'documentos',
            'enderecos',
            'notificacoes',
            'blacklist',
            'transportadores',
            'embarcadores',
            'pessoas'
        ];

        for (const t of tabelas) {
            try {
                await db.query(`DELETE FROM ${t}`);
                await db.query(`ALTER TABLE ${t} AUTO_INCREMENT = 1`);
            } catch (err) {
                console.warn(`Aviso ao limpar ${t}:`, err.message);
            }
        }

        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        const senhaPadraoHash = await bcrypt.hash('123456', 10);
        const senhaAdminHash = await bcrypt.hash('senhaSegura123', 10);

        // 1. ADMIN
        const [adminRes] = await db.query(
            `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, cpf_cnpj, email, senha, telefone, status, is_admin)
             VALUES ('PJ', 'Administrador FreteLabs', '00.000.000/0001-00', 'admin@fretelabs.com', ?, '(11) 99999-0000', 'APROVADO', 1)`,
            [senhaAdminHash]
        );

        // 2. EMBARCADOR
        const [embRes] = await db.query(
            `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone, status)
             VALUES ('PJ', 'Geovanna Transportes LTDA', 'Geovanna Transportes', '12.345.678/0001-99', 'embarcador@fretelabs.com', ?, '(62) 98765-4321', 'APROVADO')`,
            [senhaPadraoHash]
        );
        const embarcadorPessoaId = embRes.insertId;
        const [embRecord] = await db.query(
            `INSERT INTO embarcadores (pessoa_id, inscricao_estadual, porte_empresa)
             VALUES (?, '123456789', 'MEDIO')`,
            [embarcadorPessoaId]
        );
        const embarcadorId = embRecord.insertId;

        // 3. FROTA
        const [frotaRes] = await db.query(
            `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone, status)
             VALUES ('PJ', 'Frota Express LTDA', 'Frota Express', '98.765.432/0001-10', 'frota@fretelabs.com', ?, '(11) 91234-5678', 'APROVADO')`,
            [senhaPadraoHash]
        );
        const frotaPessoaId = frotaRes.insertId;
        const [frotaTrans] = await db.query(
            `INSERT INTO transportadores (pessoa_id, tipo_transportador, inscricao_estadual, registro_nacional_transportador)
             VALUES (?, 'FROTA', '987654321', 'RNTRC-12345')`,
            [frotaPessoaId]
        );
        const frotaTransportadorId = frotaTrans.insertId;

        // 4. AUTÔNOMO
        const [autoRes] = await db.query(
            `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, cpf_cnpj, email, senha, telefone, status)
             VALUES ('PF', 'Joao Carlos Silva', '123.456.789-00', 'autonomo@fretelabs.com', ?, '(31) 99876-5432', 'APROVADO')`,
            [senhaPadraoHash]
        );
        const autonomoPessoaId = autoRes.insertId;
        const [autoTrans] = await db.query(
            `INSERT INTO transportadores (pessoa_id, tipo_transportador, registro_nacional_transportador, cnh, cnh_categoria, cnh_validade)
             VALUES (?, 'AUTONOMO', 'RNTRC-67890', '12345678900', 'E', '2028-12-31')`,
            [autonomoPessoaId]
        );
        const autonomoTransportadorId = autoTrans.insertId;

        // 5. MOTORISTA VINCULADO (vinculado à Frota)
        const [vincRes] = await db.query(
            `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, cpf_cnpj, email, senha, telefone, status)
             VALUES ('PF', 'Pedro Motorista Santos', '987.654.321-00', 'vinculado3@fretelabs.com', ?, '(21) 97654-3210', 'APROVADO')`,
            [senhaPadraoHash]
        );
        const vinculadoPessoaId = vincRes.insertId;
        const [vincRecord] = await db.query(
            `INSERT INTO motoristas_vinculados (pessoa_id, transportador_id, cnh, cnh_categoria, cnh_validade, data_admissao, status)
             VALUES (?, ?, '98765432100', 'D', '2027-06-30', NOW(), 'ATIVO')`,
            [vinculadoPessoaId, frotaTransportadorId]
        );
        const motoristaVinculadoId = vincRecord.insertId;

        // 6. Veículo para a Frota com motorista vinculado
        const [veicFrota] = await db.query(
            `INSERT INTO veiculos (transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status, motorista_vinculado_id)
             VALUES (?, 'ABC-1234', 'Volvo FH 540', 'Volvo', 2022, 25000, 'BAU', 'CARRETA', 'ATIVO', ?)`,
            [frotaTransportadorId, motoristaVinculadoId]
        );
        const veiculoFrotaId = veicFrota.insertId;

        // 7. Veículo para o Autônomo
        await db.query(
            `INSERT INTO veiculos (transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status)
             VALUES (?, 'XYZ-9876', 'Scania R450', 'Scania', 2021, 22000, 'SIDER', 'TRUCK', 'ATIVO')`,
            [autonomoTransportadorId]
        );

        // 8. Frete 1: CONCLUIDO (para poder avaliar e ver histórico)
        await db.query(
            `INSERT INTO fretes (
                embarcador_id, transportador_id, veiculo_id, motorista_vinculado_id,
                origem_cep, origem_endereco, destino_cep, destino_endereco,
                tipo_carga, descricao_carga, peso_kg, volume_m3, valor_ofertado, valor_fechado,
                data_publicacao, data_coleta_prevista, data_entrega_prevista, status
            ) VALUES (
                ?, ?, ?, ?,
                '74000-000', 'Avenida Anhanguera, 5000, Goiânia - GO', '80010-000', 'Rua José Loureiro, 120, Curitiba - PR',
                'ELETRONICOS', 'Carga de componentes eletrônicos', 18500.00, 45.00, 12800.00, 12800.00,
                NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 2 DAY, 'CONCLUIDO'
            )`,
            [embarcadorId, frotaTransportadorId, veiculoFrotaId, motoristaVinculadoId]
        );

        // 9. Frete 2: AGUARDANDO (para candidaturas e busca de fretes)
        await db.query(
            `INSERT INTO fretes (
                embarcador_id,
                origem_cep, origem_endereco, destino_cep, destino_endereco,
                tipo_carga, descricao_carga, peso_kg, volume_m3, valor_ofertado,
                data_publicacao, data_coleta_prevista, data_entrega_prevista, status
            ) VALUES (
                ?,
                '74000-000', 'Setor Central, Goiânia - GO', '01000-000', 'Centro, São Paulo - SP',
                'ALIMENTOS', 'Carga refrigerada de laticínios', 12000.00, 30.00, 6500.00,
                NOW(), NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 5 DAY, 'AGUARDANDO'
            )`,
            [embarcadorId]
        );

        console.log('✅ Banco de dados resetado e usuários criados com sucesso!');

        res.json({
            success: true,
            message: 'Banco de dados limpo e 5 usuários recriados com sucesso!',
            usuarios: [
                { role: 'admin', email: 'admin@fretelabs.com', senha: 'senhaSegura123' },
                { role: 'embarcador', email: 'embarcador@fretelabs.com', senha: '123456' },
                { role: 'frota', email: 'frota@fretelabs.com', senha: '123456' },
                { role: 'autonomo', email: 'autonomo@fretelabs.com', senha: '123456' },
                { role: 'vinculado', email: 'vinculado3@fretelabs.com', senha: '123456' }
            ]
        });
    } catch (err) {
        console.error('Erro no seedResetDatabase:', err);
        res.status(500).json({ error: err.message || 'Erro ao resetar banco' });
    }
};

module.exports = { register, login, getMe, forgotPassword, verifyCode, resetPassword, seedResetDatabase };