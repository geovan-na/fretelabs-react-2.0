// pages/CadastroVeiculos.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormVeiculo from '../components/FormVeiculo';

export default function CadastroVeiculos() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleCadastro = async (dadosVeiculo) => {
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:3000/api/veiculos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosVeiculo)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Veículo cadastrado com sucesso!', type: 'success' });
                setTimeout(() => {
                    navigate('/meus-veiculos');
                }, 2000);
            } else {
                setMessage({ text: data.error || 'Erro ao cadastrar veículo', type: 'error' });
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessage({ text: 'Erro ao conectar com o servidor', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cadastro-veiculo-container">
            <div className="cadastro-veiculo-card">
                <h1 className="cadastro-veiculo-title">Cadastrar Veículo</h1>
                <p className="cadastro-veiculo-subtitle">
                    Preencha os dados do seu veículo para começar a receber fretes compatíveis.
                </p>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <FormVeiculo onSubmit={handleCadastro} isLoading={isLoading} />
            </div>
        </div>
    );
}

