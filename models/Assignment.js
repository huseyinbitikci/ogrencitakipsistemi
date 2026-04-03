const mongoose = require('mongoose');

// Günlük Ödev Schema
const dailyAssignmentSchema = new mongoose.Schema({
    öğr_id: {
        type: Number,
        required: true,
        ref: 'Student'
    },
    ders: {
        type: String,
        required: true
    },
    konu: {
        type: String,
        required: true
    },
    kitap: {
        type: String,
        required: true
    },
    ödv: {
        type: String, // Ödev detayı
        required: true
    },
    tarih: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'gün_ödv'
});

// Report Schema
const reportSchema = new mongoose.Schema({
    öğr_id: {
        type: Number,
        required: true,
        ref: 'Student'
    },
    tarih: {
        type: Date,
        required: true
    },
    ders: {
        type: String,
        required: true
    },
    konu: {
        type: String,
        required: true
    },
    açıklama: {
        type: String,
        trim: true
    },
    durum: {
        type: String,
        enum: ['başarılı', 'orta', 'eksik', 'yetersiz'],
        default: 'orta'
    }
}, {
    timestamps: true,
    collection: 'raporlama'
});

// Index'ler
dailyAssignmentSchema.index({ öğr_id: 1, tarih: -1 });
reportSchema.index({ öğr_id: 1, tarih: -1 });
reportSchema.index({ ders: 1, konu: 1 });

const DailyAssignment = mongoose.model('DailyAssignment', dailyAssignmentSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
    DailyAssignment,
    Report
};
