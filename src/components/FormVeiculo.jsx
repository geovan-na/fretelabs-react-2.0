// components/FormVeiculo.jsx
import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';

export default function FormVeiculo({ 
    dadosIniciais = null, 
    onSubmit, 
    isLoading = false,
    onCancel 
}) {
    const [formData, setFormData] = useState({
        transportador_id: '',
        placa: '',
        renavam: '',
        modelo: '',
        marca: '',
        ano_fabricacao: '',
        ano_modelo: '',
        capacidade_kg: '',
        capacidade_m3: '',
        tipo_carroceria: '',
        tipo_veiculo: '',
        eixos: '',
        possui_rastreador: false,
        possui_seguro: false,
        seguro_apolice: '',
        seguro_validade: '',
        status: 'ATIVO'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (dadosIniciais) {
            setFormData({
                transportador_id: dadosIniciais.transportador_id || '',
                placa: dadosIniciais.placa || '',
                renavam: dadosIniciais.renavam || '',
                modelo: dadosIniciais.modelo || '',
                marca: dadosIniciais.marca || '',
                ano_fabricacao: dadosIniciais.ano_fabricacao || '',
                ano_modelo: dadosIniciais.ano_modelo || '',
                capacidade_kg: dadosIniciais.capacidade_kg || '',
                capacidade_m3: dadosIniciais.capacidade_m3 || '',
                tipo_carroceria: dadosIniciais.tipo_carroceria || '',
                tipo_veiculo: dadosIniciais.tipo_veiculo || '',
                eixos: dadosIniciais.eixos || '',
                possui_rastreador: dadosIniciais.possui_rastreador || false,
                possui_seguro: dadosIniciais.possui_seguro || false,
                seguro_apolice: dadosIniciais.seguro_apolice || '',
                seguro_validade: dadosIniciais.seguro_validade || '',
                status: dadosIniciais.status || 'ATIVO'
            });
        }
    }, [dadosIniciais]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validarFormulario = () => {
        const novosErrors = {};

        if (!formData.placa) {
            novosErrors.placa = 'Placa é obrigatória';
        }
        if (!formData.modelo) {
            novosErrors.modelo = 'Modelo é obrigatório';
        }
        if (!formData.tipo_veiculo) {
            novosErrors.tipo_veiculo = 'Tipo de veículo é obrigatório';
        }

        setErrors(novosErrors);
        return Object.keys(novosErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validarFormulario()) {
            // Converter campos para números
            const dadosParaEnviar = {
                ...formData,
                ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao) : null,
                ano_modelo: formData.ano_modelo ? parseInt(formData.ano_modelo) : null,
                capacidade_kg: formData.capacidade_kg ? parseFloat(formData.capacidade_kg) : null,
                capacidade_m3: formData.capacidade_m3 ? parseFloat(formData.capacidade_m3) : null,
                eixos: formData.eixos ? parseInt(formData.eixos) : null
            };
            onSubmit(dadosParaEnviar);
        }
    };

    const tiposVeiculo = [
        { value: 'VUC', label: 'VUC' },
        { value: 'TOCO', label: 'Toco' },
        { value: 'TRUCK', label: 'Truck' },
        { value: 'BITREM', label: 'Bitrem' },
        { value: 'RODOTREM', label: 'Rodotrem' },
        { value: 'CARRETA', label: 'Carreta' }
    ];

    const statusOptions = [
        { value: 'ATIVO', label: 'Ativo' },
        { value: 'INATIVO', label: 'Inativo' },
        { value: 'MANUTENCAO', label: 'Em Manutenção' }
    ];

    return (
        <form onSubmit={handleSubmit} className="form-veiculo">
            <div className="form-row">
                <Input
                    label="Placa"
                    name="placa"
                    value={formData.placa}
                    onChange={handleChange}
                    error={errors.placa}
                    placeholder="ABC-1234"
                    required
                />
                <Input
                    label="Renavam"
                    name="renavam"
                    value={formData.renavam}
                    onChange={handleChange}
                    placeholder="12345678901"
                />
            </div>

            <div className="form-row">
                <Input
                    label="Modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    error={errors.modelo}
                    placeholder="Scania R450"
                    required
                />
                <Input
                    label="Marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Scania"
                />
            </div>

            <div className="form-row">
                <Input
                    label="Ano de Fabricação"
                    name="ano_fabricacao"
                    type="number"
                    value={formData.ano_fabricacao}
                    onChange={handleChange}
                    placeholder="2022"
                />
                <Input
                    label="Ano Modelo"
                    name="ano_modelo"
                    type="number"
                    value={formData.ano_modelo}
                    onChange={handleChange}
                    placeholder="2023"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Tipo de Veículo</label>
                    <select
                        name="tipo_veiculo"
                        value={formData.tipo_veiculo}
                        onChange={handleChange}
                        className={`form-select ${errors.tipo_veiculo ? 'error' : ''}`}
                    >
                        <option value="">Selecione</option>
                        {tiposVeiculo.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </select>
                    {errors.tipo_veiculo && (
                        <span className="error-message">{errors.tipo_veiculo}</span>
                    )}
                </div>
                <Input
                    label="Tipo de Carroceria"
                    name="tipo_carroceria"
                    value={formData.tipo_carroceria}
                    onChange={handleChange}
                    placeholder="Baú, Grade, etc"
                />
            </div>

            <div className="form-row">
                <Input
                    label="Capacidade (kg)"
                    name="capacidade_kg"
                    type="number"
                    value={formData.capacidade_kg}
                    onChange={handleChange}
                    placeholder="25000"
                />
                <Input
                    label="Capacidade (m³)"
                    name="capacidade_m3"
                    type="number"
                    step="0.01"
                    value={formData.capacidade_m3}
                    onChange={handleChange}
                    placeholder="100"
                />
            </div>

            <div className="form-row">
                <Input
                    label="Eixos"
                    name="eixos"
                    type="number"
                    value={formData.eixos}
                    onChange={handleChange}
                    placeholder="3"
                />
                <div className="form-group">
                    <label>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-section">
                <h4 className="form-section-title">Seguro e Rastreamento</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="possui_rastreador"
                                checked={formData.possui_rastreador}
                                onChange={handleChange}
                            />
                            Possui Rastreador
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="possui_seguro"
                                checked={formData.possui_seguro}
                                onChange={handleChange}
                            />
                            Possui Seguro
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <Input
                        label="Apólice de Seguro"
                        name="seguro_apolice"
                        value={formData.seguro_apolice}
                        onChange={handleChange}
                        placeholder="123456789"
                    />
                    <Input
                        label="Validade do Seguro"
                        name="seguro_validade"
                        type="date"
                        value={formData.seguro_validade}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-actions">
                {onCancel && (
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                )}
                <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : dadosIniciais ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
                </Button>
            </div>
        </form>
    );
}
