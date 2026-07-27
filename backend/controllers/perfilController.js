const db = require('../config/database');
const bcrypt = require('bcryptjs'); // Usando bcryptjs idêntico ao seu authController

// BUSCAR PERFIL UNIFICADO
const getPerfilUnificado = async (req, res) => {
    try {
        const userId = req.userId;

        const [userRows] = await db.query(
            `SELECT id, tipo_pessoa, nome_razao_social AS nome, nome_fantasia, 
                    cpf_cnpj, email, telefone, celular, data_cadastro, status, 
                    is_admin 
             FROM pessoas WHERE id = ?`,
            [userId]
        );

        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const dadosBasicos = userRows[0];
        let dadosEspecificos = {};
        let endereco = null;
        let tipoUsuarioResolvido = 'CLIENTE';

        // Identificação lógica alinhada com o login
        if (dadosBasicos.is_admin) {
            tipoUsuarioResolvido = 'ADMINISTRADOR';
        } else {
            const [embarcador] = await db.query('SELECT * FROM embarcadores WHERE pessoa_id = ?', [userId]);
            if (embarcador.length > 0) {
                tipoUsuarioResolvido = 'EMBARCADOR';
                dadosEspecificos = {
                    id: embarcador[0].id,
                    pessoa_id: embarcador[0].pessoa_id,
                    inscricao_estadual: embarcador[0].inscricao_estadual || "-",
                    porte_empresa: embarcador[0].porte_empresa || "-"
                };
            }
            const [transportador] = await db.query('SELECT * FROM transportadores WHERE pessoa_id = ?', [userId]);
            if (transportador.length > 0) {
                tipoUsuarioResolvido = transportador[0].tipo_transportador === 'FROTA' ? 'FROTA' : 'MOTORISTA_AUTONOMO';
                dadosEspecificos = transportador[0];
            }

            const [vinculado] = await db.query('SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?', [userId]);
            if (vinculado.length > 0) {
                tipoUsuarioResolvido = 'MOTORISTA_VINCULADO';
                dadosEspecificos = vinculado[0];
            }
        }

        dadosBasicos.tipo_usuario = tipoUsuarioResolvido;

        // Busca o endereço do usuário
        try {
            const [endRows] = await db.query(
                `SELECT id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal 
                 FROM enderecos WHERE pessoa_id = ?`, [userId]
            );
            if (endRows && endRows.length > 0) endereco = endRows[0];
        } catch (err) {}

        // Tratamento de buscas complementares (Veículos)
        if (tipoUsuarioResolvido === 'MOTORISTA_AUTONOMO') {
            // Como a CNH já veio no SELECT * FROM transportadores, buscamos apenas o veículo
            const [veiculoRows] = await db.query(
                'SELECT placa, modelo, marca FROM veiculos WHERE transportador_id = ? LIMIT 1', 
                [dadosEspecificos.id]
            );
            if (veiculoRows && veiculoRows.length > 0) {
                dadosEspecificos.veiculo = veiculoRows[0];
            }
        } 
        else if (tipoUsuarioResolvido === 'MOTORISTA_VINCULADO') {
            const [movRows] = await db.query(
                `SELECT mv.*, pf.nome_razao_social AS frota_vinculada FROM motoristas_vinculados mv
                 LEFT JOIN transportadores t ON mv.transportador_id = t.id
                 LEFT JOIN pessoas pf ON t.pessoa_id = pf.id WHERE mv.pessoa_id = ?`, 
                [userId]
            );
            if (movRows && movRows.length > 0) dadosEspecificos = movRows[0];
        }

        res.json({
            data: {
                ...dadosBasicos,
                especifico: dadosEspecificos,
                endereco: endereco
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno ao buscar dados do perfil' });
    }
};

// ATUALIZAR DADOS DO PERFIL (E SALVAR CNH NA TABELA CORRETA)
const updatePerfil = async (req, res) => {
    try {
        const userId = req.userId;
        const { nome, nome_fantasia, telefone, celular, cnh, cnh_categoria, cnh_validade } = req.body;

        // 1. Atualiza a tabela base 'pessoas'
        await db.query(
            `UPDATE pessoas 
             SET nome_razao_social = ?, nome_fantasia = ?, telefone = ?, celular = ? 
             WHERE id = ?`,
            [nome, nome_fantasia, telefone || null, celular || null, userId]
        );

        // 2. Verifica se é Motorista Autônomo para salvar a CNH na tabela 'transportadores'
        const [transportador] = await db.query('SELECT id, tipo_transportador FROM transportadores WHERE pessoa_id = ?', [userId]);
        
        if (transportador.length > 0 && transportador[0].tipo_transportador === 'AUTONOMO') {
            await db.query(
                `UPDATE transportadores 
                 SET cnh = ?, cnh_categoria = ?, cnh_validade = ? 
                 WHERE pessoa_id = ?`,
                [cnh || null, cnh_categoria || null, cnh_validade || null, userId]
            );
        } 
        // 3. Se for Motorista Vinculado, salva na tabela 'motoristas_vinculados'
        else {
            const [checkMv] = await db.query('SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?', [userId]);
            if (checkMv.length > 0) {
                await db.query(
                    `UPDATE motoristas_vinculados 
                     SET cnh = ?, cnh_categoria = ?, cnh_validade = ? 
                     WHERE pessoa_id = ?`,
                    [cnh || null, cnh_categoria || null, cnh_validade || null, userId]
                );
            }
        }

        res.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar os dados do perfil' });
    }
};

// ALTERAR SENHA
const alterarSenha = async (req, res) => {
    try {
        const userId = req.userId;
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ error: 'Preencha todos os campos de senha.' });
        }

        const [user] = await db.query('SELECT senha FROM pessoas WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const senhaCorreta = await bcrypt.compare(senhaAtual, user[0].senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'A senha atual está incorreta.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await db.query('UPDATE pessoas SET senha = ? WHERE id = ?', [novaSenhaHash, userId]);

        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno ao alterar a senha.' });
    }
};

module.exports = { getPerfilUnificado, updatePerfil, alterarSenha };