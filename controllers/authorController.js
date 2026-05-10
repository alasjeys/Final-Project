const { Author, Book } = require('../models');

// GET /authors
const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.findAll({ order: [['name', 'ASC']] });
    res.json(authors);
  } catch (err) {
    next(err);
  }
};

// GET /authors/:id
const getAuthorById = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [{ model: Book, as: 'books' }],
    });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    next(err);
  }
};

// POST /authors
const createAuthor = async (req, res, next) => {
  try {
    const { name, nationality, bio } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'name is required' });
    }
    const author = await Author.create({ name: name.trim(), nationality, bio });
    res.status(201).json(author);
  } catch (err) {
    next(err);
  }
};

// PUT /authors/:id
const updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    const { name, nationality, bio } = req.body;
    await author.update({ name, nationality, bio });
    res.json(author);
  } catch (err) {
    next(err);
  }
};

// DELETE /authors/:id
const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    await author.destroy();
    res.json({ message: `Author '${author.name}' deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
