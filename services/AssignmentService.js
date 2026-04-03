const { DailyAssignment, Report } = require('../models/Assignment');
const studentRepository = require('../repositories/StudentRepository');

class AssignmentService {
    // ============ DAILY ASSIGNMENT MANAGEMENT ============
    
    async createDailyAssignment(assignmentData) {
        try {
            // Öğrenci var mı kontrol et
            const student = await studentRepository.findByStudentId(assignmentData.öğr_id);
            if (!student) {
                throw new Error('Öğrenci bulunamadı');
            }

            const newAssignment = new DailyAssignment({
                öğr_id: parseInt(assignmentData.öğr_id),
                ders: assignmentData.ders,
                konu: assignmentData.konu,
                kitap: assignmentData.kitap,
                ödv: assignmentData.ödv,
                tarih: assignmentData.tarih || new Date()
            });

            return await newAssignment.save();
        } catch (error) {
            throw error;
        }
    }

    async getStudentAssignments(studentId, options = {}) {
        try {
            const { startDate, endDate, limit = 50 } = options;
            
            const query = { öğr_id: parseInt(studentId) };
            
            if (startDate || endDate) {
                query.tarih = {};
                if (startDate) query.tarih.$gte = new Date(startDate);
                if (endDate) query.tarih.$lte = new Date(endDate);
            }

            return await DailyAssignment.find(query)
                .sort({ tarih: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Get student assignments error: ${error.message}`);
        }
    }

    async getAssignmentById(assignmentId) {
        try {
            return await DailyAssignment.findById(assignmentId);
        } catch (error) {
            throw new Error(`Get assignment by ID error: ${error.message}`);
        }
    }

    async getAllAssignments(options = {}) {
        try {
            const { limit = 100, skip = 0 } = options;
            
            return await DailyAssignment.find({})
                .sort({ tarih: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            throw new Error(`Get all assignments error: ${error.message}`);
        }
    }

    async deleteAssignment(assignmentId) {
        try {
            return await DailyAssignment.findByIdAndDelete(assignmentId);
        } catch (error) {
            throw new Error(`Delete assignment error: ${error.message}`);
        }
    }

    // ============ REPORT MANAGEMENT ============
    
    async createReport(reportData) {
        try {
            // Öğrenci var mı kontrol et
            const student = await studentRepository.findByStudentId(reportData.öğr_id);
            if (!student) {
                throw new Error('Öğrenci bulunamadı');
            }

            const newReport = new Report({
                öğr_id: parseInt(reportData.öğr_id),
                tarih: reportData.tarih || new Date(),
                ders: reportData.ders,
                konu: reportData.konu,
                açıklama: reportData.açıklama,
                durum: reportData.durum || 'orta'
            });

            return await newReport.save();
        } catch (error) {
            throw error;
        }
    }

    async getStudentReports(studentId, options = {}) {
        try {
            const { startDate, endDate, ders, konu, limit = 50 } = options;
            
            const query = { öğr_id: parseInt(studentId) };
            
            if (startDate || endDate) {
                query.tarih = {};
                if (startDate) query.tarih.$gte = new Date(startDate);
                if (endDate) query.tarih.$lte = new Date(endDate);
            }
            
            if (ders) query.ders = ders;
            if (konu) query.konu = konu;

            return await Report.find(query)
                .sort({ tarih: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Get student reports error: ${error.message}`);
        }
    }

    async getAllReports(filters = {}) {
        try {
            const { startDate, endDate, ders, konu, durum, limit = 100 } = filters;
            
            const query = {};
            
            if (startDate || endDate) {
                query.tarih = {};
                if (startDate) query.tarih.$gte = new Date(startDate);
                if (endDate) query.tarih.$lte = new Date(endDate);
            }
            
            if (ders) query.ders = ders;
            if (konu) query.konu = konu;
            if (durum) query.durum = durum;

            return await Report.find(query)
                .sort({ tarih: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Get all reports error: ${error.message}`);
        }
    }

    async updateReport(reportId, updateData) {
        try {
            return await Report.findByIdAndUpdate(
                reportId,
                updateData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Update report error: ${error.message}`);
        }
    }

    async deleteReport(reportId) {
        try {
            return await Report.findByIdAndDelete(reportId);
        } catch (error) {
            throw new Error(`Delete report error: ${error.message}`);
        }
    }

    // ============ STATISTICS ============
    
    async getStudentStats(studentId, options = {}) {
        try {
            const { startDate, endDate } = options;
            
            const assignmentsQuery = { öğr_id: parseInt(studentId) };
            const reportsQuery = { öğr_id: parseInt(studentId) };
            
            if (startDate || endDate) {
                const dateFilter = {};
                if (startDate) dateFilter.$gte = new Date(startDate);
                if (endDate) dateFilter.$lte = new Date(endDate);
                
                assignmentsQuery.tarih = dateFilter;
                reportsQuery.tarih = dateFilter;
            }

            const [assignments, reports] = await Promise.all([
                DailyAssignment.countDocuments(assignmentsQuery),
                Report.countDocuments(reportsQuery)
            ]);

            // Durum bazlı rapor istatistikleri
            const reportStats = await Report.aggregate([
                { $match: reportsQuery },
                { $group: { _id: '$durum', count: { $sum: 1 } } }
            ]);

            return {
                totalAssignments: assignments,
                totalReports: reports,
                reportsByStatus: reportStats
            };
        } catch (error) {
            throw new Error(`Get student stats error: ${error.message}`);
        }
    }
}

module.exports = new AssignmentService();
