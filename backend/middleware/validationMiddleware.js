const validateRegister = (req, res, next) => {
    const { nome_razao_social, email, senha } = req.body;
    
    if (!nome_razao_social || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'E-mail inválido' });
    }
    
    if (senha.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }
    
    next();
};

const validateLogin = (req, res, next) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }
    
    next();
};

module.exports = { validateRegister, validateLogin };