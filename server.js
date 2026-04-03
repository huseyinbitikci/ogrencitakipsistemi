// Load environment variables first
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const exphbs = require('express-handlebars');
const routers = require("./routers/index");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const {requireAuth} = require('./middlewares/authmiddlewares');
const errorMiddleware = require('./middlewares/errorMiddleware');
const logger = require('./config/logger');
const redisClient = require('./database/redisUtil');

const mongoUtil = require("./database/mongoUtil");
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Use environment variable for MongoDB URI
const url = process.env.MONGODB_URI;

if (!url) {
    logger.error('HATA: MONGODB_URI environment variable tanımlı değil!');
    process.exit(1);
}

// Initialize Redis connection
logger.info('Initializing Redis connection...');
redisClient.connect();

// Mongoose connection with updated options
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    logger.info("Mongoose bağlantısı başarılı!");
    app.listen(process.env.PORT || 3000, () => {
        logger.info(`Server ${process.env.PORT || 3000} portunda çalışıyor`);
    });
})
.catch((err) => {
    logger.error("Mongoose bağlantı hatası:", { error: err.message });
    process.exit(1);
});

// Connect via mongoUtil
mongoUtil.connectToServer(function(err, client) {
    if (err) {
        logger.error("MongoUtil bağlantı hatası:", { error: err.message });
        return;
    }
    logger.info("MongoUtil veri tabanına bağlandı!");
});

const app = express();

// HTTP request logger (Morgan with Winston)
app.use(morgan('combined', { stream: logger.stream }));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Mevcut inline script'ler için geçici olarak kapalı
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum 100 istek
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
        });
    }
});
app.use(limiter);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("./public"));
app.use(cookieParser());

// Session configuration with Redis
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'default-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS sadece production'da
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
};

// Use Redis for session storage if available
if (redisClient.isReady()) {
    sessionConfig.store = new RedisStore({ 
        client: redisClient.getClient(),
        prefix: 'sess:',
    });
    logger.info('Redis session store enabled');
} else {
    logger.warn('Redis not available, using default memory store for sessions');
}

app.use(session(sessionConfig));

// Handlebars engine
app.engine('.hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Routes - Authentication aktif edildi
app.use("/", routers.auth);

// Modern modular routes (yeni sistem - öncelikli)
app.use("/", requireAuth, routers.dashboard);  // Dashboard routes
app.use("/", requireAuth, routers.students);   // Students routes
app.use("/", requireAuth, routers.books);      // Books routes
app.use("/", requireAuth, routers.content);    // Content management routes
app.use("/", requireAuth, routers.tasks);      // Assignment/Task routes
app.use("/", requireAuth, routers.reports);    // Reports routes

// Legacy routes (eski sistem - kademeli olarak kaldırılacak)
// NOT: Modern route'lar aynı path'leri handle ediyorsa legacy'ler çalışmaz
app.use("/", requireAuth, routers.app);
app.use("/api", routers.api);

// 404 handler
app.use((req, res, next) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).render('error', {
        title: 'Sayfa bulunamadı',
        msg: 'Aradığınız sayfa bulunamadı.'
    });
});

// Global error handler (must be last middleware)
app.use(errorMiddleware);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    redisClient.disconnect();
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    redisClient.disconnect();
    mongoose.connection.close();
    process.exit(0);
});






