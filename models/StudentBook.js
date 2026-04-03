const mongoose = require('mongoose');

// Öğrenci-Kitap ilişki tablosu
const studentBookSchema = new mongoose.Schema({
    ögr_id: {
        type: Number,
        required: true,
        ref: 'Student'
    },
    kit_id: {
        type: Number,
        required: true,
        ref: 'Book'
    },
    tarih: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'ögr_küt' // Mevcut collection adı
});

// Compound index - bir öğrenci aynı kitabı birden fazla alamaz
studentBookSchema.index({ ögr_id: 1, kit_id: 1 }, { unique: true });

const StudentBook = mongoose.model('StudentBook', studentBookSchema);

module.exports = StudentBook;
