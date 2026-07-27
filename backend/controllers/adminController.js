// backend/controllers/adminController.js
const db = require('../config/database');

/**
 * ============================================
 * PERFIL DO ADMIN
 * ============================================
 */

// BUSCAR PERFIL DO ADMIN
const getPerfil = async (req, res) => {
    try {
        const adminId = req.userId;

        const query = `
            SELECT 
                p.id, 
                p.nome_razao_social AS nome,
                p.email, 
                p.telefone, 
                p.celular,
                p.cpf_cnpj,
                p.tipo_pessoa,
                p.data_cadastro,
                p.is_admin
            FROM pessoas p
            WHERE p.id = ? AND p.is_admin = TRUE
        `;

        const [rows] = await db.execute(query, [adminId]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Perfil de administrador não encontrado.' 
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Erro ao buscar perfil do admin:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor.' 
        });
    }
};

// ATUALIZAR PERFIL DO ADMIN
const atualizarPerfil = async (req, res) => {
    try {
        const adminId = req.userId;
        const { nome_razao_social, telefone, celular } = req.body;

        // Validação básica
        if (!nome_razao_social) {
            return res.status(400).json({
                success: false,
                message: 'Nome é obrigatório'
            });
        }

        // Atualiza dados na tabela pessoas
        const updatePessoa = `
            UPDATE pessoas 
            SET nome_razao_social = ?, 
                telefone = ?, 
                celular = ?
            WHERE id = ? AND is_admin = TRUE
        `;
        
        const [result] = await db.execute(updatePessoa, [
            nome_razao_social, 
            telefone || null, 
            celular || null, 
            adminId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Administrador não encontrado'
            });
        }

        // Buscar dados atualizados
        const [updated] = await db.execute(
            `SELECT id, nome_razao_social, email, telefone, celular, is_admin 
             FROM pessoas WHERE id = ?`,
            [adminId]
        );

        return res.status(200).json({
            success: true,
            message: 'Perfil atualizado com sucesso!',
            data: updated[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil do admin:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno ao atualizar perfil.' 
        });
    }
};

/**
 * ============================================
 * USUÁRIOS - GESTÃO
 * ============================================
 */

