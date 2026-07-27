import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useMotoristas() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vinculados, setVinculados] = useState([]);
    const [disponiveis, setDisponiveis] = useState([]);
    const [propostasEnviadas, setPropostasEnviadas] = useState([]);
    const [propostasRecebidas, setPropostasRecebidas] = useState([]);
    const [resumo, setResumo] = useState({
        totalMotoristas: 0,
        ativos: 0,
        ferias: 0,
        licenca: 0,
        desligados: 0,
        pagamentosPendentes: 0
    });

    const token = localStorage.getItem('token');

    const carregarTodos = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Carregar propostas recebidas (motorista / frota)
            try {
                const recebidasRes = await api.propostas.listarRecebidas(token);
                setPropostasRecebidas(recebidasRes.data || []);
            } catch (e) {
                console.warn('Erro ao carregar propostas recebidas:', e);
            }

            // Carregar propostas enviadas
            try {
                const enviadasRes = await api.propostas.listarEnviadas(token);
                setPropostasEnviadas(enviadasRes.data || []);
            } catch (e) {
                console.warn('Erro ao carregar propostas enviadas:', e);
            }

            // Tentar carregar vinculados (Apenas Frota)
            try {
                const vinculadosRes = await api.motoristas.listarVinculados(token);
                const dados = vinculadosRes.data || [];
                setVinculados(dados);

                const ativos = dados.filter(m => m.situacao === 'ATIVO').length;
                const ferias = dados.filter(m => m.situacao === 'FERIAS').length;
                const licenca = dados.filter(m => m.situacao === 'LICENCA').length;
                const desligados = dados.filter(m => m.situacao === 'DESLIGADO').length;
                const pagamentosPendentes = dados.reduce((acc, m) => acc + (m.pagamentos_pendentes || 0), 0);

                setResumo({
                    totalMotoristas: dados.length,
                    ativos,
                    ferias,
                    licenca,
                    desligados,
                    pagamentosPendentes
                });
            } catch (e) {
                // Silencia 403 se for motorista
            }

            // Tentar carregar disponíveis (Apenas Frota)
            try {
                const disponiveisRes = await api.motoristas.listarDisponiveis(token);
                setDisponiveis(disponiveisRes.data || []);
            } catch (e) {
                // Silencia 403 se for motorista
            }

        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Recarregar dados específicos
    const recarregarVinculados = useCallback(async () => {
        try {
            const response = await api.motoristas.listarVinculados(token);
            setVinculados(response.data || []);
            return response.data || [];
        } catch (err) {
            console.error('Erro ao recarregar vinculados:', err);
            throw err;
        }
    }, [token]);

    const recarregarDisponiveis = useCallback(async () => {
        try {
            const response = await api.motoristas.listarDisponiveis(token);
            setDisponiveis(response.data || []);
            return response.data || [];
        } catch (err) {
            console.error('Erro ao recarregar disponíveis:', err);
            throw err;
        }
    }, [token]);

    const recarregarPropostasEnviadas = useCallback(async () => {
        try {
            const response = await api.propostas.listarEnviadas(token);
            setPropostasEnviadas(response.data || []);
            return response.data || [];
        } catch (err) {
            console.error('Erro ao recarregar propostas enviadas:', err);
            throw err;
        }
    }, [token]);

    const recarregarPropostasRecebidas = useCallback(async () => {
        try {
            const response = await api.propostas.listarRecebidas(token);
            setPropostasRecebidas(response.data || []);
            return response.data || [];
        } catch (err) {
            console.error('Erro ao recarregar propostas recebidas:', err);
            throw err;
        }
    }, [token]);

    // Buscar motorista específico
    const buscarMotorista = useCallback(async (id) => {
        try {
            const response = await api.motoristas.buscar(id, token);
            return response.data;
        } catch (err) {
            console.error('Erro ao buscar motorista:', err);
            throw err;
        }
    }, [token]);

    // Designar veículo
    const designarVeiculo = useCallback(async (motoristaId, veiculoId) => {
        try {
            const response = await api.motoristas.designarVeiculo(motoristaId, veiculoId, token);
            await recarregarVinculados();
            return response;
        } catch (err) {
            console.error('Erro ao designar veículo:', err);
            throw err;
        }
    }, [token, recarregarVinculados]);

    // Remover veículo
    const removerVeiculo = useCallback(async (motoristaId) => {
        try {
            const response = await api.motoristas.removerVeiculo(motoristaId, token);
            await recarregarVinculados();
            return response;
        } catch (err) {
            console.error('Erro ao remover veículo:', err);
            throw err;
        }
    }, [token, recarregarVinculados]);

    // Finalizar vínculo
    const finalizarVinculo = useCallback(async (motoristaId, motivo) => {
        try {
            const response = await api.motoristas.finalizarVinculo(motoristaId, motivo, token);
            await recarregarVinculados();
            return response;
        } catch (err) {
            console.error('Erro ao finalizar vínculo:', err);
            throw err;
        }
    }, [token, recarregarVinculados]);

    // Enviar proposta
    const enviarProposta = useCallback(async (dados) => {
        try {
            const response = await api.propostas.enviar(dados, token);
            await recarregarPropostasEnviadas();
            return response;
        } catch (err) {
            console.error('Erro ao enviar proposta:', err);
            throw err;
        }
    }, [token, recarregarPropostasEnviadas]);

    // Aceitar proposta (Ajustado para tratar erros 403 de vinculado)
    const aceitarProposta = useCallback(async (propostaId) => {
        try {
            const response = await api.propostas.aceitar(propostaId, token);
            
            // Recarrega as propostas recebidas
            await recarregarPropostasRecebidas();

            // Tenta recarregar vinculados caso seja um usuário Frota, ignora se for Motorista (403)
            try {
                await recarregarVinculados();
            } catch (vErr) {
                // Motoristas não possuem permissão para esta rota
            }

            return response;
        } catch (err) {
            console.error('Erro ao aceitar proposta:', err);
            throw err;
        }
    }, [token, recarregarPropostasRecebidas, recarregarVinculados]);

    // Recusar proposta
    const recusarProposta = useCallback(async (propostaId, motivo) => {
        try {
            const response = await api.propostas.recusar(propostaId, motivo, token);
            await recarregarPropostasRecebidas();
            return response;
        } catch (err) {
            console.error('Erro ao recusar proposta:', err);
            throw err;
        }
    }, [token, recarregarPropostasRecebidas]);

    // Enviar contraproposta
    const enviarContraProposta = useCallback(async (propostaId, dados) => {
        try {
            const response = await api.propostas.contraproposta(propostaId, dados, token);
            await Promise.all([
                recarregarPropostasEnviadas(),
                recarregarPropostasRecebidas()
            ]);
            return response;
        } catch (err) {
            console.error('Erro ao enviar contraproposta:', err);
            throw err;
        }
    }, [token, recarregarPropostasEnviadas, recarregarPropostasRecebidas]);

    // Cancelar proposta
    const cancelarProposta = useCallback(async (propostaId) => {
        try {
            const response = await api.propostas.cancelar(propostaId, token);
            await recarregarPropostasEnviadas();
            return response;
        } catch (err) {
            console.error('Erro ao cancelar proposta:', err);
            throw err;
        }
    }, [token, recarregarPropostasEnviadas]);

    // Inicializar dados
    useEffect(() => {
        carregarTodos();
    }, [carregarTodos]);

    return {
        loading,
        error,
        vinculados,
        disponiveis,
        propostasEnviadas,
        propostasRecebidas,
        resumo,
        recarregarTodos: carregarTodos,
        recarregarVinculados,
        recarregarDisponiveis,
        recarregarPropostasEnviadas,
        recarregarPropostasRecebidas,
        buscarMotorista,
        designarVeiculo,
        removerVeiculo,
        finalizarVinculo,
        enviarProposta,
        aceitarProposta,
        recusarProposta,
        enviarContraProposta,
        cancelarProposta,
    };
}