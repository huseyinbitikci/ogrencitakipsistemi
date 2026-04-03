// Legacy routes (eski sistem - kademeli olarak kaldırılacak)
const app = require("./app");
const api = require("./api");
const auth = require('./auth');

// Modern routes (yeni modüler sistem)
const studentsRoutes = require('./students/students.routes');
const booksRoutes = require('./library/books.routes');
const contentRoutes = require('./content/content.routes');
const tasksRoutes = require('./assignments/tasks.routes');
const reportsRoutes = require('./reports/reports.routes');
const dashboardRoutes = require('./general/dashboard.routes');

// Auth routes
exports.auth = auth.auth;

// Legacy routes (kademeli olarak kaldırılacak)
exports.app = app.app;
exports.api = api.api;

// Modern routes (yeni modüler route'lar)
exports.students = studentsRoutes;
exports.books = booksRoutes;
exports.content = contentRoutes;
exports.tasks = tasksRoutes;
exports.reports = reportsRoutes;
exports.dashboard = dashboardRoutes;