// LISTAR USUÁRIOS COM FILTROS
const listarUsuarios = async (req, res) => {
    try {
        const { 
            status, 
            tipo, 
            search, 
            page = 1, 
            limit = 20 
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = [];
        let params = [];

        // Filtro por status
        if (status) {
            whereConditions.push('p.status = ?');
            params.push(status);
        }

        // Filtro por tipo de usuário
        if (tipo) {
            switch(tipo) {
                case 'EMBARCADOR':
                    whereConditions.push('e.id IS NOT NULL');
                    break;
                case 'FROTA':
                    whereConditions.push('t.id IS NOT NULL AND t.tipo_transportador = "FROTA"');
                    break;
                case 'AUTONOMO':
                    whereConditions.push('t.id IS NOT NULL AND t.tipo_transportador = "AUTONOMO"');
                    break;
                case 'VINCULADO':
                    whereConditions.push('mv.id IS NOT NULL');
                    break;
                case 'ADMIN':
                    whereConditions.push('p.is_admin = TRUE');
                    break;
            }
        }

        // Busca por nome, email ou CPF/CNPJ
        if (search) {
            whereConditions.push('(p.nome_razao_social LIKE ? OR p.email LIKE ? OR p.cpf_cnpj LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Query principal
        const query = `
            SELECT 
                p.id,
                p.nome_razao_social,
                p.nome_fantasia,
                p.cpf_cnpj,
                p.email,
                p.telefone,
                p.celular,
                p.tipo_pessoa,
                p.status,
                p.data_cadastro,
                p.is_admin,
                p.tipo_vinculo_motorista,
                
                e.id AS embarcador_id,
                e.porte_empresa,
                e.score_credito,
                
                t.id AS transportador_id,
                t.tipo_transportador,
                t.avaliacao_media,
                t.total_avaliacoes,
                t.quantidade_veiculos,
                
                mv.id AS motorista_vinculado_id,
                mv.cnh,
                mv.cnh_categoria,
                mv.status AS status_motorista,
                mv.data_admissao
                
            FROM pessoas p
            LEFT JOIN embarcadores e ON p.id = e.pessoa_id
            LEFT JOIN transportadores t ON p.id = t.pessoa_id
            LEFT JOIN motoristas_vinculados mv ON p.id = mv.pessoa_id
            ${whereClause}
            ORDER BY p.data_cadastro DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.execute(query, params);

        // Contagem total para paginação
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM pessoas p
            LEFT JOIN embarcadores e ON p.id = e.pessoa_id
            LEFT JOIN transportadores t ON p.id = t.pessoa_id
            LEFT JOIN motoristas_vinculados mv ON p.id = mv.pessoa_id
            ${whereClause}
        `;

        const countParams = params.slice(0, -2);
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        // Mapear usuários com tipo
        const usuarios = rows.map(row => {
            let tipoUsuario = 'USUARIO';
            
            if (row.is_admin) {
                tipoUsuario = 'ADMIN';
            } else if (row.embarcador_id) {
                tipoUsuario = 'EMBARCADOR';
            } else if (row.transportador_id) {
                tipoUsuario = row.tipo_transportador === 'FROTA' ? 'FROTA' : 'AUTONOMO';
            } else if (row.motorista_vinculado_id) {
                tipoUsuario = 'VINCULADO';
            }

            return {
                id: row.id,
                nome_razao_social: row.nome_razao_social,
                nome_fantasia: row.nome_fantasia,
                cpf_cnpj: row.cpf_cnpj,
                email: row.email,
                telefone: row.telefone,
                celular: row.celular,
                tipo_pessoa: row.tipo_pessoa,
                status: row.status,
                data_cadastro: row.data_cadastro,
                is_admin: !!row.is_admin,
                tipo_usuario: tipoUsuario,
                
                embarcador: row.embarcador_id ? {
                    id: row.embarcador_id,
                    porte_empresa: row.porte_empresa,
                    score_credito: row.score_credito
                } : null,
                
                transportador: row.transportador_id ? {
                    id: row.transportador_id,
                    tipo_transportador: row.tipo_transportador,
                    avaliacao_media: row.avaliacao_media,
                    total_avaliacoes: row.total_avaliacoes,
                    quantidade_veiculos: row.quantidade_veiculos
                } : null,
                
                motorista_vinculado: row.motorista_vinculado_id ? {
                    id: row.motorista_vinculado_id,
                    cnh: row.cnh,
                    cnh_categoria: row.cnh_categoria,
                    status: row.status_motorista,
                    data_admissao: row.data_admissao
                } : null
            };
        });

        res.json({
            success: true,
            data: usuarios,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar usuários'
        });
    }
};

// BUSCAR USUÁRIO POR ID
const buscarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.id,
                p.nome_razao_social,
                p.nome_fantasia,
                p.cpf_cnpj,
                p.email,
                p.telefone,
                p.celular,
                p.tipo_pessoa,
                p.status,
                p.data_cadastro,
                p.observacoes,
                p.is_admin,
                p.tipo_vinculo_motorista,
                p.data_vinculo,
                p.data_desvinculo,
                
                e.id AS embarcador_id,
                e.inscricao_estadual,
                e.porte_empresa,
                e.score_credito,
                e.limite_credito,
                e.dias_pagamento,
                e.contrato_assinado,
                e.data_aprovacao,
                
                t.id AS transportador_id,
                t.tipo_transportador,
                t.registro_nacional_transportador,
                t.inscricao_estadual AS transportador_ie,
                t.possui_veiculo_proprio,
                t.quantidade_veiculos,
                t.area_atuacao,
                t.tipos_carga,
                t.avaliacao_media,
                t.total_avaliacoes,
                t.verificacao_documental,
                t.data_verificacao,
                
                mv.id AS motorista_vinculado_id,
                mv.cnh,
                mv.cnh_categoria,
                mv.cnh_validade,
                mv.data_admissao,
                mv.data_demissao,
                mv.status AS status_motorista,
                mv.registro_funcionario
                
            FROM pessoas p
            LEFT JOIN embarcadores e ON p.id = e.pessoa_id
            LEFT JOIN transportadores t ON p.id = t.pessoa_id
            LEFT JOIN motoristas_vinculados mv ON p.id = mv.pessoa_id
            WHERE p.id = ?
        `;

        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const row = rows[0];

        let tipoUsuario = 'USUARIO';
        if (row.is_admin) {
            tipoUsuario = 'ADMIN';
        } else if (row.embarcador_id) {
            tipoUsuario = 'EMBARCADOR';
        } else if (row.transportador_id) {
            tipoUsuario = row.tipo_transportador === 'FROTA' ? 'FROTA' : 'AUTONOMO';
        } else if (row.motorista_vinculado_id) {
            tipoUsuario = 'VINCULADO';
        }

        // Buscar endereços
        const [enderecos] = await db.execute(
            'SELECT * FROM enderecos WHERE pessoa_id = ?',
            [id]
        );

        // Buscar logs (últimos 20)
        const [logs] = await db.execute(
            `SELECT * FROM logs_auditoria 
             WHERE usuario_id = ? 
             ORDER BY data_hora DESC 
             LIMIT 20`,
            [id]
        );

        const usuario = {
            id: row.id,
            nome_razao_social: row.nome_razao_social,
            nome_fantasia: row.nome_fantasia,
            cpf_cnpj: row.cpf_cnpj,
            email: row.email,
            telefone: row.telefone,
            celular: row.celular,
            tipo_pessoa: row.tipo_pessoa,
            status: row.status,
            data_cadastro: row.data_cadastro,
            observacoes: row.observacoes,
            is_admin: !!row.is_admin,
            tipo_usuario: tipoUsuario,
            tipo_vinculo_motorista: row.tipo_vinculo_motorista,
            data_vinculo: row.data_vinculo,
            data_desvinculo: row.data_desvinculo,
            
            enderecos: enderecos,
            logs: logs,

            embarcador: row.embarcador_id ? {
                id: row.embarcador_id,
                inscricao_estadual: row.inscricao_estadual,
                porte_empresa: row.porte_empresa,
                score_credito: row.score_credito,
                limite_credito: row.limite_credito,
                dias_pagamento: row.dias_pagamento,
                contrato_assinado: !!row.contrato_assinado,
                data_aprovacao: row.data_aprovacao
            } : null,

            transportador: row.transportador_id ? {
                id: row.transportador_id,
                tipo_transportador: row.tipo_transportador,
                registro_nacional_transportador: row.registro_nacional_transportador,
                inscricao_estadual: row.transportador_ie,
                possui_veiculo_proprio: !!row.possui_veiculo_proprio,
                quantidade_veiculos: row.quantidade_veiculos,
                area_atuacao: row.area_atuacao,
                tipos_carga: row.tipos_carga,
                avaliacao_media: row.avaliacao_media,
                total_avaliacoes: row.total_avaliacoes,
                verificacao_documental: !!row.verificacao_documental,
                data_verificacao: row.data_verificacao
            } : null,

            motorista_vinculado: row.motorista_vinculado_id ? {
                id: row.motorista_vinculado_id,
                cnh: row.cnh,
                cnh_categoria: row.cnh_categoria,
                cnh_validade: row.cnh_validade,
                data_admissao: row.data_admissao,
                data_demissao: row.data_demissao,
                status: row.status_motorista,
                registro_funcionario: row.registro_funcionario
            } : null
        };

        res.json({
            success: true,
            data: usuario
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário'
        });
    }
};

// BLOQUEAR USUÁRIO
const bloquearUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        const adminId = req.userId;

        if (!motivo) {
            return res.status(400).json({
                success: false,
                message: 'Motivo do bloqueio é obrigatório'
            });
        }

        const [user] = await db.execute(
            'SELECT id, status, is_admin FROM pessoas WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        if (user[0].is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Não é possível bloquear um administrador'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE pessoas SET status = "BLOQUEADO" WHERE id = ?',
            [id]
        );

        // Registrar na blacklist
        await connection.execute(
            `INSERT INTO blacklist (pessoa_id, tipo, motivo, incluido_por) 
             VALUES (?, ?, ?, ?)`,
            [id, 'MOTORISTA', motivo, adminId]
        );

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Usuário bloqueado com sucesso'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Erro ao bloquear usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao bloquear usuário'
        });
    }
};

// DESBLOQUEAR USUÁRIO
const desbloquearUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.userId;

        const [user] = await db.execute(
            'SELECT id, status, is_admin FROM pessoas WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        if (user[0].is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Operação inválida para administrador'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE pessoas SET status = "APROVADO" WHERE id = ?',
            [id]
        );

        // Remover da blacklist
        await connection.execute(
            'DELETE FROM blacklist WHERE pessoa_id = ?',
            [id]
        );

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Usuário desbloqueado com sucesso'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Erro ao desbloquear usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao desbloquear usuário'
        });
    }
};

// APROVAR USUÁRIO
const aprovarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await db.execute(
            'SELECT id FROM pessoas WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        await db.execute(
            'UPDATE pessoas SET status = "APROVADO" WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Usuário aprovado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao aprovar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao aprovar usuário'
        });
    }
};

// REPROVAR USUÁRIO
const reprovarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        if (!motivo) {
            return res.status(400).json({
                success: false,
                message: 'Motivo da reprovação é obrigatório'
            });
        }

        const [user] = await db.execute(
            'SELECT id FROM pessoas WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        await db.execute(
            'UPDATE pessoas SET status = "REPROVADO", observacoes = ? WHERE id = ?',
            [motivo, id]
        );

        res.json({
            success: true,
            message: 'Usuário reprovado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao reprovar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao reprovar usuário'
        });
    }
};

// ALTERAR ROLE
const alterarRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Não é possível transformar um usuário em administrador pelo sistema'
            });
        }

        const [user] = await db.execute(
            'SELECT id, is_admin FROM pessoas WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        if (user[0].is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Não é possível alterar um administrador'
            });
        }

        const rolesPermitidas = ['EMBARCADOR', 'FROTA', 'AUTONOMO'];
        if (!rolesPermitidas.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role inválido'
            });
        }

        await db.beginTransaction();

        // Remover papéis antigos
        await db.execute('DELETE FROM embarcadores WHERE pessoa_id = ?', [id]);
        await db.execute('DELETE FROM transportadores WHERE pessoa_id = ?', [id]);
        await db.execute('DELETE FROM motoristas_vinculados WHERE pessoa_id = ?', [id]);

        // Adicionar novo papel
        switch(role) {
            case 'EMBARCADOR':
                await db.execute(
                    'INSERT INTO embarcadores (pessoa_id) VALUES (?)',
                    [id]
                );
                break;
            case 'FROTA':
                await db.execute(
                    'INSERT INTO transportadores (pessoa_id, tipo_transportador) VALUES (?, "FROTA")',
                    [id]
                );
                break;
            case 'AUTONOMO':
                await db.execute(
                    'INSERT INTO transportadores (pessoa_id, tipo_transportador) VALUES (?, "AUTONOMO")',
                    [id]
                );
                break;
        }

        // Atualizar tipo_vinculo_motorista
        let tipoVinculo = 'NAO_MOTORISTA';
        if (role === 'AUTONOMO') tipoVinculo = 'AUTONOMO';

        await db.execute(
            'UPDATE pessoas SET tipo_vinculo_motorista = ? WHERE id = ?',
            [tipoVinculo, id]
        );

        await db.commit();

        res.json({
            success: true,
            message: `Papel alterado para ${role} com sucesso`
        });

    } catch (error) {
        await db.rollback();
        console.error('Erro ao alterar role:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar papel do usuário'
        });
    }
};

/**
 * ============================================
 * FRETES - GESTÃO ADMIN
 * ============================================
 */

// LISTAR FRETES
const listarFretes = async (req, res) => {
    try {
        const { status, search, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let whereConditions = [];
        let params = [];

        if (status) {
            whereConditions.push('f.status = ?');
            params.push(status);
        }

        if (search) {
            whereConditions.push('(f.codigo_rastreamento LIKE ? OR f.origem_endereco LIKE ? OR f.destino_endereco LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (data_inicio) {
            whereConditions.push('f.data_publicacao >= ?');
            params.push(data_inicio);
        }

        if (data_fim) {
            whereConditions.push('f.data_publicacao <= ?');
            params.push(data_fim);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT 
                f.*,
                p_emb.nome_razao_social AS embarcador_nome,
                p_emb.email AS embarcador_email,
                p_trans.nome_razao_social AS transportador_nome,
                p_trans.email AS transportador_email,
                v.placa,
                v.modelo AS veiculo_modelo
            FROM fretes f
            LEFT JOIN pessoas p_emb ON f.embarcador_id = p_emb.id
            LEFT JOIN pessoas p_trans ON f.transportador_id = p_trans.id
            LEFT JOIN veiculos v ON f.veiculo_id = v.id
            ${whereClause}
            ORDER BY f.data_publicacao DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), parseInt(offset));
        const [rows] = await db.execute(query, params);

        const countQuery = `
            SELECT COUNT(*) as total FROM fretes f ${whereClause}
        `;
        const countParams = params.slice(0, -2);
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        const fretes = rows.map(f => ({
            id: f.id,
            codigo_rastreamento: f.codigo_rastreamento,
            origem_endereco: f.origem_endereco,
            destino_endereco: f.destino_endereco,
            status: f.status,
            prioridade: f.prioridade,
            tipo_carga: f.tipo_carga,
            peso_kg: f.peso_kg,
            volume_m3: f.volume_m3,
            pallets: f.pallets,
            valor_ofertado: f.valor_ofertado,
            valor_fechado: f.valor_fechado,
            valor_comissao: f.valor_comissao,
            valor_adiantamento: f.valor_adiantamento,
            data_publicacao: f.data_publicacao,
            data_coleta_prevista: f.data_coleta_prevista,
            data_coleta_realizada: f.data_coleta_realizada,
            data_entrega_prevista: f.data_entrega_prevista,
            data_entrega_realizada: f.data_entrega_realizada,
            descricao_carga: f.descricao_carga,
            instrucoes_descarga: f.instrucoes_descarga,
            motivo_cancelamento: f.motivo_cancelamento,
            embarcador: f.embarcador_nome ? {
                nome_razao_social: f.embarcador_nome,
                email: f.embarcador_email
            } : null,
            transportador: f.transportador_nome ? {
                nome_razao_social: f.transportador_nome,
                email: f.transportador_email
            } : null,
            veiculo: f.placa ? {
                placa: f.placa,
                modelo: f.veiculo_modelo
            } : null
        }));

        res.json({
            success: true,
            data: fretes,
            total,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar fretes (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar fretes'
        });
    }
};

// BUSCAR FRETE POR ID
const buscarFrete = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                f.*,
                p_emb.nome_razao_social AS embarcador_nome,
                p_emb.email AS embarcador_email,
                p_trans.nome_razao_social AS transportador_nome,
                p_trans.email AS transportador_email,
                v.placa,
                v.modelo AS veiculo_modelo,
                v.marca AS veiculo_marca,
                v.ano_fabricacao,
                v.cor
            FROM fretes f
            LEFT JOIN pessoas p_emb ON f.embarcador_id = p_emb.id
            LEFT JOIN pessoas p_trans ON f.transportador_id = p_trans.id
            LEFT JOIN veiculos v ON f.veiculo_id = v.id
            WHERE f.id = ?
        `;

        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Frete não encontrado'
            });
        }

        const f = rows[0];

        const frete = {
            id: f.id,
            codigo_rastreamento: f.codigo_rastreamento,
            origem_cep: f.origem_cep,
            origem_endereco: f.origem_endereco,
            destino_cep: f.destino_cep,
            destino_endereco: f.destino_endereco,
            status: f.status,
            prioridade: f.prioridade,
            tipo_carga: f.tipo_carga,
            peso_kg: f.peso_kg,
            volume_m3: f.volume_m3,
            pallets: f.pallets,
            valor_ofertado: f.valor_ofertado,
            valor_fechado: f.valor_fechado,
            valor_comissao: f.valor_comissao,
            valor_adiantamento: f.valor_adiantamento,
            data_publicacao: f.data_publicacao,
            data_coleta_prevista: f.data_coleta_prevista,
            data_coleta_realizada: f.data_coleta_realizada,
            data_entrega_prevista: f.data_entrega_prevista,
            data_entrega_realizada: f.data_entrega_realizada,
            descricao_carga: f.descricao_carga,
            instrucoes_descarga: f.instrucoes_descarga,
            motivo_cancelamento: f.motivo_cancelamento,
            embarcador: f.embarcador_nome ? {
                nome_razao_social: f.embarcador_nome,
                email: f.embarcador_email
            } : null,
            transportador: f.transportador_nome ? {
                nome_razao_social: f.transportador_nome,
                email: f.transportador_email
            } : null,
            veiculo: f.placa ? {
                placa: f.placa,
                modelo: f.veiculo_modelo,
                marca: f.veiculo_marca,
                ano_fabricacao: f.ano_fabricacao,
                cor: f.cor
            } : null
        };

        res.json({
            success: true,
            data: frete
        });

    } catch (error) {
        console.error('Erro ao buscar frete (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar frete'
        });
    }
};

