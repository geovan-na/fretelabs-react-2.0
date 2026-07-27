// components/motoristas/GuiaPropostasEnviadas.jsx
import CardPropostaEnviada from './CardPropostaEnviada';

export default function GuiaPropostasEnviadas({ propostas, onUpdate }) {
    if (!propostas || propostas.length === 0) {
        return (
            <div className="motoristas-vazio">
                <p>Nenhuma proposta enviada.</p>
                <p className="motoristas-vazio-sub">
                    Você ainda não enviou propostas para motoristas.
                </p>
            </div>
        );
    }

    return (
        <div className="motoristas-grid">
            {propostas.map((proposta) => (
                <CardPropostaEnviada
                    key={proposta.id}
                    proposta={proposta}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}