const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

const formatarData = (data) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
};

const formatarTelefone = (telefone) => {
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length === 11) {
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

module.exports = { formatarMoeda, formatarData, formatarTelefone };