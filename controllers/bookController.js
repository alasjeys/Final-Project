const { Book, Author, Member, BorrowRecord } = require('../models');

// GET /books
const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.findAll({
      include: [{ model: Author, as: 'author', attributes: ['id', 'name'] }],
      order: [['title', 'ASC']],
    });
    res.json(books);
  } catch (err) {
    next(err);
  }
};

// GET /books/:id  – includes author + current borrowers
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, as: 'author' },
        { model: Member, as: 'borrowers', through: { attributes: ['borrowDate', 'dueDate', 'status'] } },
      ],
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// POST /books
const createBook = async (req, res, next) => {
  try {
    const { title, isbn, genre, publishedYear, copies, authorId } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'title is required' });
    }
    if (!isbn || isbn.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'isbn is required' });
    }
    if (!authorId) {
      return res.status(400).json({ error: 'Validation Error', message: 'authorId is required' });
    }

    const author = await Author.findByPk(authorId);
    if (!author) return res.status(404).json({ error: 'Author not found for the given authorId' });

    const book = await Book.create({ title: title.trim(), isbn: isbn.trim(), genre, publishedYear, copies, authorId });
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// PUT /books/:id
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    const { title, isbn, genre, publishedYear, copies, authorId } = req.body;
    await book.update({ title, isbn, genre, publishedYear, copies, authorId });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// DELETE /books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await book.destroy();
    res.json({ message: `Book '${book.title}' deleted successfully` });
  } catch (err) {
    next(err);
  }
};

// ── Relationship endpoints ────────────────────────────────────────────────────

// GET /books/:id/borrowers  – list all members currently borrowing this book
const getBookBorrowers = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const records = await BorrowRecord.findAll({
      where: { BookId: req.params.id },
      include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'email'] }],
      order: [['borrowDate', 'DESC']],
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, getBookBorrowers };
