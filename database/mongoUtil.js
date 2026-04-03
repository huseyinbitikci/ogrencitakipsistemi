require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI;

if (!url) {
    console.error('HATA: MONGODB_URI environment variable tanımlı değil!');
    process.exit(1);
}

var _db;

module.exports = {
    connectToServer: function(callback) {
        MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(err, client) {
            if (err) {
                console.error('MongoDB bağlantı hatası:', err);
                return callback(err);
            }
            console.log('MongoUtil connectToServer çalıştı');
            _db = client.db('egitimyildizi');
            return callback(err);
        });
    },
    getDb: function() {
        return _db;
    }
};


