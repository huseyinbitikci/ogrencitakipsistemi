const express = require('express');
const router = express.Router();
const studentService = require('../../services/StudentService');
const bookService = require('../../services/BookService');
const contentService = require('../../services/ContentService');

// GET / - Ana sayfa (redirect to index)
router.get('/', (req, res) => {
    res.redirect('/index');
});

// GET /index - Dashboard
router.get('/index', async (req, res) => {
    try {
        // Dashboard için temel istatistikler
        const [students, books, classes, courses] = await Promise.all([
            studentService.getAllStudents(),
            bookService.getAllBooks(),
            contentService.getAllClasses(),
            contentService.getAllCourses()
        ]);

        res.render('index', {
            layout: false,
            stats: {
                totalStudents: students.length,
                totalBooks: books.length,
                totalClasses: classes.length,
                totalCourses: courses.length
            },
            recentStudents: students.slice(-5).reverse() // Son 5 öğrenci
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Dashboard yüklenemedi');
    }
});

module.exports = router;
