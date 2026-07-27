// components/motoristas/ModalContraProposta.jsx
import { useState } from 'react';
import { useMotoristas } from '../hooks/useMotoristas';

export default function ModalContraProposta({ proposta, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tipo_contrato: proposta.tipo_contrato || 'SALARIO',
        valor_salario: proposta.valor_salario || '',
        valor_comissao: proposta.valor_comissao || '',
        valor_adiantamento: proposta.valor_adiantamento || '',
        mensagem: '',
        carga_horaria: proposta.carga_horaria || '',
        dias_descanso: proposta.dias_descanso || '',
        periodo_experiencia: proposta.periodo_experiencia || 90
    });
    const [errors, setErrors] = useState({});

    const { enviarContraProposta } = useMotoristas();

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
        setErrors(novosErrors);
        return Object.keys(novosErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
                valor_salario: formData.valor_salario ? parseFloat(formData.valor_salario) : null,
                valor_comissao: formData.valor_comissao ? parseFloat(formData.valor_comissao) : null,
                valor_adiantamento: formData.valor_adiantamento ? parseFloat(formData.valor_adiantamento) : null
            };

            await enviarContraProposta(proposta.id, payload);
            alert('Contraproposta enviada com sucesso!');
            onSuccess();
        } catch (err) {
            console.error('Erro ao enviar contraproposta:', err);
            alert(err.response?.data?.error || 'Erro ao enviar contraproposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Contraproposta para {proposta.motorista_nome}</h3>
                <p className="modal-subtitle">Modifique os termos da proposta e reenvie.</p>

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
                            <label>Valor do Salário (R$) <span>*</span></label>
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
                            <label>Comissão (%) <span>*</span></label>
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

                    <div className="form-group">
                        <label>Mensagem</label>
                        <textarea
                            name="mensagem"
                            value={formData.mensagem}
                            onChange={handleChange}
                            className="form-textarea"
                            rows={3}
                            placeholder="Explique sua contraproposta..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Carga Horária</label>
                            <input
                                type="text"
                                name="carga_horaria"
                                value={formData.carga_horaria}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="40 horas semanais"
                            />
                        </div>
                        <div className="form-group">
                            <label>Dias de Descanso</label>
                            <input
                                type="text"
                                name="dias_descanso"
                                value={formData.dias_descanso}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="1 dia por semana"
                            />
                        </div>
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
                            {loading ? 'Enviando...' : 'Enviar Contraproposta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}