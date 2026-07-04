const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id, email, tipo) => {
    return jwt.sign(
        { id, email, tipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

module.exports = { generateToken };