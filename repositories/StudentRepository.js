const BaseRepository = require('./BaseRepository');
const Student = require('../models/Student');
const StudentBook = require('../models/StudentBook');

class StudentRepository extends BaseRepository {
    constructor() {
        super(Student);
    }

    // Öğrenci ID'sine göre bulma (custom ID field)
    async findByStudentId(studentId) {
        try {
            return await this.model.findByStudentId(studentId);
        } catch (error) {
            throw new Error(`FindByStudentId error: ${error.message}`);
        }
    }

    // Sınıfa göre öğrencileri getir
    async findByClass(className) {
        try {
            return await this.findAll({ sinif: className });
        } catch (error) {
            throw new Error(`FindByClass error: ${error.message}`);
        }
    }

    // Son eklenen öğrencinin ID'sini al (yeni ID oluşturmak için)
    async getLastStudentId() {
        try {
            const student = await this.model.findOne().sort({ id: -1 }).select('id');
            return student ? student.id : 67000; // Default başlangıç değeri
        } catch (error) {
            throw new Error(`GetLastStudentId error: ${error.message}`);
        }
    }

    // Öğrenci ile birlikte kitaplarını getir
    async findStudentWithBooks(studentId) {
        try {
            const student = await this.findByStudentId(studentId);
            if (!student) return null;
            
            const books = await student.getBooks();
            return {
                student,
                books
            };
        } catch (error) {
            throw new Error(`FindStudentWithBooks error: ${error.message}`);
        }
    }

    // Öğrenci arama (isim, soyisim)
    async search(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i'); // case-insensitive
            return await this.findAll({
                $or: [
                    { ogrenciadı: regex },
                    { soyisim: regex }
                ]
            });
        } catch (error) {
            throw new Error(`Search error: ${error.message}`);
        }
    }

    // Öğrenci silme (cascade - kitapları da sil)
    async deleteStudentWithBooks(studentId) {
        try {
            // Önce öğrencinin kitaplarını sil
            await StudentBook.deleteMany({ ögr_id: studentId });
            
            // Sonra öğrenciyi sil
            return await this.deleteOne({ id: studentId });
        } catch (error) {
            throw new Error(`DeleteStudentWithBooks error: ${error.message}`);
        }
    }
}

module.exports = new StudentRepository();
