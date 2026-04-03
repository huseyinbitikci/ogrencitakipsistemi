// Legacy routes (eski sistem)
const app = require("./app");
const api = require("./api");
const auth = require('./auth');

// Modern routes (yeni modüler sistem)
const studentsRoutes = require('./students/students.routes');
const booksRoutes = require('./library/books.routes');

// Auth routes
exports.auth = auth.auth;

// Legacy routes (hala kullanımda olan eski route'lar)
exports.app = app.app;
exports.api = api.api;

// Modern routes (yeni modüler route'lar)
exports.students = studentsRoutes;
exports.books = booksRoutes;