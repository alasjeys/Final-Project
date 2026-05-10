const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookBorrowers,
} = require('../controllers/bookController');

router.get('/',              getAllBooks);
router.get('/:id',           getBookById);
router.post('/',             createBook);
router.put('/:id',           updateBook);
router.delete('/:id',        deleteBook);
router.get('/:id/borrowers', getBookBorrowers);   // relationship endpoint

module.exports = router;
