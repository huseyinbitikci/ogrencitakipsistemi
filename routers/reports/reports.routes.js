const express = require('express');
const router = express.Router();
const assignmentService = require('../../services/AssignmentService');
const studentService = require('../../services/StudentService');
const contentService = require('../../services/ContentService');

// GET /raporla - Raporlama sayfası
router.get('/raporla', async (req, res) => {
    try {
        const studentId = req.query.id;
        
        let student = null;
        let reports = [];
        
        if (studentId) {
            student = await studentService.getStudentById(studentId);
            reports = await assignmentService.getStudentReports(studentId);
        }
        
        const courses = await contentService.getAllCourses();
        const topics = await contentService.getAllTopics();
        
        res.render('raporla', {
            layout: false,
            student,
            reports,
            courses,
            topics
        });
    } catch (error) {
        console.error('Reports page error:', error);
        res.status(500).send('Raporlama sayfası yüklenemedi');
    }
});

// POST /raporla - Rapor oluştur veya filtrele
router.post('/raporla', async (req, res) => {
    try {
        const { öğr_id, tarih1, tarih2, ders, konu, açıklama, durum } = req.body;
        
        // Yeni rapor oluşturma
        if (açıklama && öğr_id) {
            const reportData = {
                öğr_id: parseInt(öğr_id),
                tarih: tarih1 ? new Date(tarih1) : new Date(),
                ders: ders || '-',
                konu: konu || '-',
                açıklama,
                durum: durum || 'orta'
            };

            await assignmentService.createReport(reportData);
            console.log('Rapor oluşturuldu:', öğr_id);
            
            return res.redirect(`/raporla?id=${öğr_id}`);
        }
        
        // Rapor filtreleme
        const filters = {
            startDate: tarih1 ? new Date(tarih1) : null,
            endDate: tarih2 ? new Date(tarih2) : null,
            ders,
            konu,
            limit: 100
        };

        const reports = öğr_id 
            ? await assignmentService.getStudentReports(parseInt(öğr_id), filters)
            : await assignmentService.getAllReports(filters);
        
        const student = öğr_id ? await studentService.getStudentById(öğr_id) : null;
        const courses = await contentService.getAllCourses();
        const topics = await contentService.getAllTopics();
        
        res.render('raporla', {
            layout: false,
            student,
            reports,
            courses,
            topics,
            filters: req.body
        });
    } catch (error) {
        console.error('Create/filter report error:', error);
        res.status(500).send('Rapor işlemi sırasında hata oluştu: ' + error.message);
    }
});

module.exports = router;
