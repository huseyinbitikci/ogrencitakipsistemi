const mongoose = require('mongoose');

// Sınıf Schema
const classSchema = new mongoose.Schema({
    sinif_adi: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
}, {
    timestamps: true,
    collection: 'siniflar'
});

// Ders Schema
const courseSchema = new mongoose.Schema({
    ders_adi: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
}, {
    timestamps: true,
    collection: 'dersadi'
});

// Konu Schema
const topicSchema = new mongoose.Schema({
    konu_adi: {
        type: String,
        required: true,
        trim: true
    },
    ders: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'konular'
});

// Alt Başlık Schema
const subtitleSchema = new mongoose.Schema({
    alt_baslik: {
        type: String,
        required: true,
        trim: true
    },
    konu: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'alt_baslik'
});

// Alt Konu Schema (Kitap içeriği)
const altKonuSchema = new mongoose.Schema({
    kitap_id: {
        type: Number,
        required: true,
        ref: 'Book'
    },
    ders: {
        type: String,
        required: true
    },
    konu: {
        type: String,
        required: true
    },
    alt_konu: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'alt_konular'
});

// Index'ler
altKonuSchema.index({ kitap_id: 1 });
topicSchema.index({ ders: 1 });
subtitleSchema.index({ konu: 1 });

const Class = mongoose.model('Class', classSchema);
const Course = mongoose.model('Course', courseSchema);
const Topic = mongoose.model('Topic', topicSchema);
const Subtitle = mongoose.model('Subtitle', subtitleSchema);
const AltKonu = mongoose.model('AltKonu', altKonuSchema);

module.exports = {
    Class,
    Course,
    Topic,
    Subtitle,
    AltKonu
};
