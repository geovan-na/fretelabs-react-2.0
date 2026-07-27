// components/motoristas/GuiaMotoristasVinculados.jsx
import CardMotoristaVinculado from './CardMotoristaVinculado';

export default function GuiaMotoristasVinculados({ motoristas, onUpdate }) {
    if (!motoristas || motoristas.length === 0) {
        return (
            <div className="motoristas-vazio">
                <p>Nenhum motorista vinculado.</p>
                <p className="motoristas-vazio-sub">
                    Você ainda não tem motoristas vinculados à sua frota.
                </p>
            </div>
        );
    }

    return (
        <div className="motoristas-grid">
            {motoristas.map((motorista) => (
                <CardMotoristaVinculado
                    key={motorista.motorista_vinculado_id}
                    motorista={motorista}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}