const db = require('./config/database');

async function seedFrotas() {
    console.log('=== CRIANDO 5 NOVAS FROTAS NO BANCO DE DADOS ===');

    const senhaHash = '$2b$10$rcMW/Bw/bxb3aitQO/9Q3.rg97.KF89sCq5.gupD40XDOKzXVqU3y'; // 123456

    const frotasData = [
        {
            razao: 'TransBrasil Logística Integrada LTDA',
            fantasia: 'TransBrasil Log',
            cnpj: '12.345.678/0001-90',
            email: 'frota.transbrasil@fretelabs.com',
            telefone: '(11) 98765-1001',
            rntrc: 'RNTRC-44510',
            ie: '112233445',
            area_atuacao: 'Sul e Sudeste',
            tipos_carga: 'Carga Geral, Grãos, Eletrônicos',
            avaliacao_media: 4.85,
            total_avaliacoes: 14,
            veiculos: [
                { placa: 'TBX1A01', modelo: 'Volvo FH 540', marca: 'Volvo', tipo_veiculo: 'BITREM', capacidade_kg: 36000 },
                { placa: 'TBX1A02', modelo: 'Scania R500', marca: 'Scania', tipo_veiculo: 'CARRETA', capacidade_kg: 32000 }
            ]
        },
        {
            razao: 'Rodoviário Estrela do Norte Transportes LTDA',
            fantasia: 'Estrela do Norte',
            cnpj: '23.456.789/0001-01',
            email: 'frota.estreladonorte@fretelabs.com',
            telefone: '(62) 99876-2002',
            rntrc: 'RNTRC-55820',
            ie: '223344556',
            area_atuacao: 'Centro-Oeste e Norte',
            tipos_carga: 'Agronegócio, Frigorífico, Grãos',
            avaliacao_media: 4.90,
            total_avaliacoes: 22,
            veiculos: [
                { placa: 'EST2B01', modelo: 'DAF XF 530', marca: 'DAF', tipo_veiculo: 'RODOTREM', capacidade_kg: 45000 },
                { placa: 'EST2B02', modelo: 'Mercedes Actros 2651', marca: 'Mercedes-Benz', tipo_veiculo: 'CARRETA', capacidade_kg: 30000 }
            ]
        },
        {
            razao: 'Expresso Aliança Logística SA',
            fantasia: 'Expresso Aliança',
            cnpj: '34.567.890/0001-12',
            email: 'frota.alianca@fretelabs.com',
            telefone: '(21) 97654-3003',
            rntrc: 'RNTRC-66930',
            ie: '334455667',
            area_atuacao: 'Nacional (Todas as regiões)',
            tipos_carga: 'Farmacêuticos, Cosméticos, Alimentos',
            avaliacao_media: 5.00,
            total_avaliacoes: 35,
            veiculos: [
                { placa: 'ALX3C01', modelo: 'Scania R450', marca: 'Scania', tipo_veiculo: 'CARRETA', capacidade_kg: 32000 },
                { placa: 'ALX3C02', modelo: 'Volkswagen Meteor 29.520', marca: 'Volkswagen', tipo_veiculo: 'BITREM', capacidade_kg: 38000 }
            ]
        },
        {
            razao: 'Vanguard Transportes e Cargas LTDA',
            fantasia: 'Vanguard Logística',
            cnpj: '45.678.901/0001-23',
            email: 'frota.vanguard@fretelabs.com',
            telefone: '(31) 98543-4004',
            rntrc: 'RNTRC-77140',
            ie: '445566778',
            area_atuacao: 'Sudeste e Nordeste',
            tipos_carga: 'Peças Automotivas, Industrial, E-commerce',
            avaliacao_media: 4.75,
            total_avaliacoes: 19,
            veiculos: [
                { placa: 'VNG4D01', modelo: 'Mercedes Atego 2430', marca: 'Mercedes-Benz', tipo_veiculo: 'TRUCK', capacidade_kg: 14000 },
                { placa: 'VNG4D02', modelo: 'Volvo FH 460', marca: 'Volvo', tipo_veiculo: 'CARRETA', capacidade_kg: 30000 }
            ]
        },
        {
            razao: 'TransGlobal Soluções Rodoviárias LTDA',
            fantasia: 'TransGlobal Express',
            cnpj: '56.789.012/0001-34',
            email: 'frota.transglobal@fretelabs.com',
            telefone: '(41) 99123-5005',
            rntrc: 'RNTRC-88250',
            ie: '556677889',
            area_atuacao: 'Interestadual e Mercosul',
            tipos_carga: 'Contêineres, Maquinário, Químicos',
            avaliacao_media: 4.95,
            total_avaliacoes: 28,
            veiculos: [
                { placa: 'TGL5E01', modelo: 'Scania R540', marca: 'Scania', tipo_veiculo: 'BITREM', capacidade_kg: 40000 },
                { placa: 'TGL5E02', modelo: 'Iveco S-Way 540', marca: 'Iveco', tipo_veiculo: 'CARRETA', capacidade_kg: 32000 }
            ]
        }
    ];

    const idsFrotasCriadas = [];

    for (const f of frotasData) {
        // Verifica se a pessoa já existe pelo e-mail ou CNPJ
        const [pExiste] = await db.query('SELECT id FROM pessoas WHERE email = ? OR cpf_cnpj = ?', [f.email, f.cnpj]);
        let pessoaId;
        if (pExiste.length > 0) {
            pessoaId = pExiste[0].id;
            console.log(`- Frota "${f.razao}" já existe com pessoa_id: ${pessoaId}`);
        } else {
            const [pRes] = await db.query(`
                INSERT INTO pessoas (
                    tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, 
                    email, senha, telefone, data_cadastro, status, tipo_vinculo_motorista
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'APROVADO', 'NAO_MOTORISTA')
            `, [
                'JURIDICA', f.razao, f.fantasia, f.cnpj, 
                f.email, senhaHash, f.telefone
            ]);
            pessoaId = pRes.insertId;
            console.log(`+ Nova pessoa cadastrada: "${f.razao}" (id: ${pessoaId})`);
        }

        // Verifica se o transportador já existe
        const [tExiste] = await db.query('SELECT id FROM transportadores WHERE pessoa_id = ?', [pessoaId]);
        let transportadorId;
        if (tExiste.length > 0) {
            transportadorId = tExiste[0].id;
            await db.query(`
                UPDATE transportadores SET 
                    area_atuacao = ?, tipos_carga = ?, avaliacao_media = ?, total_avaliacoes = ?,
                    quantidade_veiculos = ?, registro_nacional_transportador = ?, inscricao_estadual = ?
                WHERE id = ?
            `, [
                f.area_atuacao, f.tipos_carga, f.avaliacao_media, f.total_avaliacoes, 
                f.veiculos.length, f.rntrc, f.ie, transportadorId
            ]);
            console.log(`- Transportador atualizado: id ${transportadorId}`);
        } else {
            const [tRes] = await db.query(`
                INSERT INTO transportadores (
                    pessoa_id, tipo_transportador, registro_nacional_transportador, 
                    inscricao_estadual, quantidade_veiculos, area_atuacao, 
                    tipos_carga, avaliacao_media, total_avaliacoes, verificacao_documental
                ) VALUES (?, 'FROTA', ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                pessoaId, f.rntrc, f.ie, f.veiculos.length, 
                f.area_atuacao, f.tipos_carga, f.avaliacao_media, f.total_avaliacoes
            ]);
            transportadorId = tRes.insertId;
            console.log(`+ Novo transportador tipo FROTA cadastrado: id ${transportadorId}`);
        }

        idsFrotasCriadas.push({ transportadorId, pessoaId, frota: f });

        // Cadastra os veículos da frota caso ainda não existam
        let veicIndex = 1;
        for (const v of f.veiculos) {
            const [vExiste] = await db.query('SELECT id FROM veiculos WHERE placa = ?', [v.placa]);
            if (vExiste.length === 0) {
                const renavamUnico = `88${String(transportadorId).padStart(3, '0')}${String(veicIndex).padStart(6, '0')}`;
                await db.query(`
                    INSERT INTO veiculos (
                        transportador_id, placa, renavam, modelo, marca, 
                        ano_fabricacao, ano_modelo, capacidade_kg, capacidade_m3, 
                        tipo_carroceria, tipo_veiculo, eixos, possui_rastreador, possui_seguro, status
                    ) VALUES (?, ?, ?, ?, ?, 2023, 2024, ?, 100.00, 'Baú Sider', ?, 6, 1, 1, 'ATIVO')
                `, [
                    transportadorId, v.placa, renavamUnico, v.modelo, v.marca, 
                    v.capacidade_kg, v.tipo_veiculo
                ]);
                console.log(`  + Veículo cadastrado: ${v.modelo} (${v.placa}) - Renavam: ${renavamUnico}`);
            }
            veicIndex++;
        }
    }

    // Configurar propostas para demonstração na aba "Propostas" do Pedro Santos (pessoa_id = 5)
    console.log('=== CONFIGURANDO PROPOSTAS PARA TESTE DO MOTORISTA VINCULADO ===');
    const pedroPessoaId = 5;

    // 1. Proposta enviada pelo Pedro para a TransBrasil (Minhas Propostas)
    if (idsFrotasCriadas.length > 0) {
        const frota1 = idsFrotasCriadas[0];
        const [propEnviadaExiste] = await db.query(`
            SELECT id FROM propostas 
            WHERE motorista_pessoa_id = ? AND transportador_id = ? AND tipo = 'MOTORISTA_PARA_FROTA'
        `, [pedroPessoaId, frota1.transportadorId]);

        if (propEnviadaExiste.length === 0) {
            await db.query(`
                INSERT INTO propostas (
                    motorista_pessoa_id, transportador_id, tipo, tipo_contrato,
                    valor_salario, valor_comissao, mensagem, disponibilidade,
                    data_envio, status, criado_em, atualizado_em, criado_por
                ) VALUES (
                    ?, ?, 'MOTORISTA_PARA_FROTA', 'MISTO',
                    4800.00, 8.00,
                    'Olá! Possuo CNH categoria D com EAR ativa, experiência em rotas interestaduais e disponibilidade para início imediato.',
                    'IMEDIATA', NOW(), 'PENDENTE', NOW(), NOW(), ?
                )
            `, [pedroPessoaId, frota1.transportadorId, pedroPessoaId]);
            console.log(`+ Proposta ENVIADA cadastrada para ${frota1.frota.razao}`);
        }
    }

    // 2. Proposta recebida pelo Pedro vinda da Expresso Aliança (Propostas Recebidas)
    if (idsFrotasCriadas.length > 2) {
        const frotaAlianca = idsFrotasCriadas[2];
        const [propRecebidaExiste] = await db.query(`
            SELECT id FROM propostas 
            WHERE motorista_pessoa_id = ? AND transportador_id = ? AND tipo = 'FROTA_PARA_MOTORISTA'
        `, [pedroPessoaId, frotaAlianca.transportadorId]);

        if (propRecebidaExiste.length === 0) {
            const beneficiosJson = JSON.stringify([
                'Plano de Saúde Unimed Nacional',
                'Vale Refeição R$ 950/mês',
                'Seguro de Vida',
                'Diárias de Viagem'
            ]);

            await db.query(`
                INSERT INTO propostas (
                    motorista_pessoa_id, transportador_id, tipo, tipo_contrato,
                    valor_salario, valor_comissao, valor_adiantamento, beneficios,
                    carga_horaria, dias_descanso, ferias_remuneradas, decimo_terceiro,
                    periodo_experiencia, mensagem, data_envio, status, criado_em, atualizado_em, criado_por
                ) VALUES (
                    ?, ?, 'FROTA_PARA_MOTORISTA', 'SALARIO',
                    5500.00, 10.00, 1200.00,
                    ?,
                    '44h semanais', 'Escala 6x1', 1, 1,
                    90,
                    'Prezado Pedro, avaliamos seu perfil no FreteLabs com nota 5.0 e gostaríamos de contratá-lo para nossa rota Sudeste.',
                    NOW(), 'PENDENTE', NOW(), NOW(), ?
                )
            `, [pedroPessoaId, frotaAlianca.transportadorId, beneficiosJson, frotaAlianca.pessoaId]);
            console.log(`+ Proposta RECEBIDA cadastrada vinda de ${frotaAlianca.frota.razao}`);
        }
    }

    console.log('=== 5 FROTAS E PROPOSTAS CONFIGURADAS COM SUCESSO! ===');
    process.exit(0);
}

seedFrotas().catch(e => {
    console.error('Erro no seed:', e);
    process.exit(1);
});
