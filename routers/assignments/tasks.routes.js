const express = require('express');
const router = express.Router();
const assignmentService = require('../../services/AssignmentService');
const studentService = require('../../services/StudentService');
const contentService = require('../../services/ContentService');

// GET /task - Öğrenci ödev görüntüleme sayfası
router.get('/task', async (req, res) => {
    try {
        const studentId = req.query.id;
        const student = await studentService.getStudentById(studentId);
        const assignments = await assignmentService.getStudentAssignments(studentId, { limit: 20 });
        
        res.render('task', {
            layout: false,
            student,
            assignments
        });
    } catch (error) {
        console.error('Task page error:', error);
        res.status(500).send('Ödev sayfası yüklenemedi');
    }
});

// POST /task_add - Öğrenciye ödev ekle
router.post('/task_add', async (req, res) => {
    try {
        const studentId = req.query.id;
        
        const assignmentData = {
            öğr_id: parseInt(studentId),
            ders: req.body.ders,
            konu: req.body.konu,
            kitap: req.body.kitap,
            ödv: req.body.ödv
        };

        await assignmentService.createDailyAssignment(assignmentData);
        console.log('Ödev eklendi:', studentId);
        
        res.redirect(`/task?id=${studentId}`);
    } catch (error) {
        console.error('Add task error:', error);
        res.status(500).send('Ödev eklenirken hata oluştu: ' + error.message);
    }
});

// POST /viewtask - Ödev detaylarını görüntüle
router.post('/viewtask', async (req, res) => {
    try {
        const assignmentId = req.body.id || req.query.id;
        const assignment = await assignmentService.getAssignmentById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ error: 'Ödev bulunamadı' });
        }

        res.json({
            success: true,
            assignment
        });
    } catch (error) {
        console.error('View task error:', error);
        res.status(500).json({ error: 'Ödev görüntülenirken hata oluştu' });
    }
});

// POST /gun - Günlük öğrenci takibi
router.post('/gun', async (req, res) => {
    try {
        const studentId = req.query.id;
        
        // Günlük ödev kaydı oluştur
        const assignmentData = {
            öğr_id: parseInt(studentId),
            ders: req.body.ders,
            konu: req.body.konu,
            kitap: req.body.kitap || '-',
            ödv: req.body.açıklama || req.body.ödv || '-',
            tarih: new Date()
        };

        await assignmentService.createDailyAssignment(assignmentData);
        console.log('Günlük kayıt eklendi:', studentId);
        
        res.redirect(`/ogrpro?id=${studentId}`);
    } catch (error) {
        console.error('Daily record error:', error);
        res.status(500).send('Günlük kayıt eklenirken hata oluştu: ' + error.message);
    }
});

module.exports = router;
