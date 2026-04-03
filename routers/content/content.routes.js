const express = require('express');
const router = express.Router();
const contentService = require('../../services/ContentService');

// GET /content - İçerik yönetimi sayfası
router.get('/content', async (req, res) => {
    try {
        const { classes, courses, topics, subtitles } = await contentService.getContentHierarchy();
        
        res.render('content', {
            layout: false,
            siniflar: classes,
            dersler: courses,
            konular: topics,
            alt_basliklar: subtitles
        });
    } catch (error) {
        console.error('Content page error:', error);
        res.status(500).send('İçerik yönetimi sayfası yüklenemedi');
    }
});

// GET /ekle - İçerik ekleme sayfası
router.get('/ekle', async (req, res) => {
    try {
        const courses = await contentService.getAllCourses();
        
        res.render('ekle', {
            layout: false,
            allders: courses,
            allkonu: []
        });
    } catch (error) {
        console.error('Add content page error:', error);
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// POST /derssec - Ders seçildiğinde konuları getir
router.post('/derssec', async (req, res) => {
    try {
        const courseId = req.body.ders;
        const course = await contentService.getCourseById(courseId);
        
        if (!course) {
            return res.status(404).send('Ders bulunamadı');
        }

        const topics = await contentService.getTopicsByCourse(course.ders_adi);
        const allCourses = await contentService.getAllCourses();
        
        res.render('ekle', {
            layout: false,
            allders: allCourses,
            allkonu: topics
        });
    } catch (error) {
        console.error('Select course error:', error);
        res.status(500).send('Ders seçilirken hata oluştu');
    }
});

// ============ CLASS MANAGEMENT ============

// POST /sinifekle - Sınıf ekle
router.post('/sinifekle', async (req, res) => {
    try {
        const className = req.body.sinif || req.body.sınıf;
        await contentService.createClass(className);
        console.log('Sınıf eklendi:', className);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Add class error:', error);
        res.status(500).send('Sınıf eklenirken hata oluştu: ' + error.message);
    }
});

// POST /snfgun - Sınıf güncelle
router.post('/snfgun', async (req, res) => {
    try {
        const classId = req.query.id;
        const className = req.body.sinif || req.body.sınıf;
        
        await contentService.updateClass(classId, className);
        console.log('Sınıf güncellendi:', classId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).send('Sınıf güncellenirken hata oluştu');
    }
});

// GET /deletesnf - Sınıf sil
router.get('/deletesnf', async (req, res) => {
    try {
        const classId = req.query.id;
        await contentService.deleteClass(classId);
        console.log('Sınıf silindi:', classId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).send('Sınıf silinirken hata oluştu');
    }
});

// ============ COURSE MANAGEMENT ============

// POST /ders_add - Ders ekle
router.post('/ders_add', async (req, res) => {
    try {
        const courseName = req.body.ders;
        await contentService.createCourse(courseName);
        console.log('Ders eklendi:', courseName);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Add course error:', error);
        res.status(500).send('Ders eklenirken hata oluştu: ' + error.message);
    }
});

// POST /dersgun - Ders güncelle
router.post('/dersgun', async (req, res) => {
    try {
        const courseId = req.query.id;
        const courseName = req.body.ders;
        
        await contentService.updateCourse(courseId, courseName);
        console.log('Ders güncellendi:', courseId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).send('Ders güncellenirken hata oluştu');
    }
});

// GET /deleteders - Ders sil
router.get('/deleteders', async (req, res) => {
    try {
        const courseId = req.query.id;
        await contentService.deleteCourse(courseId);
        console.log('Ders silindi:', courseId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).send('Ders silinirken hata oluştu');
    }
});

// ============ TOPIC MANAGEMENT ============

// POST /konuadd - Konu ekle
router.post('/konuadd', async (req, res) => {
    try {
        const topicData = {
            konu_adi: req.body.konu,
            ders: req.body.ders
        };
        
        await contentService.createTopic(topicData);
        console.log('Konu eklendi:', topicData.konu_adi);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Add topic error:', error);
        res.status(500).send('Konu eklenirken hata oluştu: ' + error.message);
    }
});

// POST /konugun - Konu güncelle
router.post('/konugun', async (req, res) => {
    try {
        const topicId = req.query.id;
        const topicName = req.body.konuadi;
        
        await contentService.updateTopic(topicId, topicName);
        console.log('Konu güncellendi:', topicId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).send('Konu güncellenirken hata oluştu');
    }
});

// GET /deletekonu - Konu sil
router.get('/deletekonu', async (req, res) => {
    try {
        const topicId = req.query.id;
        await contentService.deleteTopic(topicId);
        console.log('Konu silindi:', topicId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).send('Konu silinirken hata oluştu');
    }
});

// ============ SUBTITLE MANAGEMENT ============

// POST /altkonuadd - Alt konu ekle
router.post('/altkonuadd', async (req, res) => {
    try {
        const subtitleData = {
            alt_baslik: req.body.alt_konu,
            konu: req.body.konu
        };
        
        await contentService.createSubtitle(subtitleData);
        console.log('Alt konu eklendi:', subtitleData.alt_baslik);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Add subtitle error:', error);
        res.status(500).send('Alt konu eklenirken hata oluştu: ' + error.message);
    }
});

// POST /altkonugun - Alt konu güncelle
router.post('/altkonugun', async (req, res) => {
    try {
        const subtitleId = req.query.id;
        const subtitleName = req.body.alt_konu;
        
        await contentService.updateSubtitle(subtitleId, subtitleName);
        console.log('Alt konu güncellendi:', subtitleId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Update subtitle error:', error);
        res.status(500).send('Alt konu güncellenirken hata oluştu');
    }
});

// GET /deletealt_konu - Alt konu sil
router.get('/deletealt_konu', async (req, res) => {
    try {
        const subtitleId = req.query.id;
        await contentService.deleteSubtitle(subtitleId);
        console.log('Alt konu silindi:', subtitleId);
        
        res.redirect('/content');
    } catch (error) {
        console.error('Delete subtitle error:', error);
        res.status(500).send('Alt konu silinirken hata oluştu');
    }
});

module.exports = router;
