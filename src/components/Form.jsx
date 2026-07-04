import { useState } from 'react';
import Input from './Input';
import Button from './Button';

export default function Form({ tipo, onSubmit }) {
    const [formData, setFormData] = useState({
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        inscricao_estadual: '',
        porte_empresa: '',
        rntrc: '',
        nome_completo: '',
        cpf: '',
        cnh: '',
        categoria_cnh: '',
        validade_cnh: ''
    });

    const [errors, setErrors] = useState({});
    
    // Máscaras
    const aplicarMascara = (name, value) => {
        if (name === 'cpf') {
            return value
                .replace(/\D/g, '')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+$/, '$1');
        }
        if (name === 'cnpj') {
            return value
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .replace(/(-\d{2})\d+$/, '$1');
        }
        if (name === 'telefone') {
            return value
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{4})\d+$/, '$1');
        }
        return value;
    };
    
    // Handler de mudança nos campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        const valorComMascara = aplicarMascara(name, value);
        
        setFormData(prev => ({
            ...prev,
            [name]: valorComMascara
        }));
        
        // Limpa erro do campo ao digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    // Validação do formulário
    const validarFormulario = () => {
        const novosErrors = {};
        
        // ===== VALIDAÇÕES COMUNS A TODOS =====
        if (!formData.email) {
            novosErrors.email = 'E-mail é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            novosErrors.email = 'E-mail inválido';
        }
        
        if (!formData.telefone) {
            novosErrors.telefone = 'Telefone é obrigatório';
        } else if (formData.telefone.replace(/\D/g, '').length < 10) {
            novosErrors.telefone = 'Telefone inválido';
        }
        
        if (!formData.senha) {
            novosErrors.senha = 'Senha é obrigatória';
        } else if (formData.senha.length < 6) {
            novosErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
        }
        
        if (formData.senha !== formData.confirmarSenha) {
            novosErrors.confirmarSenha = 'As senhas não coincidem';
        }
        
        // ===== EMBARCADOR ou FROTA (Pessoa Jurídica) =====
        if (tipo === 'embarcador' || tipo === 'frota') {
            if (!formData.razao_social) {
                novosErrors.razao_social = 'Razão Social é obrigatória';
            }
            if (!formData.cnpj) {
                novosErrors.cnpj = 'CNPJ é obrigatório';
            } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
                novosErrors.cnpj = 'CNPJ inválido';
            }
        }
        
        // ===== EMBARCADOR específico =====
        if (tipo === 'embarcador' && !formData.porte_empresa) {
            novosErrors.porte_empresa = 'Selecione o porte da empresa';
        }
        
        // ===== AUTÔNOMO ou VINCULADO (Pessoa Física) =====
        if (tipo === 'autonomo' || tipo === 'vinculado') {
            if (!formData.nome_completo) {
                novosErrors.nome_completo = 'Nome completo é obrigatório';
            }
            if (!formData.cpf) {
                novosErrors.cpf = 'CPF é obrigatório';
            } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
                novosErrors.cpf = 'CPF inválido';
            }
            if (!formData.cnh) {
                novosErrors.cnh = 'CNH é obrigatória';
            }
            if (!formData.categoria_cnh) {
                novosErrors.categoria_cnh = 'Categoria da CNH é obrigatória';
            }
        }
        
        // ===== VINCULADO específico =====
        if (tipo === 'vinculado' && !formData.validade_cnh) {
            novosErrors.validade_cnh = 'Validade da CNH é obrigatória';
        }
        
        setErrors(novosErrors);
        return Object.keys(novosErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validarFormulario()) {
            const payload = {
                tipo_usuario: tipo,
                tipo_pessoa: (tipo === 'embarcador' || tipo === 'frota') ? 'JURIDICA' : 'FISICA',
                nome_razao_social: (tipo === 'embarcador' || tipo === 'frota') ? formData.razao_social : formData.nome_completo,
                nome_fantasia: formData.nome_fantasia || null,
                cpf_cnpj: (tipo === 'embarcador' || tipo === 'frota') ? formData.cnpj : formData.cpf,
                email: formData.email,
                senha: formData.senha,
                telefone: formData.telefone
            };
            
            // Envia o payload tratado
            onSubmit(payload);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="register-form">
            {/* ===== EMBARCADOR ou FROTA ===== */}
            {(tipo === 'embarcador' || tipo === 'frota') && (
                <>
                    <Input
                        label="RAZÃO SOCIAL"
                        name="razao_social"
                        value={formData.razao_social}
                        onChange={handleChange}
                        error={errors.razao_social}
                        required
                    />
                    
                    <Input
                        label="NOME FANTASIA"
                        name="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={handleChange}
                        placeholder="Como a empresa é conhecida"
                    />
                    
                    <Input
                        label="CNPJ"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleChange}
                        error={errors.cnpj}
                        placeholder="Apenas números"
                        required
                    />
                    
                    <Input
                        label="INSCRIÇÃO ESTADUAL"
                        name="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={handleChange}
                        placeholder="Opcional"
                    />
                </>
            )}
            
            {/* ===== EMBARCADOR específico ===== */}
            {tipo === 'embarcador' && (
                <select
                    name="porte_empresa"
                    value={formData.porte_empresa}
                    onChange={handleChange}
                    className={`form-select ${errors.porte_empresa ? 'error' : ''}`}
                >
                    <option value="">Selecione o porte da empresa</option>
                    <option value="MEI">MEI</option>
                    <option value="ME">ME</option>
                    <option value="EPP">EPP</option>
                    <option value="MEDIA">Média Empresa</option>
                    <option value="GRANDE">Grande Empresa</option>
                </select>
            )}
            
            {/* ===== FROTA específico ===== */}
            {tipo === 'frota' && (
                <Input
                    label="REGISTRO NACIONAL (RNTRC)"
                    name="rntrc"
                    value={formData.rntrc}
                    onChange={handleChange}
                    placeholder="Registro na ANTT - Opcional"
                />
            )}
            
            {/* ===== AUTÔNOMO ou VINCULADO ===== */}
            {(tipo === 'autonomo' || tipo === 'vinculado') && (
                <>
                    <Input
                        label="NOME COMPLETO"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        error={errors.nome_completo}
                        placeholder="Seu nome completo"
                        required
                    />
                    
                    <Input
                        label="CPF"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        error={errors.cpf}
                        placeholder="Apenas números"
                        required
                    />
                    
                    <Input
                        label="CNH"
                        name="cnh"
                        value={formData.cnh}
                        onChange={handleChange}
                        error={errors.cnh}
                        placeholder="Número da Carteira Nacional de Habilitação"
                        required
                    />
                    
                    <select
                        name="categoria_cnh"
                        value={formData.categoria_cnh}
                        onChange={handleChange}
                        className={`form-select ${errors.categoria_cnh ? 'error' : ''}`}
                    >
                        <option value="">Selecione a categoria da CNH</option>
                        <option value="B">B - Veículos de até 3.500kg</option>
                        <option value="C">C - Veículos de carga acima de 3.500kg</option>
                        <option value="D">D - Veículos de passageiros</option>
                        <option value="E">E - Veículos com reboque</option>
                    </select>
                </>
            )}
            
            {/* ===== VINCULADO específico ===== */}
            {tipo === 'vinculado' && (
                <>
                    <Input
                        label="VALIDADE DA CNH"
                        name="validade_cnh"
                        type="date"
                        value={formData.validade_cnh}
                        onChange={handleChange}
                        error={errors.validade_cnh}
                        required
                    />
                    
                    <div className="info-box">
                        <p>ℹ️ Sobre o vínculo:</p>
                        <p>Você está se cadastrando como motorista vinculado a uma frota. 
                        Após o cadastro, você precisará ser aprovado por uma empresa de frota 
                        para começar a trabalhar. Você poderá se tornar autônomo posteriormente, 
                        seguindo as regras da plataforma.</p>
                    </div>
                </>
            )}
            
            {/* ===== CAMPOS COMUNS A TODOS ===== */}
            <Input
                label="E-MAIL"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="seu@email.com"
                required
            />
            
            <Input
                label="TELEFONE / CELULAR"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                error={errors.telefone}
                placeholder="(11) 99999-9999"
                required
            />
            
            <Input
                label="SENHA"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                error={errors.senha}
                placeholder="Mínimo 6 caracteres"
                required
            />
            
            <Input
                label="CONFIRMAR SENHA"
                name="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange}
                error={errors.confirmarSenha}
                placeholder="Digite a senha novamente"
                required
            />
            
            <Button type="submit" variant="primary">
                CRIAR CONTA GRATUITA
            </Button>
        </form>
    );
}

