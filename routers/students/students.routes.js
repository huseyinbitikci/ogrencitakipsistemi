const express = require('express');
const router = express.Router();
const studentService = require('../../services/StudentService');
const bookService = require('../../services/BookService');
const { Class } = require('../../models/Content');
const upload = require('../uploadmiddleware');

// GET /students - Tüm öğrencileri listele
router.get('/students', async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        const classes = await Class.find({});
        
        res.render('students', {
            layout: false,
            students,
            classes
        });
    } catch (error) {
        console.error('Students list error:', error);
        res.status(500).render('error', {
            layout: false,
            message: 'Öğrenciler yüklenirken hata oluştu'
        });
    }
});

// GET /add - Öğrenci listesi (duplicate route - students ile aynı)
router.get('/add', async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        const classes = await Class.find({});
        
        res.render('students', {
            layout: false,
            students,
            classes
        });
    } catch (error) {
        console.error('Students add page error:', error);
        res.status(500).send('Hata oluştu');
    }
});

// POST /add - Yeni öğrenci ekle
router.post('/add', upload.single('foto'), async (req, res) => {
    try {
        const studentData = {
            ogrenciadı: req.body.ogrenciadı,
            soyisim: req.body.soyisim,
            sinif: req.body.sinif || req.body.sınıf,
            telno: req.body.telno,
            email: req.body.email,
            adres: req.body.adres
        };

        // Fotoğraf varsa base64'e çevir
        if (req.file) {
            const buff = Buffer.from(req.file.buffer);
            studentData.foto = buff.toString('base64');
        }

        const newStudent = await studentService.createStudent(studentData);
        console.log('Yeni öğrenci eklendi:', newStudent.id);
        
        res.redirect('/students');
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).send('Öğrenci eklenirken hata oluştu: ' + error.message);
    }
});

// GET /edit-students - Öğrenci düzenleme sayfası
router.get('/edit-students', async (req, res) => {
    try {
        const studentId = req.query.id;
        const student = await studentService.getStudentById(studentId);
        const classes = await Class.find({});
        
        res.render('edit-student', {
            layout: false,
            student,
            classes
        });
    } catch (error) {
        console.error('Edit student page error:', error);
        res.status(404).send('Öğrenci bulunamadı');
    }
});

// POST /guncelle - Öğrenci güncelle
router.post('/guncelle', upload.single('foto'), async (req, res) => {
    try {
        const studentId = req.query.id;
        const updateData = {
            ogrenciadı: req.body.ogrenciadı,
            soyisim: req.body.soyisim,
            sinif: req.body.sinif || req.body.sınıf,
            telno: req.body.telno,
            email: req.body.email,
            adres: req.body.adres
        };

        // Fotoğraf varsa base64'e çevir
        if (req.file) {
            const buff = Buffer.from(req.file.buffer);
            updateData.foto = buff.toString('base64');
        }

        await studentService.updateStudent(studentId, updateData);
        console.log('Öğrenci güncellendi:', studentId);
        
        res.redirect('/students');
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).send('Öğrenci güncellenirken hata oluştu: ' + error.message);
    }
});

// GET /delete - Öğrenci sil
router.get('/delete', async (req, res) => {
    try {
        const studentId = req.query.id;
        await studentService.deleteStudent(studentId);
        console.log('Öğrenci silindi:', studentId);
        
        res.redirect('/students');
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).send('Öğrenci silinirken hata oluştu: ' + error.message);
    }
});

// GET /ogrpro - Öğrenci profili
router.get('/ogrpro', async (req, res) => {
    try {
        const studentId = req.query.id;
        const { student, books } = await studentService.getStudentWithBooks(studentId);
        
        // Kitap detaylarını getir
        const bookDetails = await Promise.all(
            books.map(async (sb) => {
                const book = await bookService.getBookById(sb.kit_id);
                return {
                    ...sb._doc,
                    kitap: book
                };
            })
        );
        
        res.render('ogrpro', {
            layout: false,
            student,
            books: bookDetails
        });
    } catch (error) {
        console.error('Student profile error:', error);
        res.status(404).send('Öğrenci profili yüklenemedi');
    }
});

// GET /ogrkitekle - Öğrenciye kitap ekleme sayfası
router.get('/ogrkitekle', async (req, res) => {
    try {
        const studentId = req.query.id;
        const student = await studentService.getStudentById(studentId);
        const allBooks = await bookService.getAllBooks();
        
        res.render('ogrkitekle', {
            layout: false,
            student,
            books: allBooks
        });
    } catch (error) {
        console.error('Add book to student page error:', error);
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// GET /kitapekle - Öğrenciye kitap ekle
router.get('/kitapekle', async (req, res) => {
    try {
        const studentId = req.query.id;
        const bookId = req.query.kit_id;
        
        await studentService.addBookToStudent(studentId, bookId);
        console.log(`Kitap ${bookId} öğrenci ${studentId}'ye eklendi`);
        
        res.redirect(`/ogrpro?id=${studentId}`);
    } catch (error) {
        console.error('Add book to student error:', error);
        res.status(500).send('Kitap eklenirken hata oluştu: ' + error.message);
    }
});

// GET /kit_delete - Öğrenciden kitap çıkar
router.get('/kit_delete', async (req, res) => {
    try {
        const studentId = req.query.id;
        const bookId = req.query.kit_id;
        
        await studentService.removeBookFromStudent(studentId, bookId);
        console.log(`Kitap ${bookId} öğrenci ${studentId}'den çıkarıldı`);
        
        res.redirect(`/ogrpro?id=${studentId}`);
    } catch (error) {
        console.error('Remove book from student error:', error);
        res.status(500).send('Kitap çıkarılırken hata oluştu: ' + error.message);
    }
});

module.exports = router;
