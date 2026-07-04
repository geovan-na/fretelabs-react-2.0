export default function FormVeiculos({onSubmit, isLoading = false}) {

    const [formData, setFormData] = useState({
        placa: '',
        modelo: '',
        marca: '',
        ano_modelo: '',
        capacidade_kg: '',
        capacidade_m3: '',
        tipo_carroceria: '',
        tipo_veiculo: '',
        eixos: ''
    });

    const [errors, setErrors] = useState({});

    const aplicarMascaraPlaca = (value) => {
        let placa = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (placa.length <= 3) {
            return placa;
        } else if (placa.length <= 4) {
            return `${placa.slice(0, 3)}${placa.slice(3)}`;
        } else {
            return `${placa.slice(0, 3)}${placa.slice(3, 4)}${placa.slice(4, 7)}`;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let valorFormatado = value;
        
        if (name === 'placa') {
            valorFormatado = aplicarMascaraPlaca(value);
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

        // Validação da placa
        if (!formData.placa) {
            novosErrors.placa = 'Placa é obrigatória';
        } else if (!/^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$/.test(formData.placa)) {
            novosErrors.placa = 'Placa inválida (formato: ABC1D23)';
        }

        // Validação do modelo
        if (!formData.modelo) {
            novosErrors.modelo = 'Modelo é obrigatório';
        }

        // Validação da capacidade KG
        if (formData.capacidade_kg && formData.capacidade_kg < 0) {
            novosErrors.capacidade_kg = 'Capacidade deve ser maior que 0';
        }

        // Validação dos eixos
        if (formData.eixos && (formData.eixos < 2 || formData.eixos > 9)) {
            novosErrors.eixos = 'Número de eixos inválido (2 a 9)';
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
    
    <form onSubmit={handleSubmit} className="form-veiculo">
            <div className="form-row">
                <Input
                    label="PLACA"
                    name="placa"
                    value={formData.placa}
                    onChange={handleChange}
                    error={errors.placa}
                    placeholder="ABC1D23"
                    required
                />

                <Input
                    label="MODELO"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    error={errors.modelo}
                    placeholder="Scania R450"
                    required
                />

                <Input
                    label="MARCA"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Scania, Volvo, Mercedes"
                />
            </div>

            <div className="form-row">
                <Input
                    label="ANO DO MODELO"
                    name="ano_modelo"
                    type="number"
                    value={formData.ano_modelo}
                    onChange={handleChange}
                    placeholder="2024"
                />

                <Input
                    label="CAPACIDADE (KG)"
                    name="capacidade_kg"
                    type="number"
                    value={formData.capacidade_kg}
                    onChange={handleChange}
                    error={errors.capacidade_kg}
                    placeholder="25000"
                />

                <Input
                    label="CAPACIDADE (M³)"
                    name="capacidade_m3"
                    type="number"
                    step="0.01"
                    value={formData.capacidade_m3}
                    onChange={handleChange}
                    placeholder="80"
                />
            </div>

            <div className="form-row">
                <select
                    name="tipo_carroceria"
                    value={formData.tipo_carroceria}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="">Selecione o tipo de carroceria</option>
                    <option value="BAU">Baú</option>
                    <option value="SIDER">Sider</option>
                    <option value="GRANELEIRO">Graneleiro</option>
                    <option value="FRIGORIFICO">Frigorífico</option>
                    <option value="PRANCHA">Prancha</option>
                    <option value="PORTA_CONTAINER">Porta Container</option>
                </select>

                <select
                    name="tipo_veiculo"
                    value={formData.tipo_veiculo}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="">Selecione o tipo de veículo</option>
                    <option value="VUC">VUC (até 3.500kg)</option>
                    <option value="TOCO">Toco (2 eixos)</option>
                    <option value="TRUCK">Truck (3 eixos)</option>
                    <option value="BITREM">Bitrem (7+ eixos)</option>
                    <option value="RODOTREM">Rodotrem (9+ eixos)</option>
                    <option value="CARRETA">Carreta (5 eixos)</option>
                </select>

                <Input
                    label="NÚMERO DE EIXOS"
                    name="eixos"
                    type="number"
                    value={formData.eixos}
                    onChange={handleChange}
                    error={errors.eixos}
                    placeholder="2 a 9"
                />
            </div>

            <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'CADASTRANDO...' : 'CADASTRAR VEÍCULO'}
            </Button>
        </form>
    );
}
