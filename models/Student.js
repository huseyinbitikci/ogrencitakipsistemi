const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    ogrenciadı: {
        type: String,
        required: [true, 'Öğrenci adı zorunludur'],
        trim: true
    },
    soyisim: {
        type: String,
        required: [true, 'Soyisim zorunludur'],
        trim: true
    },
    sinif: {
        type: String,
        trim: true
    },
    telno: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    adres: {
        type: String,
        trim: true
    },
    foto: {
        type: String, // Base64 veya dosya yolu
        default: ''
    }
}, {
    timestamps: true, // createdAt ve updatedAt otomatik ekler
    collection: 'ögrenciler' // Mevcut collection adı
});

// Virtual field - tam isim
studentSchema.virtual('tamIsim').get(function() {
    return `${this.ogrenciadı} ${this.soyisim}`;
});

// Index'ler - performans için
studentSchema.index({ id: 1 });
studentSchema.index({ ogrenciadı: 1, soyisim: 1 });
studentSchema.index({ sinif: 1 });

// Static method - ID ile öğrenci bulma
studentSchema.statics.findByStudentId = async function(studentId) {
    return await this.findOne({ id: parseInt(studentId) });
};

// Instance method - öğrenci kitaplarını getir
studentSchema.methods.getBooks = async function() {
    const StudentBook = mongoose.model('StudentBook');
    return await StudentBook.find({ ögr_id: this.id });
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
