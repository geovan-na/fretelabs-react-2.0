// components/motoristas/GuiaMotoristasDisponiveis.jsx
import { useState } from 'react';
import CardMotoristaDisponivel from './CardMotoristaDisponivel';
import ModalEnviarProposta from './ModalEnviarProposta';

export default function GuiaMotoristasDisponiveis({ motoristas, onUpdate }) {
    const [propostaMotorista, setPropostaMotorista] = useState(null);

    if (!motoristas || motoristas.length === 0) {
        return (
            <div className="motoristas-vazio">
                <p>Nenhum motorista disponível.</p>
                <p className="motoristas-vazio-sub">
                    No momento não há motoristas disponíveis para contratação.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="motoristas-grid">
                {motoristas.map((motorista) => (
                    <CardMotoristaDisponivel
                        key={motorista.motorista_vinculado_id}
                        motorista={motorista}
                        onEnviarProposta={() => setPropostaMotorista(motorista)}
                    />
                ))}
            </div>

            {propostaMotorista && (
                <ModalEnviarProposta
                    motorista={propostaMotorista}
                    onClose={() => setPropostaMotorista(null)}
                    onSuccess={() => {
                        setPropostaMotorista(null);
                        onUpdate();
                    }}
                />
            )}
        </>
    );
}