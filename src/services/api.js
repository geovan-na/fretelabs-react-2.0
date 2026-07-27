// src/services/api.js
const API_URL = 'http://localhost:3000/api';


export const api = {
    async request(endpoint, method = 'GET', body = null, explicitToken = null) {
        // Busca o token passado manualmente ou pega direto do localStorage
        const token = explicitToken || localStorage.getItem('token'); 

        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method,
            headers,
        };
        
        if (body) {
            config.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }
        
        return data;
    },

    
    auth: {
        register: (dados) => api.request('/auth/register', 'POST', dados),
        login: (email, senha) => api.request('/auth/login', 'POST', { email, senha }),
        getMe: (token) => api.request('/auth/me', 'GET', null, token),
    },

    usuarios: {
        listar: (token) => api.request('/usuarios', 'GET', null, token),
        buscar: (id, token) => api.request(`/usuarios/${id}`, 'GET', null, token),
        atualizar: (id, dados, token) => api.request(`/usuarios/${id}`, 'PUT', dados, token),
        deletar: (id, token) => api.request(`/usuarios/${id}`, 'DELETE', null, token),
    },
   
    embarcador: {
        buscarPorPessoa: (pessoaId, token) => api.request(`/embarcador/pessoa/${pessoaId}`, 'GET', null, token),
        getPerfil: (token) => api.request('/embarcador/perfil', 'GET', null, token),
        atualizarPerfil: (dados, token) => api.request('/embarcador/perfil', 'PUT', dados, token),
        getEstatisticas: (token) => api.request('/embarcador/estatisticas', 'GET', null, token),
    },
    
        fretes: {
            listar: (token, params = '') => api.request(`/fretes${params}`, 'GET', null, token),
            listarMeusFretes: (token, params = '') => api.request(`/fretes/meus-fretes${params}`, 'GET', null, token),
            listarAceitos: (token, params = '') => api.request(`/fretes/aceitos${params}`, 'GET', null, token),
            listarDisponiveis: (token, params = '') => api.request('/fretes', 'GET', null, token), // Verifique se sua rota no express usa /disponiveis
            buscar: (id, token) => api.request(`/fretes/${id}`, 'GET', null, token),
            criar: (dados, token) => api.request('/fretes', 'POST', dados, token),
            atualizar: (id, dados, token) => api.request(`/fretes/${id}`, 'PUT', dados, token),
            deletar: (id, token) => api.request(`/fretes/${id}`, 'DELETE', null, token),
            cancelar: (id, motivo, token) => api.request(`/fretes/${id}/cancelar`, 'PATCH', { motivo }, token),
     },

        veiculos: {
            listar: (token) => api.request('/veiculos', 'GET', null, token),
            buscar: (id, token) => api.request(`/veiculos/${id}`, 'GET', null, token),
            criar: (dados, token) => api.request('/veiculos', 'POST', dados, token),
            atualizar: (id, dados, token) => api.request(`/veiculos/${id}`, 'PUT', dados, token),
            deletar: (id, token) => api.request(`/veiculos/${id}`, 'DELETE', null, token),
        },

    candidaturas: {
        listarPorFrete: (freteId, token) => api.request(`/candidaturas/frete/${freteId}`, 'GET', null, token),
        listarMinhas: (token) => api.request('/candidaturas/minhas', 'GET', null, token),
        listarEmbarcador: (token) => api.request('/candidaturas/embarcador', 'GET', null, token),
        criar: (dados, token) => api.request('/candidaturas', 'POST', dados, token),
        atualizar: (id, status, token) => api.request(`/candidaturas/${id}`, 'PATCH', { status }, token),
        deletar: (id, token) => api.request(`/candidaturas/${id}`, 'DELETE', null, token),
        designarMotorista: (id, motoristaVinculadoId, token) => 
            api.request(`/candidaturas/${id}/designar-motorista`, 'PATCH', { motorista_vinculado_id: motoristaVinculadoId }, token),
        listarMotoristasDisponiveis: (token) => 
            api.request('/candidaturas/motoristas/disponiveis', 'GET', null, token),
        buscar: (id, token) => api.request(`/candidaturas/${id}`, 'GET', null, token),
    },
    
    documentos: {
        upload: (formData, token) => {
            return fetch(`${API_URL}/documentos/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            }).then(res => res.json());
        },
        listarPorPessoa: (pessoaId, token) => api.request(`/documentos/pessoa/${pessoaId}`, 'GET', null, token),
        deletar: (id, token) => api.request(`/documentos/${id}`, 'DELETE', null, token),
    },
    
    enderecos: {
        listar: (token) => api.request('/enderecos', 'GET', null, token),
        buscar: (id, token) => api.request(`/enderecos/${id}`, 'GET', null, token),
        criar: (dados, token) => api.request('/enderecos', 'POST', dados, token),
        atualizar: (id, dados, token) => api.request(`/enderecos/${id}`, 'PUT', dados, token),
        deletar: (id, token) => api.request(`/enderecos/${id}`, 'DELETE', null, token),
    },

    notificacoes: {
        listar: (token) => api.request('/notificacoes', 'GET', null, token),
        marcarLida: (id, token) => api.request(`/notificacoes/${id}/ler`, 'PATCH', null, token),
        marcarTodasLidas: (token) => api.request('/notificacoes/ler-todas', 'PATCH', null, token),
        deletar: (id, token) => api.request(`/notificacoes/${id}`, 'DELETE', null, token),
    },
    
    avaliacoes: {
        listar: (token) => api.request('/avaliacoes/recebidas', 'GET', null, token),
        listarMinhas: (token) => api.request('/avaliacoes/minhas', 'GET', null, token),
        criar: (dados, token) => api.request('/avaliacoes', 'POST', dados, token),
        buscar: (id, token) => api.request(`/avaliacoes/${id}`, 'GET', null, token),
        verificarSeJaAvaliou: (freteId, token) => api.request(`/avaliacoes/verificar/${freteId}`, 'GET', null, token),
    },

    financeiro: {
        getResumo: (token) => api.request('/financeiro/resumo', 'GET', null, token),
        getTransacoes: (token, periodo = 'MES') => api.request(`/financeiro/transacoes?periodo=${periodo}`, 'GET', null, token),
        getExtrato: (token) => api.request('/financeiro/extrato', 'GET', null, token),
        getSaldo: (token) => api.request('/financeiro/saldo', 'GET', null, token),
        solicitarSaque: (dados, token) => api.request('/financeiro/saque', 'POST', dados, token),
    },
    
    dadosBancarios: {
        listar: (token) => api.request('/dados-bancarios', 'GET', null, token),
        buscarPrincipal: (token) => api.request('/dados-bancarios/principal', 'GET', null, token),
        criar: (dados, token) => api.request('/dados-bancarios', 'POST', dados, token),
        atualizar: (id, dados, token) => api.request(`/dados-bancarios/${id}`, 'PUT', dados, token),
        deletar: (id, token) => api.request(`/dados-bancarios/${id}`, 'DELETE', null, token),
    },
        transportador: {
        buscarPorPessoa: (token) => api.request('/transportador/pessoa', 'GET', null, token),
        getPerfil: (token) => api.request('/transportador/perfil', 'GET', null, token),
        atualizarPerfil: (dados, token) => api.request('/transportador/perfil', 'PUT', dados, token),
    },
    propostas: {
        enviar: (dados, token) => api.request('/propostas', 'POST', dados, token),
        listarEnviadas: (token) => api.request('/propostas/enviadas', 'GET', null, token),
        listarRecebidas: (token) => api.request('/propostas/recebidas', 'GET', null, token),
        buscar: (id, token) => api.request(`/propostas/${id}`, 'GET', null, token),
        aceitar: (id, token) => api.request(`/propostas/${id}/aceitar`, 'PATCH', null, token),
        recusar: (id, motivo, token) => api.request(`/propostas/${id}/recusar`, 'PATCH', { motivo }, token),
        contraproposta: (id, dados, token) => api.request(`/propostas/${id}/contraproposta`, 'PATCH', dados, token),
        cancelar: (id, token) => api.request(`/propostas/${id}/cancelar`, 'PATCH', null, token),
    },
    contratos: {
        criar: (dados, token) => api.request('/contratos', 'POST', dados, token),
        listar: (token, params = '') => api.request(`/contratos${params}`, 'GET', null, token),
        buscar: (id, token) => api.request(`/contratos/${id}`, 'GET', null, token),
        assinarMotorista: (id, token) => api.request(`/contratos/${id}/assinar-motorista`, 'PATCH', null, token),
        assinarFrota: (id, token) => api.request(`/contratos/${id}/assinar-frota`, 'PATCH', null, token),
        encerrar: (id, motivo, token) => api.request(`/contratos/${id}/encerrar`, 'PATCH', { motivo }, token),
        renovar: (id, dados, token) => api.request(`/contratos/${id}/renovar`, 'PATCH', dados, token),
    },

    motoristas: {
        listarVinculados: (token, params = '') => api.request(`/motoristas/vinculados${params}`, 'GET', null, token),
        listarDisponiveis: (token, params = '') => api.request(`/motoristas/disponiveis${params}`, 'GET', null, token),
        buscar: (id, token) => api.request(`/motoristas/${id}`, 'GET', null, token),
        designarVeiculo: (id, veiculoId, token) => api.request(`/motoristas/${id}/designar-veiculo`, 'PATCH', { veiculo_id: veiculoId }, token),
        removerVeiculo: (id, token) => api.request(`/motoristas/${id}/remover-veiculo`, 'PATCH', null, token),
        finalizarVinculo: (id, motivo, token) => api.request(`/motoristas/${id}/finalizar-vinculo`, 'PATCH', { motivo }, token),
    },
admin: {
        // Perfil
        getPerfil: (token) => api.request('/admin/perfil', 'GET', null, token),
        atualizarPerfil: (dados, token) => api.request('/admin/perfil', 'PUT', dados, token),

        // Usuários
        listarUsuarios: (token, params = '') => 
            api.request(`/admin/usuarios${params}`, 'GET', null, token),
        
        buscarUsuario: (id, token) => 
            api.request(`/admin/usuarios/${id}`, 'GET', null, token),
        
        bloquearUsuario: (id, motivo, token) => 
            api.request(`/admin/usuarios/${id}/bloquear`, 'PATCH', { motivo }, token),
        
        desbloquearUsuario: (id, token) => 
            api.request(`/admin/usuarios/${id}/desbloquear`, 'PATCH', null, token),
        
        aprovarUsuario: (id, token) => 
            api.request(`/admin/usuarios/${id}/aprovar`, 'PATCH', null, token),
        
        reprovarUsuario: (id, motivo, token) => 
            api.request(`/admin/usuarios/${id}/reprovar`, 'PATCH', { motivo }, token),
        
        alterarRole: (id, role, token) => 
            api.request(`/admin/usuarios/${id}/role`, 'PATCH', { role }, token),

        // Fretes
        listarFretes: (token, params = '') => 
            api.request(`/admin/fretes${params}`, 'GET', null, token),
        
        buscarFrete: (id, token) => 
            api.request(`/admin/fretes/${id}`, 'GET', null, token),
        
        cancelarFrete: (id, motivo, token) => 
            api.request(`/admin/fretes/${id}/cancelar`, 'PATCH', { motivo }, token),

        // Blacklist
        listarBlacklist: (token) => 
            api.request('/admin/blacklist', 'GET', null, token),
        
        adicionarBlacklist: (dados, token) => 
            api.request('/admin/blacklist', 'POST', dados, token),
        
        removerBlacklist: (id, token) => 
            api.request(`/admin/blacklist/${id}`, 'DELETE', null, token),

        // Veículos
        listarVeiculos: (token, params = '') => 
            api.request(`/admin/veiculos${params}`, 'GET', null, token),
        
        buscarVeiculo: (id, token) => 
            api.request(`/admin/veiculos/${id}`, 'GET', null, token),

        // Estatísticas do Dashboard
        getEstatisticas: (token) => 
            api.request('/admin/estatisticas', 'GET', null, token),
    },

// ============================================
// VINCULADO - Motorista Vinculado
// ============================================
motoristaVinculado: {
    // PERFIL
    getPerfil: (token) => api.request('/motorista-vinculado/perfil', 'GET', null, token),
    
    getResumo: (token) => api.request('/motorista-vinculado/resumo', 'GET', null, token),
    
    listarFretes: (token, status = '') => {
        const params = status ? `?status=${status}` : '';
        return api.request(`/motorista-vinculado/fretes${params}`, 'GET', null, token);
    },
    buscarFrete: (id, token) => api.request(`/motorista-vinculado/fretes/${id}`, 'GET', null, token),
    
    listarFretesParaAtualizar: (token) => 
        api.request('/motorista-vinculado/fretes/para-atualizar', 'GET', null, token),
    atualizarStatusFrete: (id, status, observacao = '', token) => 
        api.request(`/motorista-vinculado/fretes/${id}/status`, 'PATCH', { status, observacao }, token),
    
    listarFretesEmAndamento: (token) => 
        api.request('/motorista-vinculado/fretes/em-andamento', 'GET', null, token),
    
    listarEntregasRealizadas: (token, mes = '', ano = '') => {
        let params = '';
        if (mes && ano) {
            params = `?mes=${mes}&ano=${ano}`;
        }
        return api.request(`/motorista-vinculado/fretes/concluidos${params}`, 'GET', null, token);
    },
    
    listarFrotasDisponiveis: (token, search = '') => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return api.request(`/motorista-vinculado/frotas-disponiveis${params}`, 'GET', null, token);
    },
        // ============================================
    getMinhaFrota: (token) => 
        api.request('/motorista-vinculado/minha-frota', 'GET', null, token),
    
    finalizarVinculo: (motivo, token) => 
        api.request('/motorista-vinculado/finalizar-vinculo', 'PATCH', { motivo }, token),
},


    pagamentos: {
        criar: (dados, token) => api.request('/pagamentos', 'POST', dados, token),
        listarFrota: (token, params = '') => api.request(`/pagamentos/frota${params}`, 'GET', null, token),
        listarMotorista: (token, params = '') => api.request(`/pagamentos/motorista${params}`, 'GET', null, token),
        resumo: (token) => api.request('/pagamentos/resumo', 'GET', null, token),
        buscar: (id, token) => api.request(`/pagamentos/${id}`, 'GET', null, token),
        pagar: (id, comprovanteId, token) => api.request(`/pagamentos/${id}/pagar`, 'PATCH', { comprovante_id: comprovanteId }, token),
        cancelar: (id, motivo, token) => api.request(`/pagamentos/${id}/cancelar`, 'PATCH', { motivo }, token),
    },
    perfil: {
        get: (token) => api.request('/perfil', 'GET', null, token),
        atualizar: (dados, token) => api.request('/perfil', 'PUT', dados, token),
        alterarSenha: (dadosSenha, token) => api.request('/perfil/alterar-senha', 'PUT', dadosSenha, token),
    },
        dashboard: {
        embarcador: (token) => api.request('/dashboard/embarcador', 'GET', null, token),
        frota: (token) => api.request('/dashboard/frota', 'GET', null, token),
        autonomo: (token) => api.request('/dashboard/autonomo', 'GET', null, token),
        vinculado: (token) => api.request('/dashboard/vinculado', 'GET', null, token),
        admin: (token) => api.request('/dashboard/admin', 'GET', null, token),
    },
};