// components/DadosBancariosForm.jsx
import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';

export default function DadosBancariosForm({ 
    dadosIniciais = null, 
    onSubmit, 
    isLoading = false,
    onCancel 
}) {
    const [formData, setFormData] = useState({
        banco: '',
        agencia: '',
        conta: '',
        digito: '',
        tipo_conta: 'CORRENTE',
        pix_chave: '',
        pix_tipo: '',
        titular: '',
        cpf_cnpj_titular: '',
        principal: false
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (dadosIniciais) {
            setFormData({
                banco: dadosIniciais.banco || '',
                agencia: dadosIniciais.agencia || '',
                conta: dadosIniciais.conta || '',
                digito: dadosIniciais.digito || '',
                tipo_conta: dadosIniciais.tipo_conta || 'CORRENTE',
                pix_chave: dadosIniciais.pix_chave || '',
                pix_tipo: dadosIniciais.pix_tipo || '',
                titular: dadosIniciais.titular || '',
                cpf_cnpj_titular: dadosIniciais.cpf_cnpj_titular || '',
                principal: dadosIniciais.principal || false
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

        if (!formData.banco) {
            novosErrors.banco = 'Banco é obrigatório';
        }
        if (!formData.agencia) {
            novosErrors.agencia = 'Agência é obrigatória';
        }
        if (!formData.conta) {
            novosErrors.conta = 'Conta é obrigatória';
        }
        if (!formData.titular) {
            novosErrors.titular = 'Titular é obrigatório';
        }

        setErrors(novosErrors);
        return Object.keys(novosErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validarFormulario()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="dados-bancarios-form">
            {/* BANCO E AGÊNCIA */}
            <div className="form-row">
                <Input
                    label="Banco"
                    name="banco"
                    value={formData.banco}
                    onChange={handleChange}
                    error={errors.banco}
                    placeholder="001 - Banco do Brasil"
                    required
                />
                <Input
                    label="Agência"
                    name="agencia"
                    value={formData.agencia}
                    onChange={handleChange}
                    error={errors.agencia}
                    placeholder="0001"
                    required
                />
            </div>

            {/* CONTA E DÍGITO */}
            <div className="form-row">
                <Input
                    label="Conta"
                    name="conta"
                    value={formData.conta}
                    onChange={handleChange}
                    error={errors.conta}
                    placeholder="12345"
                    required
                />
                <Input
                    label="Dígito"
                    name="digito"
                    value={formData.digito}
                    onChange={handleChange}
                    placeholder="0"
                />
            </div>

            {/* TIPO DE CONTA */}
            <div className="form-group">
                <label htmlFor="tipo_conta">Tipo de Conta</label>
                <select
                    id="tipo_conta"
                    name="tipo_conta"
                    value={formData.tipo_conta}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="CORRENTE">Conta Corrente</option>
                    <option value="POUPANCA">Conta Poupança</option>
                    <option value="SALARIO">Conta Salário</option>
                </select>
            </div>

            {/* TITULAR E CPF/CNPJ */}
            <div className="form-row">
                <Input
                    label="Titular"
                    name="titular"
                    value={formData.titular}
                    onChange={handleChange}
                    error={errors.titular}
                    placeholder="Nome completo do titular"
                    required
                />
                <Input
                    label="CPF/CNPJ do Titular"
                    name="cpf_cnpj_titular"
                    value={formData.cpf_cnpj_titular}
                    onChange={handleChange}
                    placeholder="123.456.789-00"
                />
            </div>

            {/* PIX */}
            <div className="form-section">
                <h4 className="form-section-title">PIX</h4>
                <div className="form-row">
                    <Input
                        label="Chave PIX"
                        name="pix_chave"
                        value={formData.pix_chave}
                        onChange={handleChange}
                        placeholder="email@exemplo.com ou telefone"
                    />
                    <div className="form-group">
                        <label htmlFor="pix_tipo">Tipo de Chave</label>
                        <select
                            id="pix_tipo"
                            name="pix_tipo"
                            value={formData.pix_tipo}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">Selecione o tipo de chave</option>
                            <option value="CPF">CPF</option>
                            <option value="CNPJ">CNPJ</option>
                            <option value="EMAIL">E-mail</option>
                            <option value="TELEFONE">Telefone</option>
                            <option value="ALEATORIA">Chave Aleatória</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* CONTA PRINCIPAL */}
            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="principal"
                        checked={formData.principal}
                        onChange={handleChange}
                    />
                    Definir como conta principal
                </label>
            </div>

            {/* BOTÕES */}
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
                    {isLoading ? 'Salvando...' : dadosIniciais ? 'Atualizar Dados Bancários' : 'Cadastrar Dados Bancários'}
                </Button>
            </div>
        </form>
    );
}