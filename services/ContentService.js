const { Class, Course, Topic, Subtitle } = require('../models/Content');

class ContentService {
    // ============ CLASS MANAGEMENT ============
    
    async getAllClasses() {
        try {
            return await Class.find({}).sort({ sinif_adi: 1 });
        } catch (error) {
            throw new Error(`Get all classes error: ${error.message}`);
        }
    }

    async createClass(className) {
        try {
            const newClass = new Class({ sinif_adi: className });
            return await newClass.save();
        } catch (error) {
            throw new Error(`Create class error: ${error.message}`);
        }
    }

    async updateClass(classId, className) {
        try {
            return await Class.findByIdAndUpdate(
                classId,
                { sinif_adi: className },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Update class error: ${error.message}`);
        }
    }

    async deleteClass(classId) {
        try {
            return await Class.findByIdAndDelete(classId);
        } catch (error) {
            throw new Error(`Delete class error: ${error.message}`);
        }
    }

    // ============ COURSE MANAGEMENT ============
    
    async getAllCourses() {
        try {
            return await Course.find({}).sort({ ders_adi: 1 });
        } catch (error) {
            throw new Error(`Get all courses error: ${error.message}`);
        }
    }

    async createCourse(courseName) {
        try {
            const newCourse = new Course({ ders_adi: courseName });
            return await newCourse.save();
        } catch (error) {
            throw new Error(`Create course error: ${error.message}`);
        }
    }

    async updateCourse(courseId, courseName) {
        try {
            return await Course.findByIdAndUpdate(
                courseId,
                { ders_adi: courseName },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Update course error: ${error.message}`);
        }
    }

    async deleteCourse(courseId) {
        try {
            return await Course.findByIdAndDelete(courseId);
        } catch (error) {
            throw new Error(`Delete course error: ${error.message}`);
        }
    }

    async getCourseById(courseId) {
        try {
            return await Course.findById(courseId);
        } catch (error) {
            throw new Error(`Get course by ID error: ${error.message}`);
        }
    }

    // ============ TOPIC MANAGEMENT ============
    
    async getAllTopics() {
        try {
            return await Topic.find({}).sort({ konu_adi: 1 });
        } catch (error) {
            throw new Error(`Get all topics error: ${error.message}`);
        }
    }

    async getTopicsByCourse(courseName) {
        try {
            return await Topic.find({ ders: courseName }).sort({ konu_adi: 1 });
        } catch (error) {
            throw new Error(`Get topics by course error: ${error.message}`);
        }
    }

    async createTopic(topicData) {
        try {
            const newTopic = new Topic(topicData);
            return await newTopic.save();
        } catch (error) {
            throw new Error(`Create topic error: ${error.message}`);
        }
    }

    async updateTopic(topicId, topicName) {
        try {
            return await Topic.findByIdAndUpdate(
                topicId,
                { konu_adi: topicName },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Update topic error: ${error.message}`);
        }
    }

    async deleteTopic(topicId) {
        try {
            return await Topic.findByIdAndDelete(topicId);
        } catch (error) {
            throw new Error(`Delete topic error: ${error.message}`);
        }
    }

    // ============ SUBTITLE MANAGEMENT ============
    
    async getAllSubtitles() {
        try {
            return await Subtitle.find({}).sort({ alt_baslik: 1 });
        } catch (error) {
            throw new Error(`Get all subtitles error: ${error.message}`);
        }
    }

    async getSubtitlesByTopic(topicName) {
        try {
            return await Subtitle.find({ konu: topicName }).sort({ alt_baslik: 1 });
        } catch (error) {
            throw new Error(`Get subtitles by topic error: ${error.message}`);
        }
    }

    async createSubtitle(subtitleData) {
        try {
            const newSubtitle = new Subtitle(subtitleData);
            return await newSubtitle.save();
        } catch (error) {
            throw new Error(`Create subtitle error: ${error.message}`);
        }
    }

    async updateSubtitle(subtitleId, subtitleName) {
        try {
            const subtitle = await Subtitle.findById(subtitleId);
            if (!subtitle) {
                throw new Error('Subtitle not found');
            }

            // Konu prefix'i koruyarak güncelle
            const updatedName = `${subtitle.konu} - ${subtitleName}`;
            
            return await Subtitle.findByIdAndUpdate(
                subtitleId,
                { alt_baslik: updatedName },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    }

    async deleteSubtitle(subtitleId) {
        try {
            return await Subtitle.findByIdAndDelete(subtitleId);
        } catch (error) {
            throw new Error(`Delete subtitle error: ${error.message}`);
        }
    }

    // ============ HELPER METHODS ============
    
    async getContentHierarchy() {
        try {
            const [classes, courses, topics, subtitles] = await Promise.all([
                this.getAllClasses(),
                this.getAllCourses(),
                this.getAllTopics(),
                this.getAllSubtitles()
            ]);

            return { classes, courses, topics, subtitles };
        } catch (error) {
            throw new Error(`Get content hierarchy error: ${error.message}`);
        }
    }
}

module.exports = new ContentService();
