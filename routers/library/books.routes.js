const express = require('express');
const router = express.Router();
const bookService = require('../../services/BookService');
const { Course, Topic } = require('../../models/Content');
const upload = require('../uploadmiddleware');

// GET /courses - Tüm kitapları listele
router.get('/courses', async (req, res) => {
    try {
        const books = await bookService.getAllBooks();
        const courses = await Course.find({});
        const topics = await Topic.find({});
        
        res.render('courses', {
            layout: false,
            books,
            courses,
            topics
        });
    } catch (error) {
        console.error('Books list error:', error);
        res.status(500).send('Kitaplar yüklenirken hata oluştu');
    }
});

// GET /bookanlz - Kitap detayları
router.get('/bookanlz', async (req, res) => {
    try {
        const bookId = req.query.id;
        const { book, contents } = await bookService.getBookWithContents(bookId);
        
        res.render('bookanlz', {
            layout: false,
            book,
            contents
        });
    } catch (error) {
        console.error('Book details error:', error);
        res.status(404).send('Kitap bulunamadı');
    }
});

// GET /edit-book - Kitap düzenleme sayfası
router.get('/edit-book', async (req, res) => {
    try {
        const bookId = req.query.id;
        const book = await bookService.getBookById(bookId);
        const courses = await Course.find({});
        const topics = await Topic.find({});
        
        res.render('edit-book', {
            layout: false,
            book,
            courses,
            topics
        });
    } catch (error) {
        console.error('Edit book page error:', error);
        res.status(404).send('Kitap bulunamadı');
    }
});

// POST /bookgun - Kitap güncelle
router.post('/bookgun', upload.single('foto'), async (req, res) => {
    try {
        const bookId = req.query.id;
        const updateData = {
            kitapadı: req.body.kitapadı,
            yazar: req.body.yazar,
            yayinevi: req.body.yayinevi,
            ders: req.body.ders,
            konu: req.body.konu
        };

        // Fotoğraf varsa base64'e çevir
        if (req.file) {
            const buff = Buffer.from(req.file.buffer);
            updateData.foto = buff.toString('base64');
        }

        await bookService.updateBook(bookId, updateData);
        console.log('Kitap güncellendi:', bookId);
        
        res.redirect('/courses');
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).send('Kitap güncellenirken hata oluştu: ' + error.message);
    }
});

// POST /add_kitap - Yeni kitap ekle
router.post('/add_kitap', upload.single('foto'), async (req, res) => {
    try {
        const bookData = {
            kitapadı: req.body.kitapadı,
            yazar: req.body.yazar,
            yayinevi: req.body.yayinevi,
            ders: req.body.ders,
            konu: req.body.konu
        };

        // Fotoğraf varsa base64'e çevir
        if (req.file) {
            const buff = Buffer.from(req.file.buffer);
            bookData.foto = buff.toString('base64');
        }

        const newBook = await bookService.createBook(bookData);
        console.log('Yeni kitap eklendi:', newBook.id);
        
        res.redirect('/courses');
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).send('Kitap eklenirken hata oluştu: ' + error.message);
    }
});

// GET /book_delete - Kitap sil
router.get('/book_delete', async (req, res) => {
    try {
        const bookId = req.query.id;
        await bookService.deleteBook(bookId);
        console.log('Kitap silindi:', bookId);
        
        res.redirect('/courses');
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).send('Kitap silinirken hata oluştu: ' + error.message);
    }
});

// POST /search_book - Kitap arama
router.post('/search_book', async (req, res) => {
    try {
        const searchTerm = req.body.search || '';
        const books = await bookService.searchBooks(searchTerm);
        const courses = await Course.find({});
        const topics = await Topic.find({});
        
        res.render('courses', {
            layout: false,
            books,
            courses,
            topics,
            searchTerm
        });
    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).send('Arama sırasında hata oluştu');
    }
});

// GET /icerikekle - Kitaba içerik ekleme sayfası
router.get('/icerikekle', async (req, res) => {
    try {
        const bookId = req.query.id;
        const book = await bookService.getBookById(bookId);
        const courses = await Course.find({});
        const topics = await Topic.find({ ders: book.ders });
        
        res.render('icerikekle', {
            layout: false,
            book,
            courses,
            topics
        });
    } catch (error) {
        console.error('Add content page error:', error);
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// POST /altadd - Kitaba içerik ekle
router.post('/altadd', async (req, res) => {
    try {
        const bookId = req.query.id;
        const contentData = {
            ders: req.body.ders,
            konu: req.body.konu,
            alt_konu: req.body.alt_konu
        };

        await bookService.addContentToBook(bookId, contentData);
        console.log('Kitaba içerik eklendi:', bookId);
        
        res.redirect(`/bookanlz?id=${bookId}`);
    } catch (error) {
        console.error('Add content to book error:', error);
        res.status(500).send('İçerik eklenirken hata oluştu: ' + error.message);
    }
});

// GET /alt_delete - Kitap içeriğini sil
router.get('/alt_delete', async (req, res) => {
    try {
        const contentId = req.query.id;
        const bookId = req.query.kit_id;
        
        await bookService.deleteContent(contentId);
        console.log('İçerik silindi:', contentId);
        
        res.redirect(`/bookanlz?id=${bookId}`);
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).send('İçerik silinirken hata oluştu');
    }
});

module.exports = router;
