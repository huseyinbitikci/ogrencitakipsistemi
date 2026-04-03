// Load environment variables first
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routers = require("./routers/index");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const {requireAuth} = require('./middlewares/authmiddlewares');

const mongoUtil = require("./database/mongoUtil");
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Use environment variable for MongoDB URI
const url = process.env.MONGODB_URI;

if (!url) {
    console.error('HATA: MONGODB_URI environment variable tanımlı değil!');
    process.exit(1);
}

// Mongoose connection with updated options
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Mongoose bağlantısı başarılı!");
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server ${process.env.PORT || 3000} portunda çalışıyor`);
    });
})
.catch((err) => console.error("Mongoose bağlantı hatası:", err));

// Connect via mongoUtil
mongoUtil.connectToServer(function(err, client) {
    if (err) return console.error("MongoUtil bağlantı hatası:", err);
    console.log("MongoUtil veri tabanına bağlandı!");
});

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Mevcut inline script'ler için geçici olarak kapalı
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum 100 istek
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});
app.use(limiter);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("./public"));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS sadece production'da
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));

// Handlebars engine
app.engine('.hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Routes - Authentication aktif edildi
app.use("/", routers.auth);
app.use("/", requireAuth, routers.app); // Artık korumalı
app.use("/api", routers.api);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err.stack);
    res.status(500).send('Bir şeyler yanlış gitti!');
});






