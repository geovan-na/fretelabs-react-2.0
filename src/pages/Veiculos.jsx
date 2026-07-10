// pages/Veiculos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import CardVeiculo from '../components/CardVeiculo';
import FormVeiculo from '../components/FormVeiculo';
import Button from '../components/Button';

export default function Veiculos() {
    const { user } = useAuth();
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [veiculoEditando, setVeiculoEditando] = useState(null);
    const [processando, setProcessando] = useState(false);

    const token = localStorage.getItem('token');

    // Buscar transportador_id diretamente
    const getTransportadorId = async () => {
        try {
            // Buscar transportador pelo pessoa_id
            const response = await api.request('/transportador/pessoa', 'GET', null, token);
            return response.id;
        } catch (err) {
            console.error('Erro ao buscar transportador:', err);
            throw new Error('Transportador não encontrado');
        }
    };

    useEffect(() => {
        carregarVeiculos();
    }, []);

    const carregarVeiculos = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.veiculos.listar(token);
            setVeiculos(response.data || []);
        } catch (err) {
            console.error('Erro ao carregar veículos:', err);
            setError('Erro ao carregar veículos.');
        } finally {
            setLoading(false);
        }
    };

    const handleSalvarVeiculo = async (dados) => {
        setProcessando(true);
        try {
            // Buscar transportador_id do usuário logado
            const transportadorId = await getTransportadorId();

            const dadosCompletos = {
                ...dados,
                transportador_id: transportadorId
            };

            if (veiculoEditando) {
                await api.veiculos.atualizar(veiculoEditando.id, dadosCompletos, token);
            } else {
                await api.veiculos.criar(dadosCompletos, token);
            }
            setShowForm(false);
            setVeiculoEditando(null);
            await carregarVeiculos();
        } catch (err) {
            console.error('Erro ao salvar veículo:', err);
            alert(err.message || 'Erro ao salvar veículo. Tente novamente.');
        } finally {
            setProcessando(false);
        }
    };

    const handleDeletar = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este veículo?')) return;

        try {
            await api.veiculos.deletar(id, token);
            await carregarVeiculos();
        } catch (err) {
            console.error('Erro ao deletar veículo:', err);
            alert('Erro ao deletar veículo. Tente novamente.');
        }
    };

    const handleEditar = (veiculo) => {
        setVeiculoEditando(veiculo);
        setShowForm(true);
    };

    const handleCancelarForm = () => {
        setShowForm(false);
        setVeiculoEditando(null);
    };

    const isFrota = user?.tipo === 'FROTA';
    const isAutonomo = user?.tipo === 'AUTONOMO';

    const getTitulo = () => {
        if (isFrota) return 'Veículos';
        if (isAutonomo) return 'Meu Veículo';
        return 'Veículos';
    };

    const getSubtitulo = () => {
        if (isFrota) return 'Gerencie os veículos da sua frota';
        if (isAutonomo) return 'Gerencie seu veículo';
        return 'Gerencie seus veículos';
    };

    if (loading) {
        return (
            <div className="veiculos-loading">
                <p>Carregando veículos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="veiculos-error">
                <p>{error}</p>
                <button onClick={carregarVeiculos} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="veiculos-container">
            <div className="page-header">
                <div>
                    <h1>{getTitulo()}</h1>
                    <p className="subtitle">{getSubtitulo()}</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => {
                        if (showForm) {
                            handleCancelarForm();
                        } else {
                            setVeiculoEditando(null);
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm ? 'Cancelar' : 'Adicionar Veículo'}
                </Button>
            </div>

            {showForm && (
                <div className="veiculos-form-wrapper">
                    <FormVeiculo
                        dadosIniciais={veiculoEditando}
                        onSubmit={handleSalvarVeiculo}
                        isLoading={processando}
                        onCancel={handleCancelarForm}
                    />
                </div>
            )}

            {veiculos.length === 0 && !showForm ? (
                <div className="veiculos-vazio">
                    <p>Nenhum veículo cadastrado.</p>
                    <p className="veiculos-vazio-sub">
                        Clique em "Adicionar Veículo" para cadastrar seu primeiro veículo.
                    </p>
                </div>
            ) : (
                <div className="veiculos-grid">
                    {veiculos.map((veiculo) => (
                        <CardVeiculo
                            key={veiculo.id}
                            veiculo={veiculo}
                            onEditar={handleEditar}
                            onDeletar={handleDeletar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}