
import { useState, useEffect } from 'react';
import { useMotoristas } from '../hooks/useMotoristas';
import { useAuth } from '../hooks/useAuth';
import {api} from '../services/api';

export default function ModalEnviarProposta({ motorista, onClose, onSuccess, tipo = 'FROTA_PARA_MOTORISTA' }) {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth(); // Pega o usuário logado
    const { enviarProposta } = useMotoristas();

    const [formData, setFormData] = useState({
        tipo_contrato: 'SALARIO',
        valor_salario: '',
        valor_comissao: '',
        valor_adiantamento: '',
        mensagem: '',
        disponibilidade: 'Integral',
        data_validade: '',
        data_inicio_prevista: ''
    });
    const [errors, setErrors] = useState({});

    // Determina quem está usando o modal
    const isFrota = user?.tipo === 'FROTA';
    const isVinculado = user?.tipo === 'VINCULADO';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validar = () => {
        const novosErrors = {};
        if (formData.tipo_contrato === 'SALARIO' && !formData.valor_salario) {
            novosErrors.valor_salario = 'Valor do salário é obrigatório';
        }
        if (formData.tipo_contrato === 'COMISSAO' && !formData.valor_comissao) {
            novosErrors.valor_comissao = 'Valor da comissão é obrigatório';
        }
        if (!formData.data_validade) {
            novosErrors.data_validade = 'Data de validade é obrigatória';
        }
        setErrors(novosErrors);
        return Object.keys(novosErrors).length === 0;
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    try {
        let payload = {};

        if (isFrota) {
            // CASO 1: FROTA -> MOTORISTA
            payload = {
                transportador_id: user.transportador_id,
                motorista_pessoa_id: motorista.pessoa_id || motorista.id,
                tipo_contrato: formData.tipo_contrato,
                valor_salario: formData.valor_salario ? parseFloat(formData.valor_salario) : null,
                valor_comissao: formData.valor_comissao ? parseFloat(formData.valor_comissao) : null,
                valor_adiantamento: formData.valor_adiantamento ? parseFloat(formData.valor_adiantamento) : null,
                mensagem: formData.mensagem,
                disponibilidade: formData.disponibilidade,
                data_validade: formData.data_validade,
                data_inicio_prevista: formData.data_inicio_prevista || null
            };

            await enviarProposta(payload);
        } else {
            // CASO 2: VINCULADO -> FROTA
            payload = {
                transportador_id: motorista.id,
                tipo_contrato: formData.tipo_contrato,
                valor_salario: formData.valor_salario ? parseFloat(formData.valor_salario) : null,
                valor_comissao: formData.valor_comissao ? parseFloat(formData.valor_comissao) : null,
                valor_adiantamento: formData.valor_adiantamento ? parseFloat(formData.valor_adiantamento) : null,
                mensagem: formData.mensagem,
                disponibilidade: formData.disponibilidade,
                data_validade: formData.data_validade,
                data_inicio_prevista: formData.data_inicio_prevista || null
            };

            const token = localStorage.getItem('token');
            
            // ✅ Usa exatamente a estrutura do seu api.js:
            await api.propostas.enviar(payload, token);
        }

        alert('Proposta enviada com sucesso!');
        if (onSuccess) onSuccess();
        onClose();
    } catch (err) {
        console.error('❌ Erro ao enviar proposta:', err);
        alert(err.response?.data?.error || err.message || 'Erro ao enviar proposta. Tente novamente.');
    } finally {
        setLoading(false);
    }
};
    // Nome a ser exibido no título do modal
    const getNomeDestinatario = () => {
        if (isFrota) {
            return motorista?.nome || motorista?.nome_razao_social || 'Motorista';
        }
        return motorista?.nome_razao_social || motorista?.nome || 'Frota';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>
                    {isFrota ? 'Enviar Proposta para' : 'Enviar Proposta para a Frota'} {getNomeDestinatario()}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tipo de Contrato</label>
                        <select
                            name="tipo_contrato"
                            value={formData.tipo_contrato}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="SALARIO">Salário Mensal</option>
                            <option value="COMISSAO">Comissão por Frete</option>
                            <option value="MISTO">Misto (Salário + Comissão)</option>
                        </select>
                    </div>

                    {formData.tipo_contrato === 'SALARIO' && (
                        <div className="form-group">
                            <label>Valor do Salário (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="valor_salario"
                                value={formData.valor_salario}
                                onChange={handleChange}
                                className={`form-input ${errors.valor_salario ? 'error' : ''}`}
                                placeholder="3500.00"
                            />
                            {errors.valor_salario && (
                                <span className="error-message">{errors.valor_salario}</span>
                            )}
                        </div>
                    )}

                    {formData.tipo_contrato === 'COMISSAO' && (
                        <div className="form-group">
                            <label>Comissão (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="valor_comissao"
                                value={formData.valor_comissao}
                                onChange={handleChange}
                                className={`form-input ${errors.valor_comissao ? 'error' : ''}`}
                                placeholder="10.00"
                            />
                            {errors.valor_comissao && (
                                <span className="error-message">{errors.valor_comissao}</span>
                            )}
                        </div>
                    )}

                    {formData.tipo_contrato === 'MISTO' && (
                        <>
                            <div className="form-group">
                                <label>Valor do Salário (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="valor_salario"
                                    value={formData.valor_salario}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="2500.00"
                                />
                            </div>
                            <div className="form-group">
                                <label>Comissão (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="valor_comissao"
                                    value={formData.valor_comissao}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="5.00"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Mensagem</label>
                        <textarea
                            name="mensagem"
                            value={formData.mensagem}
                            onChange={handleChange}
                            className="form-textarea"
                            rows={3}
                            placeholder="Descreva sua proposta..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Disponibilidade</label>
                            <select
                                name="disponibilidade"
                                value={formData.disponibilidade}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Integral">Integral</option>
                                <option value="Meio Período">Meio Período</option>
                                <option value="Fim de Semana">Fim de Semana</option>
                                <option value="Sob Demanda">Sob Demanda</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Data de Validade</label>
                            <input
                                type="date"
                                name="data_validade"
                                value={formData.data_validade}
                                onChange={handleChange}
                                className={`form-input ${errors.data_validade ? 'error' : ''}`}
                            />
                            {errors.data_validade && (
                                <span className="error-message">{errors.data_validade}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Data de Início Prevista</label>
                        <input
                            type="date"
                            name="data_inicio_prevista"
                            value={formData.data_inicio_prevista}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

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
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Proposta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}