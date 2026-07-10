// components/FormAvaliacao.jsx
import { useState } from 'react';
import Button from './Button';

export default function FormAvaliacao({ 
    onSubmit, 
    isLoading = false,
    onCancel,
    tipo = 'EMPRESA_TRANSPORTADOR',
    nomeAvaliado
}) {
    const [formData, setFormData] = useState({
        nota_geral: 0,
        nota_pontualidade: 0,
        nota_comunicacao: 0,
        nota_cuidado_carga: 0,
        comentario: ''
    });

    const [errors, setErrors] = useState({});
    const [hoverNota, setHoverNota] = useState({
        geral: 0,
        pontualidade: 0,
        comunicacao: 0,
        cuidado: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNotaChange = (campo, nota) => {
        setFormData(prev => ({ ...prev, [campo]: nota }));
        if (errors[campo]) {
            setErrors(prev => ({ ...prev, [campo]: '' }));
        }
    };

    const validarFormulario = () => {
        const novosErrors = {};

        if (!formData.nota_geral || formData.nota_geral === 0) {
            novosErrors.nota_geral = 'Nota geral é obrigatória';
        }
        if (!formData.nota_pontualidade || formData.nota_pontualidade === 0) {
            novosErrors.nota_pontualidade = 'Nota de pontualidade é obrigatória';
        }
        if (!formData.nota_comunicacao || formData.nota_comunicacao === 0) {
            novosErrors.nota_comunicacao = 'Nota de comunicação é obrigatória';
        }
        if (!formData.nota_cuidado_carga || formData.nota_cuidado_carga === 0) {
            novosErrors.nota_cuidado_carga = 'Nota de cuidado com carga é obrigatória';
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

    const renderEstrelas = (campo, nota, hover) => {
        const estrelas = [];
        for (let i = 1; i <= 5; i++) {
            const preenchida = i <= (hover || nota);
            estrelas.push(
                <span
                    key={i}
                    className={`estrela-input ${preenchida ? 'cheia' : 'vazia'}`}
                    onMouseEnter={() => setHoverNota(prev => ({ ...prev, [campo]: i }))}
                    onMouseLeave={() => setHoverNota(prev => ({ ...prev, [campo]: 0 }))}
                    onClick={() => handleNotaChange(campo, i)}
                >
                    ★
                </span>
            );
        }
        return estrelas;
    };

    return (
        <form onSubmit={handleSubmit} className="form-avaliacao">
            <div className="form-avaliacao-header">
                <h3>Avaliar {nomeAvaliado || 'Usuário'}</h3>
                <p className="form-avaliacao-subtitle">
                    {tipo === 'EMPRESA_TRANSPORTADOR' 
                        ? 'Avalie o transportador que realizou o frete'
                        : 'Avalie o embarcador que contratou o frete'
                    }
                </p>
            </div>

            <div className="form-avaliacao-campos">
                <div className="form-avaliacao-nota">
                    <label>
                        Nota Geral <span>*</span>
                    </label>
                    <div className="estrelas-container">
                        {renderEstrelas('nota_geral', formData.nota_geral, hoverNota.geral)}
                        {formData.nota_geral > 0 && (
                            <span className="nota-valor">{formData.nota_geral.toFixed(1)}</span>
                        )}
                    </div>
                    {errors.nota_geral && (
                        <span className="error-message">{errors.nota_geral}</span>
                    )}
                </div>

                <div className="form-avaliacao-nota">
                    <label>
                        Pontualidade <span>*</span>
                    </label>
                    <div className="estrelas-container">
                        {renderEstrelas('nota_pontualidade', formData.nota_pontualidade, hoverNota.pontualidade)}
                        {formData.nota_pontualidade > 0 && (
                            <span className="nota-valor">{formData.nota_pontualidade.toFixed(1)}</span>
                        )}
                    </div>
                    {errors.nota_pontualidade && (
                        <span className="error-message">{errors.nota_pontualidade}</span>
                    )}
                </div>

                <div className="form-avaliacao-nota">
                    <label>
                        Comunicação <span>*</span>
                    </label>
                    <div className="estrelas-container">
                        {renderEstrelas('nota_comunicacao', formData.nota_comunicacao, hoverNota.comunicacao)}
                        {formData.nota_comunicacao > 0 && (
                            <span className="nota-valor">{formData.nota_comunicacao.toFixed(1)}</span>
                        )}
                    </div>
                    {errors.nota_comunicacao && (
                        <span className="error-message">{errors.nota_comunicacao}</span>
                    )}
                </div>

                <div className="form-avaliacao-nota">
                    <label>
                        Cuidado com Carga <span>*</span>
                    </label>
                    <div className="estrelas-container">
                        {renderEstrelas('nota_cuidado_carga', formData.nota_cuidado_carga, hoverNota.cuidado)}
                        {formData.nota_cuidado_carga > 0 && (
                            <span className="nota-valor">{formData.nota_cuidado_carga.toFixed(1)}</span>
                        )}
                    </div>
                    {errors.nota_cuidado_carga && (
                        <span className="error-message">{errors.nota_cuidado_carga}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Comentário (opcional)</label>
                    <textarea
                        name="comentario"
                        value={formData.comentario}
                        onChange={handleChange}
                        placeholder="Escreva um comentário sobre sua experiência..."
                        className="form-textarea"
                        rows={4}
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
                    {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
            </div>
        </form>
    );
}