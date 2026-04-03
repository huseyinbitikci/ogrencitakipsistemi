const BaseRepository = require('./BaseRepository');
const Book = require('../models/Book');
const { AltKonu } = require('../models/Content');

class BookRepository extends BaseRepository {
    constructor() {
        super(Book);
    }

    // Kitap ID'sine göre bulma (custom ID field)
    async findByBookId(bookId) {
        try {
            return await this.model.findByBookId(bookId);
        } catch (error) {
            throw new Error(`FindByBookId error: ${error.message}`);
        }
    }

    // Ders ve konuya göre kitap arama
    async findBySubject(ders, konu) {
        try {
            return await this.model.findBySubject(ders, konu);
        } catch (error) {
            throw new Error(`FindBySubject error: ${error.message}`);
        }
    }

    // Kitap arama (isim, yazar, yayınevi)
    async search(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            return await this.findAll({
                $or: [
                    { kitapadı: regex },
                    { yazar: regex },
                    { yayinevi: regex }
                ]
            });
        } catch (error) {
            throw new Error(`Search error: ${error.message}`);
        }
    }

    // Son eklenen kitabın ID'sini al
    async getLastBookId() {
        try {
            const book = await this.model.findOne().sort({ id: -1 }).select('id');
            return book ? book.id : 0;
        } catch (error) {
            throw new Error(`GetLastBookId error: ${error.message}`);
        }
    }

    // Kitap ile birlikte içeriklerini getir
    async findBookWithContents(bookId) {
        try {
            const book = await this.findByBookId(bookId);
            if (!book) return null;
            
            const contents = await book.getContents();
            return {
                book,
                contents
            };
        } catch (error) {
            throw new Error(`FindBookWithContents error: ${error.message}`);
        }
    }

    // Kitap silme (cascade - içerikleri de sil)
    async deleteBookWithContents(bookId) {
        try {
            // Önce kitabın içeriklerini sil
            await AltKonu.deleteMany({ kitap_id: bookId });
            
            // Sonra kitabı sil
            return await this.deleteOne({ id: bookId });
        } catch (error) {
            throw new Error(`DeleteBookWithContents error: ${error.message}`);
        }
    }

    // Derse göre kitapları grupla
    async groupBySubject() {
        try {
            return await this.model.aggregate([
                {
                    $group: {
                        _id: '$ders',
                        books: { $push: '$$ROOT' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        } catch (error) {
            throw new Error(`GroupBySubject error: ${error.message}`);
        }
    }
}

module.exports = new BookRepository();
