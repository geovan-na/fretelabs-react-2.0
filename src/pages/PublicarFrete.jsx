// pages/PublicarFrete.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormFretes from '../components/FormFretes';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function PublicarFrete() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleSubmit = async (dados) => {
    setIsLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
        if (!user) {
            setMensagem({ tipo: 'erro', texto: 'Você precisa estar logado para publicar um frete.' });
            setIsLoading(false);
            return;
        }

        const embarcadorId = user.perfil_id;

        if (!embarcadorId) {
            setMensagem({ tipo: 'erro', texto: 'Perfil de embarcador não encontrado.' });
            setIsLoading(false);
            return;
        }

        // 1. Recupera o token salvo no localStorage para enviar na requisição
        const token = localStorage.getItem('token');

        // 2. Monta o payload limpo
        const payload = {
            embarcador_id: embarcadorId,
            origem_cep: dados.origem_cep,
            origem_endereco: dados.origem_endereco,
            destino_cep: dados.destino_cep,
            destino_endereco: dados.destino_endereco,
            tipo_carga: dados.tipo_carga,
            peso_kg: parseFloat(dados.peso_kg),
            valor_ofertado: parseFloat(dados.valor_ofertado),
            data_coleta_prevista: dados.data_coleta_prevista,
            data_entrega_prevista: dados.data_entrega_prevista
        };

        console.log('Enviando frete via api.fretes.criar...', payload);

        // 🌟 CORREÇÃO AQUI: Usa a estrutura correta do seu api.js passando o token
        const response = await api.fretes.criar(payload, token);

        setMensagem({
            tipo: 'sucesso',
            texto: `Frete publicado com sucesso!`
        });

    setTimeout(() => {
    navigate('/dashboard/embarcador/fretes');  // ← REDIRECIONAR PARA MEUS FRETES
}, 2000);

    } catch (error) {
        console.error('Erro ao publicar frete no Frontend:', error);
        
        // Exibe o erro real na tela para você não ficar no escuro
        const msg = error.message || 'Erro ao publicar frete. Tente novamente.';
        setMensagem({ tipo: 'erro', texto: msg });
        alert(msg); 
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="publicar-frete-container">
            <div className="page-header">
                <h1>Publicar Frete</h1>
                <p className="subtitle">
                    Preencha os dados abaixo para publicar um novo frete.
                    Transportadores de todo o Brasil poderao ver e se candidatar.
                </p>
            </div>

            {mensagem.texto && (
                <div className={`mensagem ${mensagem.tipo}`}>
                    {mensagem.texto}
                </div>
            )}

            <div className="form-wrapper">
                <FormFretes 
                    onSubmit={handleSubmit} 
                    isLoading={isLoading} 
                />
            </div>

            <div className="publicar-frete-actions">
                <Button 
                    variant="secondary" 
                    onClick={() => navigate('/dashboard/embarcador')}
                >
                    Voltar ao Dashboard
                </Button>
            </div>
        </div>
    );
}