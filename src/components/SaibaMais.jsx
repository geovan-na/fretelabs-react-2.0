// components/SaibaMais.jsx
import Button from "./Button";

export default function SaibaMais() {
    return (
        <section className="saiba-mais">
            <div className="saiba-mais-container">
                <h2 className="saiba-mais-title">Quer saber mais?</h2>
                <p className="saiba-mais-description">
                    Entre em contato conosco. Nossa equipe está pronta para atender você!
                </p>
                <Button variant="primary">ENVIAR MENSAGEM</Button>
            </div>
        </section>
    );
}
