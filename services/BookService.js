const logger = require('../config/logger');
const { NotFoundError, DatabaseError } = require('../utils/errors');
const bookRepository = require('../repositories/BookRepository');
const { AltKonu } = require('../models/Content');

class BookService {
    // Tüm kitapları getir
    async getAllBooks() {
        try {
            logger.debug('Fetching all books');
            const books = await bookRepository.findAll({}, { sort: { id: 1 } });
            logger.info(`Successfully fetched ${books.length} books`);
            return books;
        } catch (error) {
            logger.error(`Get all books error: ${error.message}`, { error });
            throw new DatabaseError(`Kitaplar getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // ID ile kitap getir
    async getBookById(bookId) {
        try {
            logger.debug(`Fetching book with ID: ${bookId}`);
            const book = await bookRepository.findByBookId(parseInt(bookId));
            if (!book) {
                logger.warn(`Book not found with ID: ${bookId}`);
                throw new NotFoundError('Kitap bulunamadı');
            }
            return book;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Get book by ID error: ${error.message}`, { bookId, error });
            throw new DatabaseError(`Kitap getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // Kitap ile birlikte içeriklerini getir
    async getBookWithContents(bookId) {
        try {
            logger.debug(`Fetching book with contents: ${bookId}`);
            const result = await bookRepository.findBookWithContents(parseInt(bookId));
            if (!result) {
                logger.warn(`Book with contents not found: ${bookId}`);
                throw new NotFoundError('Kitap bulunamadı');
            }
            return result;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Get book with contents error: ${error.message}`, { bookId, error });
            throw new DatabaseError(`Kitap içerikleri getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // Yeni kitap ekle
    async createBook(bookData) {
        try {
            logger.info('Creating new book', { bookData });
            const lastId = await bookRepository.getLastBookId();
            const newId = lastId + 1;

            const newBook = {
                id: newId,
                ...bookData
            };

            const created = await bookRepository.create(newBook);
            logger.info(`Successfully created book with ID: ${newId}`);
            return created;
        } catch (error) {
            logger.error(`Create book error: ${error.message}`, { bookData, error });
            throw new DatabaseError(`Kitap oluşturulurken hata oluştu: ${error.message}`, error);
        }
    }

    // Kitap güncelle
    async updateBook(bookId, bookData) {
        try {
            logger.info(`Updating book: ${bookId}`, { bookData });
            const book = await bookRepository.findByBookId(parseInt(bookId));
            if (!book) {
                logger.warn(`Book not found for update: ${bookId}`);
                throw new NotFoundError('Kitap bulunamadı');
            }

            const updated = await bookRepository.updateOne(
                { id: parseInt(bookId) },
                bookData
            );
            logger.info(`Successfully updated book: ${bookId}`);
            return updated;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Update book error: ${error.message}`, { bookId, bookData, error });
            throw new DatabaseError(`Kitap güncellenirken hata oluştu: ${error.message}`, error);
        }
    }

    // Kitap sil (içerikleriyle birlikte)
    async deleteBook(bookId) {
        try {
            logger.info(`Deleting book: ${bookId}`);
            const result = await bookRepository.deleteBookWithContents(parseInt(bookId));
            if (!result) {
                logger.warn(`Book not found for deletion: ${bookId}`);
                throw new NotFoundError('Kitap bulunamadı');
            }
            logger.info(`Successfully deleted book: ${bookId}`);
            return result;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Delete book error: ${error.message}`, { bookId, error });
            throw new DatabaseError(`Kitap silinirken hata oluştu: ${error.message}`, error);
        }
    }

    // Ders ve konuya göre kitap arama
    async getBooksBySubject(ders, konu) {
        try {
            logger.debug(`Fetching books by subject: ${ders}, topic: ${konu}`);
            const books = await bookRepository.findBySubject(ders, konu);
            logger.info(`Found ${books.length} books for subject: ${ders}`);
            return books;
        } catch (error) {
            logger.error(`Get books by subject error: ${error.message}`, { ders, konu, error });
            throw new DatabaseError(`Derse göre kitaplar getirilirken hata oluştu: ${error.message}`, error);
        }
    }

    // Kitap arama
    async searchBooks(searchTerm) {
        try {
            logger.debug(`Searching books with term: ${searchTerm}`);
            const books = await bookRepository.search(searchTerm);
            logger.info(`Found ${books.length} books matching: ${searchTerm}`);
            return books;
        } catch (error) {
            logger.error(`Search books error: ${error.message}`, { searchTerm, error });
            throw new DatabaseError(`Kitap araması sırasında hata oluştu: ${error.message}`, error);
        }
    }

    // Kitaba içerik ekle
    async addContentToBook(bookId, contentData) {
        try {
            logger.info(`Adding content to book: ${bookId}`, { contentData });
            await this.getBookById(bookId);

            const altKonu = new AltKonu({
                kitap_id: parseInt(bookId),
                ...contentData
            });

            const saved = await altKonu.save();
            logger.info(`Successfully added content to book: ${bookId}`);
            return saved;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Add content to book error: ${error.message}`, { bookId, contentData, error });
            throw new DatabaseError(`Kitaba içerik eklenirken hata oluştu: ${error.message}`, error);
        }
    }

    // Kitap içeriğini sil
    async deleteContent(contentId) {
        try {
            logger.info(`Deleting content: ${contentId}`);
            const result = await AltKonu.findByIdAndDelete(contentId);
            if (!result) {
                logger.warn(`Content not found: ${contentId}`);
                throw new NotFoundError('İçerik bulunamadı');
            }
            logger.info(`Successfully deleted content: ${contentId}`);
            return result;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Delete content error: ${error.message}`, { contentId, error });
            throw new DatabaseError(`İçerik silinirken hata oluştu: ${error.message}`, error);
        }
    }

    // Derse göre kitapları grupla
    async groupBooksBySubject() {
        try {
            logger.debug('Grouping books by subject');
            const grouped = await bookRepository.groupBySubject();
            logger.info('Successfully grouped books by subject');
            return grouped;
        } catch (error) {
            logger.error(`Group books by subject error: ${error.message}`, { error });
            throw new DatabaseError(`Kitaplar gruplandırılırken hata oluştu: ${error.message}`, error);
        }
    }

    // Kitap istatistikleri
    async getBookStats(bookId) {
        try {
            logger.debug(`Fetching statistics for book: ${bookId}`);
            const book = await this.getBookById(bookId);
            const contents = await AltKonu.find({ kitap_id: parseInt(bookId) });
            
            const stats = {
                book,
                totalContents: contents.length,
                contents
            };
            logger.debug(`Successfully fetched stats for book: ${bookId}`, { totalContents: contents.length });
            return stats;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Get book stats error: ${error.message}`, { bookId, error });
            throw new DatabaseError(`Kitap istatistikleri getirilirken hata oluştu: ${error.message}`, error);
        }
    }
}

module.exports = new BookService();
