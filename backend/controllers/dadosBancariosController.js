// controllers/dadosBancariosController.js
const db = require('../config/database');

const listar = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM dados_bancarios WHERE pessoa_id = ? ORDER BY principal DESC',
            [req.userId]
        );
        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar dados bancários:', error);
        res.status(500).json({ error: 'Erro ao listar dados bancários' });
    }
};

const buscarPrincipal = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM dados_bancarios WHERE pessoa_id = ? AND principal = true',
            [req.userId]
        );
        res.json({ data: rows[0] || null });
    } catch (error) {
        console.error('Erro ao buscar dados bancários principais:', error);
        res.status(500).json({ error: 'Erro ao buscar dados bancários principais' });
    }
};

const criar = async (req, res) => {
    try {
        const { 
            banco, 
            agencia, 
            conta, 
            digito, 
            tipo_conta, 
            pix_chave, 
            pix_tipo, 
            titular, 
            cpf_cnpj_titular, 
            principal 
        } = req.body;

        // Validar campos obrigatórios
        if (!banco || !agencia || !conta || !titular) {
            return res.status(400).json({ 
                error: 'Banco, agência, conta e titular são obrigatórios' 
            });
        }

        // Se for principal, desmarcar os outros
        if (principal) {
            await db.query(
                'UPDATE dados_bancarios SET principal = false WHERE pessoa_id = ?',
                [req.userId]
            );
        }

        const [result] = await db.query(`
            INSERT INTO dados_bancarios 
            (pessoa_id, banco, agencia, conta, digito, tipo_conta, pix_chave, pix_tipo, titular, cpf_cnpj_titular, principal) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.userId, 
            banco, 
            agencia, 
            conta, 
            digito || null, 
            tipo_conta || 'CORRENTE', 
            pix_chave || null, 
            pix_tipo || null, 
            titular, 
            cpf_cnpj_titular || null, 
            principal || false
        ]);

        res.status(201).json({ 
            message: 'Dados bancários salvos com sucesso', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao salvar dados bancários:', error);
        res.status(500).json({ error: 'Erro ao salvar dados bancários' });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            banco, 
            agencia, 
            conta, 
            digito, 
            tipo_conta, 
            pix_chave, 
            pix_tipo, 
            titular, 
            cpf_cnpj_titular, 
            principal 
        } = req.body;

        // Verificar se o registro pertence ao usuário
        const [dados] = await db.query(
            'SELECT pessoa_id FROM dados_bancarios WHERE id = ?',
            [id]
        );

        if (dados.length === 0) {
            return res.status(404).json({ error: 'Dados bancários não encontrados' });
        }

        if (dados[0].pessoa_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        // Se for principal, desmarcar os outros
        if (principal) {
            await db.query(
                'UPDATE dados_bancarios SET principal = false WHERE pessoa_id = ? AND id != ?',
                [req.userId, id]
            );
        }

        await db.query(`
            UPDATE dados_bancarios SET 
                banco = ?, 
                agencia = ?, 
                conta = ?, 
                digito = ?, 
                tipo_conta = ?, 
                pix_chave = ?, 
                pix_tipo = ?, 
                titular = ?, 
                cpf_cnpj_titular = ?, 
                principal = ?
            WHERE id = ?
        `, [
            banco, 
            agencia, 
            conta, 
            digito || null, 
            tipo_conta || 'CORRENTE', 
            pix_chave || null, 
            pix_tipo || null, 
            titular, 
            cpf_cnpj_titular || null, 
            principal || false, 
            id
        ]);

        res.json({ message: 'Dados bancários atualizados com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar dados bancários:', error);
        res.status(500).json({ error: 'Erro ao atualizar dados bancários' });
    }
};

const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se o registro pertence ao usuário
        const [dados] = await db.query(
            'SELECT pessoa_id FROM dados_bancarios WHERE id = ?',
            [id]
        );

        if (dados.length === 0) {
            return res.status(404).json({ error: 'Dados bancários não encontrados' });
        }

        if (dados[0].pessoa_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await db.query('DELETE FROM dados_bancarios WHERE id = ?', [id]);

        res.json({ message: 'Dados bancários removidos com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar dados bancários:', error);
        res.status(500).json({ error: 'Erro ao deletar dados bancários' });
    }
};

module.exports = { 
    listar, 
    buscarPrincipal, 
    criar, 
    atualizar, 
    deletar 
};