// CANCELAR FRETE
const cancelarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        if (!motivo) {
            return res.status(400).json({
                success: false,
                message: 'Motivo do cancelamento é obrigatório'
            });
        }

        const [frete] = await db.execute(
            'SELECT id, status FROM fretes WHERE id = ?',
            [id]
        );

        if (frete.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Frete não encontrado'
            });
        }

        if (frete[0].status === 'CANCELADO' || frete[0].status === 'CONCLUIDO') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível cancelar um frete já cancelado ou concluído'
            });
        }

        await db.execute(
            'UPDATE fretes SET status = "CANCELADO", motivo_cancelamento = ? WHERE id = ?',
            [motivo, id]
        );

        res.json({
            success: true,
            message: 'Frete cancelado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao cancelar frete (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cancelar frete'
        });
    }
};

/**
 * ============================================
 * BLACKLIST - GESTÃO
 * ============================================
 */

// LISTAR BLACKLIST
const listarBlacklist = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.id,
                b.pessoa_id,
                b.tipo,
                b.motivo,
                b.data_inclusao,
                b.data_expiracao,
                b.incluido_por,
                p.nome_razao_social AS pessoa_nome,
                p.email AS pessoa_email
            FROM blacklist b
            JOIN pessoas p ON b.pessoa_id = p.id
            ORDER BY b.data_inclusao DESC
        `;

        const [rows] = await db.execute(query);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Erro ao listar blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar blacklist'
        });
    }
};

// ADICIONAR À BLACKLIST
const adicionarBlacklist = async (req, res) => {
    try {
        const { pessoa_id, tipo, motivo, data_expiracao } = req.body;
        const adminId = req.userId;

        if (!pessoa_id || !motivo) {
            return res.status(400).json({
                success: false,
                message: 'Usuário e motivo são obrigatórios'
            });
        }

        const [user] = await db.execute(
            'SELECT id, is_admin FROM pessoas WHERE id = ?',
            [pessoa_id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        if (user[0].is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Não é possível adicionar um administrador à blacklist'
            });
        }

        await db.execute(
            `INSERT INTO blacklist (pessoa_id, tipo, motivo, data_expiracao, incluido_por) 
             VALUES (?, ?, ?, ?, ?)`,
            [pessoa_id, tipo || 'MOTORISTA', motivo, data_expiracao || null, adminId]
        );

        await db.execute(
            'UPDATE pessoas SET status = "BLOQUEADO" WHERE id = ?',
            [pessoa_id]
        );

        res.json({
            success: true,
            message: 'Usuário adicionado à blacklist com sucesso'
        });

    } catch (error) {
        console.error('Erro ao adicionar à blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao adicionar à blacklist'
        });
    }
};

// REMOVER DA BLACKLIST
const removerBlacklist = async (req, res) => {
    try {
        const { id } = req.params;

        const [item] = await db.execute(
            'SELECT * FROM blacklist WHERE id = ?',
            [id]
        );

        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado na blacklist'
            });
        }

const pessoaId = item[0].pessoa_id;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute('DELETE FROM blacklist WHERE id = ?', [id]);

        await connection.execute(
            'UPDATE pessoas SET status = "APROVADO" WHERE id = ?',
            [pessoaId]
        );

await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Usuário removido da blacklist com sucesso'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Erro ao remover da blacklist:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao remover da blacklist'
        });
    }
};

/**
 * ============================================
 * VEÍCULOS - GESTÃO ADMIN
 * ============================================
 */

// LISTAR VEÍCULOS
const listarVeiculos = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let whereConditions = [];
        let params = [];

        if (search) {
            whereConditions.push('(v.placa LIKE ? OR v.modelo LIKE ? OR v.marca LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT 
                v.*,
                p.nome_razao_social AS proprietario_nome,
                p.email AS proprietario_email,
                p.cpf_cnpj AS proprietario_cpf_cnpj
            FROM veiculos v
            LEFT JOIN pessoas p ON v.proprietario_id = p.id
            ${whereClause}
            ORDER BY v.data_cadastro DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), parseInt(offset));
        const [rows] = await db.execute(query, params);

        const countQuery = `
            SELECT COUNT(*) as total FROM veiculos v ${whereClause}
        `;
        const countParams = params.slice(0, -2);
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        res.json({
            success: true,
            data: rows,
            total,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar veículos (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar veículos'
        });
    }
};

// BUSCAR VEÍCULO POR ID
const buscarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                v.*,
                p.nome_razao_social AS proprietario_nome,
                p.email AS proprietario_email,
                p.cpf_cnpj AS proprietario_cpf_cnpj,
                p.telefone AS proprietario_telefone,
                p.celular AS proprietario_celular
            FROM veiculos v
            LEFT JOIN pessoas p ON v.proprietario_id = p.id
            WHERE v.id = ?
        `;

        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Veículo não encontrado'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar veículo (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar veículo'
        });
    }
};

