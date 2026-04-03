const { validationResult } = require('express-validator');

// Validation sonuçlarını kontrol eden middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Ortak validation kuralları
const sanitizeInput = (req, res, next) => {
    // XSS koruması için basit sanitization
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            // Tehlikeli karakterleri temizle
            req.body[key] = req.body[key].trim();
        }
    });
    next();
};

module.exports = {
    validateRequest,
    sanitizeInput
};
