import { useState } from 'react';
import Input from './Input';
import Button from './Button';

export default function FormFretes({ onSubmit, isLoading = false }) {
    const [formData, setFormData] = useState({
        origem_cep: '',
        origem_logradouro: '',
        origem_numero: '',
        origem_complemento: '',
        origem_bairro: '',
        origem_cidade: '',
        origem_estado: '',
        destino_cep: '',
        destino_logradouro: '',
        destino_numero: '',
        destino_complemento: '',
        destino_bairro: '',
        destino_cidade: '',
        destino_estado: '',
        tipo_carga: '',
        descricao_carga: '',
        peso_kg: '',
        volume_m3: '',
        pallets: '',
        valor_ofertado: '',
        data_coleta_prevista: '',
        data_entrega_prevista: '',
        data_limite_candidatura: '',
        prioridade: 'NORMAL'
    });

    const [errors, setErrors] = useState({});
    const [buscandoCep, setBuscandoCep] = useState({ origem: false, destino: false });

    const buscarEnderecoPorCep = async (cep, tipo) => {
        const cepLimpo = cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            return;
        }
        
        setBuscandoCep(prev => ({ ...prev, [tipo]: true }));
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                if (tipo === 'origem') {
                    setFormData(prev => ({
                        ...prev,
                        origem_logradouro: data.logradouro || '',
                        origem_bairro: data.bairro || '',
                        origem_cidade: data.localidade || '',
                        origem_estado: data.uf || ''
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        destino_logradouro: data.logradouro || '',
                        destino_bairro: data.bairro || '',
                        destino_cidade: data.localidade || '',
                        destino_estado: data.uf || ''
                    }));
                }
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setBuscandoCep(prev => ({ ...prev, [tipo]: false }));
        }
    };

    const aplicarMascaraCep = (value) => {
        const cep = value.replace(/\D/g, '');
        if (cep.length <= 5) {
            return cep;
        }
        return cep.replace(/(\d{5})(\d)/, '$1-$2');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let valorFormatado = value;
        
        if (name === 'origem_cep') {
            valorFormatado = aplicarMascaraCep(value);
            if (value.replace(/\D/g, '').length === 8) {
                buscarEnderecoPorCep(value, 'origem');
            }
        }
        
        if (name === 'destino_cep') {
            valorFormatado = aplicarMascaraCep(value);
            if (value.replace(/\D/g, '').length === 8) {
                buscarEnderecoPorCep(value, 'destino');
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: valorFormatado
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

   const validarFormulario = () => {
    const novosErrors = {};

    if (!formData.origem_cep) {
        novosErrors.origem_cep = 'CEP de origem e obrigatorio';
    } else if (formData.origem_cep.replace(/\D/g, '').length !== 8) {
        novosErrors.origem_cep = 'CEP invalido';
    }

    if (!formData.origem_logradouro) novosErrors.origem_logradouro = 'Logradouro e obrigatorio';
    if (!formData.origem_numero) novosErrors.origem_numero = 'Numero e obrigatorio';
    if (!formData.origem_cidade) novosErrors.origem_cidade = 'Cidade e obrigatoria';
    if (!formData.origem_estado) novosErrors.origem_estado = 'Estado e obrigatorio';

    if (!formData.destino_cep) {
        novosErrors.destino_cep = 'CEP de destino e obrigatorio';
    } else if (formData.destino_cep.replace(/\D/g, '').length !== 8) {
        novosErrors.destino_cep = 'CEP invalido';
    }

    if (!formData.destino_logradouro) novosErrors.destino_logradouro = 'Logradouro e obrigatorio';
    if (!formData.destino_numero) novosErrors.destino_numero = 'Numero e obrigatorio';
    if (!formData.destino_cidade) novosErrors.destino_cidade = 'Cidade e obrigatoria';
    if (!formData.destino_estado) novosErrors.destino_estado = 'Estado e obrigatorio';

    if (!formData.tipo_carga) novosErrors.tipo_carga = 'Tipo de carga e obrigatorio';

    if (!formData.peso_kg) {
        novosErrors.peso_kg = 'Peso e obrigatorio';
    } else if (Number(formData.peso_kg) <= 0) {
        novosErrors.peso_kg = 'Peso deve ser maior que zero';
    }

    if (!formData.valor_ofertado) {
        novosErrors.valor_ofertado = 'Valor e obrigatorio';
    } else if (Number(formData.valor_ofertado) <= 0) {
        novosErrors.valor_ofertado = 'Valor deve ser maior que zero';
    }

    if (!formData.data_coleta_prevista) novosErrors.data_coleta_prevista = 'Data de coleta e obrigatoria';
    if (!formData.data_entrega_prevista) novosErrors.data_entrega_prevista = 'Data de entrega e obrigatoria';

    if (formData.data_coleta_prevista && formData.data_entrega_prevista) {
        if (new Date(formData.data_coleta_prevista) > new Date(formData.data_entrega_prevista)) {
            novosErrors.data_entrega_prevista = 'Data de entrega deve ser depois da data de coleta';
        }
    }

    setErrors(novosErrors);
    
    // 🌟 LOG PROVISÓRIO PARA MATAR O PROBLEMA:
    if (Object.keys(novosErrors).length > 0) {
        console.error("Campos com erro de validacao:", novosErrors);
    }

    return Object.keys(novosErrors).length === 0;
}; 

const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario submetido! Iniciando validacao...", formData);
    
    if (validarFormulario()) {
        console.log("Formulario valido! Montando objeto de envio...");
        
        const dadosParaEnviar = {
            ...formData,
            origem_endereco: `${formData.origem_logradouro}, ${formData.origem_numero}${formData.origem_complemento ? ', ' + formData.origem_complemento : ''} - ${formData.origem_bairro}, ${formData.origem_cidade} - ${formData.origem_estado}`,
            destino_endereco: `${formData.destino_logradouro}, ${formData.destino_numero}${formData.destino_complemento ? ', ' + formData.destino_complemento : ''} - ${formData.destino_bairro}, ${formData.destino_cidade} - ${formData.destino_estado}`
        };
        
        console.log("Dados prontos para o onSubmit:", dadosParaEnviar);
        onSubmit(dadosParaEnviar);
    } else {
        console.warn("A validacao do formulario falhou. Verifique os campos obrigatorios ou erros no estado.");
    }
};

    return (
        <form onSubmit={handleSubmit} className="form-frete">
            {/* SECAO ORIGEM */}
            <div className="form-section">
                <h3 className="form-section-title">Origem</h3>
                <div className="form-group">
                    <Input
                        label="CEP"
                        name="origem_cep"
                        value={formData.origem_cep}
                        onChange={handleChange}
                        error={errors.origem_cep}
                        placeholder="00000-000"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Logradouro"
                        name="origem_logradouro"
                        value={formData.origem_logradouro}
                        onChange={handleChange}
                        error={errors.origem_logradouro}
                        placeholder="Rua, Avenida, etc"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Numero"
                        name="origem_numero"
                        value={formData.origem_numero}
                        onChange={handleChange}
                        error={errors.origem_numero}
                        placeholder="123"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Complemento"
                        name="origem_complemento"
                        value={formData.origem_complemento}
                        onChange={handleChange}
                        placeholder="Apto, Sala, etc"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Bairro"
                        name="origem_bairro"
                        value={formData.origem_bairro}
                        onChange={handleChange}
                        error={errors.origem_bairro}
                        placeholder="Centro"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Cidade"
                        name="origem_cidade"
                        value={formData.origem_cidade}
                        onChange={handleChange}
                        error={errors.origem_cidade}
                        placeholder="Sao Paulo"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Estado"
                        name="origem_estado"
                        value={formData.origem_estado}
                        onChange={handleChange}
                        error={errors.origem_estado}
                        placeholder="SP"
                        required
                    />
                </div>
            </div>

            {/* SECAO DESTINO */}
            <div className="form-section">
                <h3 className="form-section-title">Destino</h3>
                <div className="form-group">
                    <Input
                        label="CEP"
                        name="destino_cep"
                        value={formData.destino_cep}
                        onChange={handleChange}
                        error={errors.destino_cep}
                        placeholder="00000-000"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Logradouro"
                        name="destino_logradouro"
                        value={formData.destino_logradouro}
                        onChange={handleChange}
                        error={errors.destino_logradouro}
                        placeholder="Rua, Avenida, etc"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Numero"
                        name="destino_numero"
                        value={formData.destino_numero}
                        onChange={handleChange}
                        error={errors.destino_numero}
                        placeholder="123"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Complemento"
                        name="destino_complemento"
                        value={formData.destino_complemento}
                        onChange={handleChange}
                        placeholder="Apto, Sala, etc"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Bairro"
                        name="destino_bairro"
                        value={formData.destino_bairro}
                        onChange={handleChange}
                        error={errors.destino_bairro}
                        placeholder="Centro"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Cidade"
                        name="destino_cidade"
                        value={formData.destino_cidade}
                        onChange={handleChange}
                        error={errors.destino_cidade}
                        placeholder="Rio de Janeiro"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Estado"
                        name="destino_estado"
                        value={formData.destino_estado}
                        onChange={handleChange}
                        error={errors.destino_estado}
                        placeholder="RJ"
                        required
                    />
                </div>
            </div>

            {/* SECAO CARGA */}
            <div className="form-section">
                <h3 className="form-section-title">Carga</h3>
                <div className="form-group">
                    <label htmlFor="tipo_carga">
                        Tipo de Carga <span>*</span>
                    </label>
                    <select
                        id="tipo_carga"
                        name="tipo_carga"
                        value={formData.tipo_carga}
                        onChange={handleChange}
                        className={`form-select ${errors.tipo_carga ? 'error' : ''}`}
                    >
                        <option value="">Selecione o tipo de carga</option>
                        <option value="ALIMENTOS">Alimentos</option>
                        <option value="BEBIDAS">Bebidas</option>
                        <option value="ELETRONICOS">Eletronicos</option>
                        <option value="MEDICAMENTOS">Medicamentos</option>
                        <option value="PRODUTOS_QUIMICOS">Produtos Quimicos</option>
                        <option value="MATERIAIS_CONSTRUCAO">Materiais de Construcao</option>
                        <option value="MOVEIS">Moveis</option>
                        <option value="PECAS_AUTOMOTIVAS">Pecas Automotivas</option>
                        <option value="OUTROS">Outros</option>
                    </select>
                    {errors.tipo_carga && <span className="error-message">{errors.tipo_carga}</span>}
                </div>
                <div className="form-group">
                    <Input
                        label="Descricao da Carga"
                        name="descricao_carga"
                        value={formData.descricao_carga}
                        onChange={handleChange}
                        placeholder="Descreva a carga (opcional)"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Peso (kg)"
                        name="peso_kg"
                        type="number"
                        value={formData.peso_kg}
                        onChange={handleChange}
                        error={errors.peso_kg}
                        placeholder="5000"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Volume (m³)"
                        name="volume_m3"
                        type="number"
                        step="0.01"
                        value={formData.volume_m3}
                        onChange={handleChange}
                        placeholder="20"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Pallets"
                        name="pallets"
                        type="number"
                        value={formData.pallets}
                        onChange={handleChange}
                        placeholder="2"
                    />
                </div>
            </div>

            {/* SECAO VALORES E DATAS */}
            <div className="form-section">
                <h3 className="form-section-title">Valores e Datas</h3>
                <div className="form-group">
                    <Input
                        label="Valor Ofertado (R$)"
                        name="valor_ofertado"
                        type="number"
                        step="0.01"
                        value={formData.valor_ofertado}
                        onChange={handleChange}
                        error={errors.valor_ofertado}
                        placeholder="2500,00"
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Data Prevista para Coleta"
                        name="data_coleta_prevista"
                        type="datetime-local"
                        value={formData.data_coleta_prevista}
                        onChange={handleChange}
                        error={errors.data_coleta_prevista}
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Data Prevista para Entrega"
                        name="data_entrega_prevista"
                        type="datetime-local"
                        value={formData.data_entrega_prevista}
                        onChange={handleChange}
                        error={errors.data_entrega_prevista}
                        required
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Data Limite para Candidatura"
                        name="data_limite_candidatura"
                        type="datetime-local"
                        value={formData.data_limite_candidatura}
                        onChange={handleChange}
                        placeholder="Opcional"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="prioridade">Prioridade</label>
                    <select
                        id="prioridade"
                        name="prioridade"
                        value={formData.prioridade}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="BAIXA">Baixa Prioridade</option>
                        <option value="NORMAL">Normal</option>
                        <option value="ALTA">Alta Prioridade</option>
                        <option value="URGENTE">Urgente</option>
                    </select>
                </div>
            </div>

            <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Publicando...' : 'Publicar Frete'}
            </Button>
        </form>
    );
}