/**
 * ============================================
 * ESTATÍSTICAS - DASHBOARD ADMIN
 * ============================================
 */

// OBTER ESTATÍSTICAS DO DASHBOARD
const getEstatisticas = async (req, res) => {
    try {
        // Total de usuários por status
        const [usuarios] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN status = 'APROVADO' THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN status = 'BLOQUEADO' THEN 1 ELSE 0 END) as bloqueados,
                SUM(CASE WHEN status = 'REPROVADO' THEN 1 ELSE 0 END) as reprovados
            FROM pessoas
        `);

        // Total de fretes por status
        const [fretes] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ACEITO' THEN 1 ELSE 0 END) as aceitos,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as em_transito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
                SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
                SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO') THEN valor_fechado ELSE 0 END) as faturamento_total
            FROM fretes
        `);

        // Total de veículos
        const [veiculos] = await db.execute(`
            SELECT COUNT(*) as total FROM veiculos
        `);

        // Taxa de ocupação
        const [ocupacao] = await db.execute(`
            SELECT 
                (COUNT(DISTINCT CASE WHEN f.status IN ('ACEITO', 'TRANSITO') THEN f.veiculo_id END) / 
                 NULLIF(COUNT(DISTINCT v.id), 0) * 100) as taxa_ocupacao
            FROM veiculos v
            LEFT JOIN fretes f ON v.id = f.veiculo_id
        `);

        // Dados por mês (últimos 12 meses)
        const [dadosPorMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_cadastro, '%Y-%m') as mes,
                COUNT(*) as usuarios
            FROM pessoas
            WHERE data_cadastro >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY mes
            ORDER BY mes
        `);

        const [fretesPorMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_publicacao, '%Y-%m') as mes,
                COUNT(*) as fretes
            FROM fretes
            WHERE data_publicacao >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY mes
            ORDER BY mes
        `);

        // Combinar dados por mês
        const mesesMap = {};
        dadosPorMes.forEach(item => {
            mesesMap[item.mes] = { mes: item.mes, usuarios: item.usuarios, fretes: 0 };
        });
        fretesPorMes.forEach(item => {
            if (!mesesMap[item.mes]) {
                mesesMap[item.mes] = { mes: item.mes, usuarios: 0, fretes: 0 };
            }
            mesesMap[item.mes].fretes = item.fretes;
        });

        // Atividades recentes
        const [atividades] = await db.execute(`
            (SELECT 'novo_usuario' as tipo, p.nome_razao_social as descricao, p.data_cadastro as data
             FROM pessoas p ORDER BY p.data_cadastro DESC LIMIT 5)
            UNION ALL
            (SELECT 'novo_frete' as tipo, CONCAT('Frete #', f.id) as descricao, f.data_publicacao as data
             FROM fretes f ORDER BY f.data_publicacao DESC LIMIT 5)
            ORDER BY data DESC LIMIT 10
        `);

        // Alertas
        const [docPendentes] = await db.execute(`
            SELECT COUNT(*) as total FROM documentos WHERE status = 'PENDENTE'
        `);

        const [blacklistCount] = await db.execute(`
            SELECT COUNT(*) as total FROM blacklist
        `);

        const stats = {
            usuarios: usuarios[0] || { total: 0, pendentes: 0, aprovados: 0, bloqueados: 0, reprovados: 0 },
            fretes: fretes[0] || { total: 0, aceitos: 0, em_transito: 0, concluidos: 0, cancelados: 0, faturamento_total: 0 },
            veiculos: { total: veiculos[0]?.total || 0 },
            taxa_ocupacao: Math.round(ocupacao[0]?.taxa_ocupacao || 0),
            dados_por_mes: Object.values(mesesMap),
            atividades_recentes: atividades || [],
            alertas: {
                documentos_pendentes: docPendentes[0]?.total || 0,
                blacklist: blacklistCount[0]?.total || 0
            }
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas'
        });
    }
};

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

module.exports = {
    // Perfil
    getPerfil,
    atualizarPerfil,

    // Usuários
    listarUsuarios,
    buscarUsuario,
    bloquearUsuario,
    desbloquearUsuario,
    aprovarUsuario,
    reprovarUsuario,
    alterarRole,

    // Fretes
    listarFretes,
    buscarFrete,
    cancelarFrete,

    // Blacklist
    listarBlacklist,
    adicionarBlacklist,
    removerBlacklist,

    // Veículos
    listarVeiculos,
    buscarVeiculo,

    // Estatísticas
    getEstatisticas
};
