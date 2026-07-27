// components/motoristas/ModalDesignarVeiculo.jsx
import { useState, useEffect } from 'react';
import { useMotoristas } from '../hooks/useMotoristas';
import { api } from '../services/api';

export default function ModalDesignarVeiculo({ motorista, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [veiculos, setVeiculos] = useState([]);
    const [veiculoSelecionado, setVeiculoSelecionado] = useState('');
    const [loadingVeiculos, setLoadingVeiculos] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const { designarVeiculo } = useMotoristas();

    useEffect(() => {
        carregarVeiculos();
    }, []);

    const carregarVeiculos = async () => {
        setLoadingVeiculos(true);
        try {
            const response = await api.veiculos.listar(token);
            const disponiveis = (response.data || []).filter(
                v => !v.motorista_vinculado_id && v.status === 'ATIVO'
            );
            setVeiculos(disponiveis);
        } catch (err) {
            console.error('Erro ao carregar veículos:', err);
            setError('Erro ao carregar veículos disponíveis.');
        } finally {
            setLoadingVeiculos(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!veiculoSelecionado) {
            alert('Selecione um veículo.');
            return;
        }

        setLoading(true);
        try {
            await designarVeiculo(
                motorista.motorista_vinculado_id,
                parseInt(veiculoSelecionado)
            );
            alert('Veículo designado com sucesso!');
            onSuccess();
        } catch (err) {
            console.error('Erro ao designar veículo:', err);
            alert(err.response?.data?.error || 'Erro ao designar veículo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Designar Veículo para {motorista.nome}</h3>

                <form onSubmit={handleSubmit}>
                    {loadingVeiculos ? (
                        <p>Carregando veículos disponíveis...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : veiculos.length === 0 ? (
                        <p>Nenhum veículo disponível para designar.</p>
                    ) : (
                        <div className="form-group">
                            <label>Selecione um veículo</label>
                            <select
                                value={veiculoSelecionado}
                                onChange={(e) => setVeiculoSelecionado(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Selecione...</option>
                                {veiculos.map((veiculo) => (
                                    <option key={veiculo.id} value={veiculo.id}>
                                        {veiculo.placa} - {veiculo.modelo} ({veiculo.marca})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="modal-btn modal-btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="modal-btn modal-btn-primary"
                            disabled={loading || veiculos.length === 0}
                        >
                            {loading ? 'Designando...' : 'Designar Veículo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}