const bookRepository = require('../repositories/BookRepository');
const { AltKonu } = require('../models/Content');

class BookService {
    // Tüm kitapları getir
    async getAllBooks() {
        try {
            return await bookRepository.findAll({}, { sort: { id: 1 } });
        } catch (error) {
            throw new Error(`Get all books error: ${error.message}`);
        }
    }

    // ID ile kitap getir
    async getBookById(bookId) {
        try {
            const book = await bookRepository.findByBookId(parseInt(bookId));
            if (!book) {
                throw new Error('Kitap bulunamadı');
            }
            return book;
        } catch (error) {
            throw error;
        }
    }

    // Kitap ile birlikte içeriklerini getir
    async getBookWithContents(bookId) {
        try {
            const result = await bookRepository.findBookWithContents(parseInt(bookId));
            if (!result) {
                throw new Error('Kitap bulunamadı');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Yeni kitap ekle
    async createBook(bookData) {
        try {
            // Son ID'yi al ve 1 arttır
            const lastId = await bookRepository.getLastBookId();
            const newId = lastId + 1;

            const newBook = {
                id: newId,
                ...bookData
            };

            return await bookRepository.create(newBook);
        } catch (error) {
            throw new Error(`Create book error: ${error.message}`);
        }
    }

    // Kitap güncelle
    async updateBook(bookId, bookData) {
        try {
            const book = await bookRepository.findByBookId(parseInt(bookId));
            if (!book) {
                throw new Error('Kitap bulunamadı');
            }

            return await bookRepository.updateOne(
                { id: parseInt(bookId) },
                bookData
            );
        } catch (error) {
            throw error;
        }
    }

    // Kitap sil (içerikleriyle birlikte)
    async deleteBook(bookId) {
        try {
            const result = await bookRepository.deleteBookWithContents(parseInt(bookId));
            if (!result) {
                throw new Error('Kitap bulunamadı');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Ders ve konuya göre kitap arama
    async getBooksBySubject(ders, konu) {
        try {
            return await bookRepository.findBySubject(ders, konu);
        } catch (error) {
            throw new Error(`Get books by subject error: ${error.message}`);
        }
    }

    // Kitap arama
    async searchBooks(searchTerm) {
        try {
            return await bookRepository.search(searchTerm);
        } catch (error) {
            throw new Error(`Search books error: ${error.message}`);
        }
    }

    // Kitaba içerik ekle
    async addContentToBook(bookId, contentData) {
        try {
            // Kitap var mı kontrol et
            await this.getBookById(bookId);

            const altKonu = new AltKonu({
                kitap_id: parseInt(bookId),
                ...contentData
            });

            return await altKonu.save();
        } catch (error) {
            throw error;
        }
    }

    // Kitap içeriğini sil
    async deleteContent(contentId) {
        try {
            const result = await AltKonu.findByIdAndDelete(contentId);
            if (!result) {
                throw new Error('İçerik bulunamadı');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Derse göre kitapları grupla
    async groupBooksBySubject() {
        try {
            return await bookRepository.groupBySubject();
        } catch (error) {
            throw new Error(`Group books by subject error: ${error.message}`);
        }
    }

    // Kitap istatistikleri
    async getBookStats(bookId) {
        try {
            const book = await this.getBookById(bookId);
            const contents = await AltKonu.find({ kitap_id: parseInt(bookId) });
            
            return {
                book,
                totalContents: contents.length,
                contents
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BookService();
