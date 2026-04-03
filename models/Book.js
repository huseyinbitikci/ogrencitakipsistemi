const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    kitapadı: {
        type: String,
        required: [true, 'Kitap adı zorunludur'],
        trim: true
    },
    yazar: {
        type: String,
        trim: true
    },
    yayinevi: {
        type: String,
        trim: true
    },
    ders: {
        type: String,
        trim: true
    },
    konu: {
        type: String,
        trim: true
    },
    foto: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'kütüphane' // Mevcut collection adı
});

// Index'ler
bookSchema.index({ id: 1 });
bookSchema.index({ kitapadı: 1 });
bookSchema.index({ ders: 1 });
bookSchema.index({ konu: 1 });

// Static method - ID ile kitap bulma
bookSchema.statics.findByBookId = async function(bookId) {
    return await this.findOne({ id: parseInt(bookId) });
};

// Static method - Ders ve konuya göre kitap arama
bookSchema.statics.findBySubject = async function(ders, konu) {
    const query = {};
    if (ders) query.ders = ders;
    if (konu) query.konu = konu;
    return await this.find(query);
};

// Instance method - kitap içeriklerini getir
bookSchema.methods.getContents = async function() {
    const AltKonu = mongoose.model('AltKonu');
    return await AltKonu.find({ kitap_id: this.id });
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
