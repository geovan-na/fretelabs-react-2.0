// components/motoristas/GuiaPropostasRecebidas.jsx
import CardPropostaRecebida from './CardPropostaRecebida';

export default function GuiaPropostasRecebidas({ propostas, onUpdate }) {
    if (!propostas || propostas.length === 0) {
        return (
            <div className="motoristas-vazio">
                <p>Nenhuma proposta recebida.</p>
                <p className="motoristas-vazio-sub">
                    Você ainda não recebeu propostas de motoristas.
                </p>
            </div>
        );
    }

    return (
        <div className="motoristas-grid">
            {propostas.map((proposta) => (
                <CardPropostaRecebida
                    key={proposta.id}
                    proposta={proposta}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}