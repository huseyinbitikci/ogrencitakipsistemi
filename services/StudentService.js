const studentRepository = require('../repositories/StudentRepository');
const StudentBook = require('../models/StudentBook');

class StudentService {
    // Tüm öğrencileri getir
    async getAllStudents() {
        try {
            return await studentRepository.findAll({}, { sort: { id: 1 } });
        } catch (error) {
            throw new Error(`Get all students error: ${error.message}`);
        }
    }

    // ID ile öğrenci getir
    async getStudentById(studentId) {
        try {
            const student = await studentRepository.findByStudentId(parseInt(studentId));
            if (!student) {
                throw new Error('Öğrenci bulunamadı');
            }
            return student;
        } catch (error) {
            throw error;
        }
    }

    // Öğrenci ile birlikte kitaplarını getir
    async getStudentWithBooks(studentId) {
        try {
            const result = await studentRepository.findStudentWithBooks(parseInt(studentId));
            if (!result) {
                throw new Error('Öğrenci bulunamadı');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Yeni öğrenci ekle
    async createStudent(studentData) {
        try {
            // Son ID'yi al ve 1 arttır
            const lastId = await studentRepository.getLastStudentId();
            const newId = lastId + 1;

            const newStudent = {
                id: newId,
                ...studentData
            };

            return await studentRepository.create(newStudent);
        } catch (error) {
            throw new Error(`Create student error: ${error.message}`);
        }
    }

    // Öğrenci güncelle
    async updateStudent(studentId, studentData) {
        try {
            const student = await studentRepository.findByStudentId(parseInt(studentId));
            if (!student) {
                throw new Error('Öğrenci bulunamadı');
            }

            return await studentRepository.updateOne(
                { id: parseInt(studentId) },
                studentData
            );
        } catch (error) {
            throw error;
        }
    }

    // Öğrenci sil (kitaplarıyla birlikte)
    async deleteStudent(studentId) {
        try {
            const result = await studentRepository.deleteStudentWithBooks(parseInt(studentId));
            if (!result) {
                throw new Error('Öğrenci bulunamadı');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Sınıfa göre öğrencileri getir
    async getStudentsByClass(className) {
        try {
            return await studentRepository.findByClass(className);
        } catch (error) {
            throw new Error(`Get students by class error: ${error.message}`);
        }
    }

    // Öğrenci arama
    async searchStudents(searchTerm) {
        try {
            return await studentRepository.search(searchTerm);
        } catch (error) {
            throw new Error(`Search students error: ${error.message}`);
        }
    }

    // Öğrenciye kitap ekle
    async addBookToStudent(studentId, bookId) {
        try {
            // Öğrenci var mı kontrol et
            const student = await this.getStudentById(studentId);
            
            // Zaten ekli mi kontrol et
            const existing = await StudentBook.findOne({
                ögr_id: parseInt(studentId),
                kit_id: parseInt(bookId)
            });

            if (existing) {
                throw new Error('Bu kitap zaten öğrenciye ekli');
            }

            const studentBook = new StudentBook({
                ögr_id: parseInt(studentId),
                kit_id: parseInt(bookId),
                tarih: new Date()
            });

            return await studentBook.save();
        } catch (error) {
            throw error;
        }
    }

    // Öğrenciden kitap çıkar
    async removeBookFromStudent(studentId, bookId) {
        try {
            const result = await StudentBook.findOneAndDelete({
                ögr_id: parseInt(studentId),
                kit_id: parseInt(bookId)
            });

            if (!result) {
                throw new Error('Öğrencinin bu kitabı bulunamadı');
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Öğrenci istatistikleri
    async getStudentStats(studentId) {
        try {
            const student = await this.getStudentById(studentId);
            const books = await StudentBook.find({ ögr_id: parseInt(studentId) });
            
            return {
                student,
                totalBooks: books.length,
                books
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new StudentService();
