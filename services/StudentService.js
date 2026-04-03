const logger = require('../config/logger');
const { NotFoundError, ConflictError, DatabaseError } = require('../utils/errors');
const studentRepository = require('../repositories/StudentRepository');
const StudentBook = require('../models/StudentBook');

class StudentService {
    // Tüm öğrencileri getir
    async getAllStudents() {
        try {
            logger.debug('Fetching all students');
            const students = await studentRepository.findAll({}, { sort: { id: 1 } });
            logger.info(`Successfully fetched ${students.length} students`);
            return students;
        } catch (error) {
            logger.error(`Get all students error: ${error.message}`, { error });
            throw new DatabaseError(`Öğrenciler getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // ID ile öğrenci getir
    async getStudentById(studentId) {
        try {
            logger.debug(`Fetching student with ID: ${studentId}`);
            const student = await studentRepository.findByStudentId(parseInt(studentId));
            if (!student) {
                logger.warn(`Student not found with ID: ${studentId}`);
                throw new NotFoundError('Öğrenci bulunamadı');
            }
            logger.debug(`Successfully fetched student: ${studentId}`);
            return student;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Get student by ID error: ${error.message}`, { studentId, error });
            throw new DatabaseError(`Öğrenci getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenci ile birlikte kitaplarını getir
    async getStudentWithBooks(studentId) {
        try {
            logger.debug(`Fetching student with books: ${studentId}`);
            const result = await studentRepository.findStudentWithBooks(parseInt(studentId));
            if (!result) {
                logger.warn(`Student with books not found: ${studentId}`);
                throw new NotFoundError('Öğrenci bulunamadı');
            }
            logger.debug(`Successfully fetched student with books: ${studentId}`);
            return result;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Get student with books error: ${error.message}`, { studentId, error });
            throw new DatabaseError(`Öğrenci ve kitapları getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // Yeni öğrenci ekle
    async createStudent(studentData) {
        try {
            logger.info('Creating new student', { studentData });
            // Son ID'yi al ve 1 arttır
            const lastId = await studentRepository.getLastStudentId();
            const newId = lastId + 1;

            const newStudent = {
                id: newId,
                ...studentData
            };

            const created = await studentRepository.create(newStudent);
            logger.info(`Successfully created student with ID: ${newId}`);
            return created;
        } catch (error) {
            logger.error(`Create student error: ${error.message}`, { studentData, error });
            throw new DatabaseError(`Öğrenci oluşturulurken hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenci güncelle
    async updateStudent(studentId, studentData) {
        try {
            logger.info(`Updating student: ${studentId}`, { studentData });
            const student = await studentRepository.findByStudentId(parseInt(studentId));
            if (!student) {
                logger.warn(`Student not found for update: ${studentId}`);
                throw new NotFoundError('Öğrenci bulunamadı');
            }

            const updated = await studentRepository.updateOne(
                { id: parseInt(studentId) },
                studentData
            );
            logger.info(`Successfully updated student: ${studentId}`);
            return updated;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Update student error: ${error.message}`, { studentId, studentData, error });
            throw new DatabaseError(`Öğrenci güncellenirken hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenci sil (kitaplarıyla birlikte)
    async deleteStudent(studentId) {
        try {
            logger.info(`Deleting student: ${studentId}`);
            const result = await studentRepository.deleteStudentWithBooks(parseInt(studentId));
            if (!result) {
                logger.warn(`Student not found for deletion: ${studentId}`);
                throw new NotFoundError('Öğrenci bulunamadı');
            }
            logger.info(`Successfully deleted student: ${studentId}`);
            return result;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Delete student error: ${error.message}`, { studentId, error });
            throw new DatabaseError(`Öğrenci silinirken hata oluştu: ${error.message}`, error);
        }
    }

    // Sınıfa göre öğrencileri getir
    async getStudentsByClass(className) {
        try {
            logger.debug(`Fetching students by class: ${className}`);
            const students = await studentRepository.findByClass(className);
            logger.info(`Successfully fetched ${students.length} students from class: ${className}`);
            return students;
        } catch (error) {
            logger.error(`Get students by class error: ${error.message}`, { className, error });
            throw new DatabaseError(`Sınıf öğrencileri getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenci arama
    async searchStudents(searchTerm) {
        try {
            logger.debug(`Searching students with term: ${searchTerm}`);
            const students = await studentRepository.search(searchTerm);
            logger.info(`Found ${students.length} students matching: ${searchTerm}`);
            return students;
        } catch (error) {
            logger.error(`Search students error: ${error.message}`, { searchTerm, error });
            throw new DatabaseError(`Öğrenci araması sırasında hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenciye kitap ekle
    async addBookToStudent(studentId, bookId) {
        try {
            logger.info(`Adding book ${bookId} to student ${studentId}`);
            // Öğrenci var mı kontrol et
            const student = await this.getStudentById(studentId);
            
            // Zaten ekli mi kontrol et
            const existing = await StudentBook.findOne({
                ögr_id: parseInt(studentId),
                kit_id: parseInt(bookId)
            });

            if (existing) {
                logger.warn(`Book ${bookId} already assigned to student ${studentId}`);
                throw new ConflictError('Bu kitap zaten öğrenciye ekli');
            }

            const studentBook = new StudentBook({
                ögr_id: parseInt(studentId),
                kit_id: parseInt(bookId),
                tarih: new Date()
            });

            const saved = await studentBook.save();
            logger.info(`Successfully added book ${bookId} to student ${studentId}`);
            return saved;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ConflictError) throw error;
            logger.error(`Add book to student error: ${error.message}`, { studentId, bookId, error });
            throw new DatabaseError(`Öğrenciye kitap eklenirken hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenciden kitap çıkar
    async removeBookFromStudent(studentId, bookId) {
        try {
            logger.info(`Removing book ${bookId} from student ${studentId}`);
            const result = await StudentBook.findOneAndDelete({
                ögr_id: parseInt(studentId),
                kit_id: parseInt(bookId)
            });

            if (!result) {
                logger.warn(`Book ${bookId} not found for student ${studentId}`);
                throw new NotFoundError('Öğrencinin bu kitabı bulunamadı');
            }

            logger.info(`Successfully removed book ${bookId} from student ${studentId}`);
            return result;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Remove book from student error: ${error.message}`, { studentId, bookId, error });
            throw new DatabaseError(`Öğrenciden kitap çıkarılırken hata oluştu: ${error.message}`, error);
        }
    }

    // Öğrenci istatistikleri
    async getStudentStats(studentId) {
        try {
            logger.debug(`Fetching statistics for student: ${studentId}`);
            const student = await this.getStudentById(studentId);
            const books = await StudentBook.find({ ögr_id: parseInt(studentId) });
            
            const stats = {
                student,
                totalBooks: books.length,
                books
            };
            logger.debug(`Successfully fetched stats for student: ${studentId}`, { totalBooks: books.length });
            return stats;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Get student stats error: ${error.message}`, { studentId, error });
            throw new DatabaseError(`Öğrenci istatistikleri getirilirken hata oluştu: ${error.message}`, error);
        }
    }
}

module.exports = new StudentService();
