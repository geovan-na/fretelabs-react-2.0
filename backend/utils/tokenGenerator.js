const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id, email, tipo) => {
    const secret = process.env.JWT_SECRET || 'fretelabs_secret_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    return jwt.sign(
        { id, email, tipo },
        secret,
        { expiresIn }
    );
};

module.exports = { generateToken };