// src/services/api.js
const API_URL = 'http://localhost:3001/api';

export const api = {
    async request(endpoint, method = 'GET', body = null, token = null) {
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
    },
    
    embarcador: {
        buscarPorPessoa: (pessoaId, token) => api.request(`/embarcador/pessoa/${pessoaId}`, 'GET', null, token),
        getPerfil: (token) => api.request('/embarcador/perfil', 'GET', null, token),
        atualizarPerfil: (dados, token) => api.request('/embarcador/perfil', 'PUT', dados, token),
        getEstatisticas: (token) => api.request('/embarcador/estatisticas', 'GET', null, token),
    },
    
    fretes: {
        listar: (token) => api.request('/fretes', 'GET', null, token),
        buscar: (id, token) => api.request(`/fretes/${id}`, 'GET', null, token),
        criar: (dados, token) => api.request('/fretes', 'POST', dados, token),
        atualizar: (id, dados, token) => api.request(`/fretes/${id}`, 'PUT', dados, token),
        cancelar: (id, dados, token) => api.request(`/fretes/${id}/cancelar`, 'PATCH', dados, token),
    },
    // src/services/api.js

// src/services/api.js
candidaturas: {
    listarPorFrete: (freteId, token) => api.request(`/candidaturas/frete/${freteId}`, 'GET', null, token),
    listarMinhas: (token) => api.request('/candidaturas/minhas', 'GET', null, token),
    listarEmbarcador: (token) => api.request('/candidaturas/embarcador', 'GET', null, token), // NOVA
    criar: (dados, token) => api.request('/candidaturas', 'POST', dados, token),
    atualizar: (id, status, token) => api.request(`/candidaturas/${id}`, 'PATCH', { status }, token),
    deletar: (id, token) => api.request(`/candidaturas/${id}`, 'DELETE', null, token),
    designarMotorista: (id, motoristaVinculadoId, token) => 
        api.request(`/candidaturas/${id}/designar-motorista`, 'PATCH', { motorista_vinculado_id: motoristaVinculadoId }, token),
    listarMotoristasDisponiveis: (token) => 
        api.request('/candidaturas/motoristas/disponiveis', 'GET', null, token),
    buscar: (id, token) => api.request(`/candidaturas/${id}`, 'GET', null, token),
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
};
