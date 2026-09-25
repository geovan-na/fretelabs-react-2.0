/**
 * seed-reset.js - Limpa TODOS os dados do banco e recria 4 usuários + 1 admin
 * 
 * Uso: node seed-reset.js
 */
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function seedReset() {
    console.log('🔄 Iniciando limpeza total do banco de dados...\n');

    // Ordem correta de deleção (respeita foreign keys)
    const tabelasParaLimpar = [
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
        'transportadores',
        'embarcadores',
        'pessoas',
    ];

    // Desabilitar FK checks temporariamente para limpar tudo
    try {
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const tabela of tabelasParaLimpar) {
            try {
                await db.query(`DELETE FROM ${tabela}`);
                await db.query(`ALTER TABLE ${tabela} AUTO_INCREMENT = 1`);
                console.log(`  ✅ Tabela '${tabela}' limpa`);
            } catch (e) {
                console.log(`  ⚠️  Tabela '${tabela}' não encontrada ou erro: ${e.message}`);
            }
        }
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
        console.error('Erro ao limpar tabelas:', e.message);
    }

    console.log('\n📝 Criando usuários...\n');

    const senhaHash = await bcrypt.hash('123456', 10);
    const senhaAdminHash = await bcrypt.hash('senhaSegura123', 10);

    // ============================================================
    // 1. ADMIN
    // ============================================================
    const [adminResult] = await db.query(
        `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, cpf_cnpj, email, senha, telefone, status, is_admin)
         VALUES ('PJ', 'Administrador FreteLabs', '00.000.000/0001-00', 'admin@fretelabs.com', ?, '(11) 99999-0000', 'APROVADO', 1)`,
        [senhaAdminHash]
    );
    console.log(`  ✅ Admin criado (id=${adminResult.insertId}) - admin@fretelabs.com / senhaSegura123`);

    // ============================================================
    // 2. EMBARCADOR
    // ============================================================
    const [embResult] = await db.query(
        `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone, status)
         VALUES ('PJ', 'Geovanna Transportes LTDA', 'Geovanna Transportes', '12.345.678/0001-99', 'embarcador@fretelabs.com', ?, '(62) 98765-4321', 'APROVADO')`,
        [senhaHash]
    );
    const embarcadorPessoaId = embResult.insertId;
    await db.query(
        `INSERT INTO embarcadores (pessoa_id, inscricao_estadual, porte_empresa)
         VALUES (?, '123456789', 'MEDIO')`,
        [embarcadorPessoaId]
    );
    console.log(`  ✅ Embarcador criado (id=${embarcadorPessoaId}) - embarcador@fretelabs.com / 123456`);

    // ============================================================
    // 3. FROTA (transportador tipo FROTA)
    // ============================================================
    const [frotaResult] = await db.query(
        `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone, status)
         VALUES ('PJ', 'Frota Express LTDA', 'Frota Express', '98.765.432/0001-10', 'frota@fretelabs.com', ?, '(11) 91234-5678', 'APROVADO')`,
        [senhaHash]
    );
    const frotaPessoaId = frotaResult.insertId;
    const [frotaTransResult] = await db.query(
        `INSERT INTO transportadores (pessoa_id, tipo_transportador, inscricao_estadual, registro_nacional_transportador)
         VALUES (?, 'FROTA', '987654321', 'RNTRC-12345')`,
        [frotaPessoaId]
    );
    const frotaTransportadorId = frotaTransResult.insertId;
    console.log(`  ✅ Frota criada (id=${frotaPessoaId}, transportador_id=${frotaTransportadorId}) - frota@fretelabs.com / 123456`);

    // ============================================================
    // 4. AUTÔNOMO (transportador tipo AUTONOMO)
    // ============================================================
    const [autoResult] = await db.query(
        `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, cpf_cnpj, email, senha, telefone, status)
         VALUES ('PF', 'Joao Carlos Silva', '123.456.789-00', 'autonomo@fretelabs.com', ?, '(31) 99876-5432', 'APROVADO')`,
        [senhaHash]
    );
    const autonomoPessoaId = autoResult.insertId;
    await db.query(
        `INSERT INTO transportadores (pessoa_id, tipo_transportador, registro_nacional_transportador, cnh, cnh_categoria, cnh_validade)
         VALUES (?, 'AUTONOMO', 'RNTRC-67890', '12345678900', 'E', '2028-12-31')`,
        [autonomoPessoaId]
    );
    console.log(`  ✅ Autônomo criado (id=${autonomoPessoaId}) - autonomo@fretelabs.com / 123456`);

    // ============================================================
    // 5. MOTORISTA VINCULADO (vinculado à frota)
    // ============================================================
    const [vincResult] = await db.query(
        `INSERT INTO pessoas (tipo_pessoa, nome_razao_social, cpf_cnpj, email, senha, telefone, status)
         VALUES ('PF', 'Pedro Motorista Santos', '987.654.321-00', 'vinculado3@fretelabs.com', ?, '(21) 97654-3210', 'APROVADO')`,
        [senhaHash]
    );
    const vinculadoPessoaId = vincResult.insertId;
    await db.query(
        `INSERT INTO motoristas_vinculados (pessoa_id, transportador_id, cnh, cnh_categoria, cnh_validade, data_admissao, status)
         VALUES (?, ?, '98765432100', 'D', '2027-06-30', NOW(), 'ATIVO')`,
        [vinculadoPessoaId, frotaTransportadorId]
    );
    console.log(`  ✅ Vinculado criado (id=${vinculadoPessoaId}, frota=${frotaTransportadorId}) - vinculado3@fretelabs.com / 123456`);

    console.log('\n🎉 Seed completo! 5 usuários criados com sucesso.\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  CREDENCIAIS DE ACESSO                                  ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  Admin:      admin@fretelabs.com      / senhaSegura123  ║');
    console.log('║  Embarcador: embarcador@fretelabs.com  / 123456         ║');
    console.log('║  Frota:      frota@fretelabs.com       / 123456         ║');
    console.log('║  Autônomo:   autonomo@fretelabs.com    / 123456         ║');
    console.log('║  Vinculado:  vinculado3@fretelabs.com  / 123456         ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    process.exit(0);
}

seedReset().catch(err => {
    console.error('❌ Erro fatal no seed:', err);
    process.exit(1);
});
