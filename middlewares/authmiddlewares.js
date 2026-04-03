const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
                res.redirect('/login');
            } else {
                console.log('Authenticated user:', decodedToken);
                req.user = decodedToken; // Kullanıcı bilgisini req'e ekle
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

module.exports = {requireAuth};