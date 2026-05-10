const { Member, Book, BorrowRecord } = require('../models');

// GET /members
const getAllMembers = async (req, res, next) => {
  try {
    const members = await Member.findAll({ order: [['name', 'ASC']] });
    res.json(members);
  } catch (err) {
    next(err);
  }
};

// GET /members/:id  – includes borrow history
const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        {
          model: Book,
          as: 'borrowedBooks',
          through: { attributes: ['borrowDate', 'dueDate', 'returnDate', 'status'] },
          include: [{ association: 'author', attributes: ['name'] }],
        },
      ],
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    next(err);
  }
};

// POST /members
const createMember = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'name is required' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'email is required' });
    }
    const member = await Member.create({ name: name.trim(), email: email.trim(), phone, address });
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

// PUT /members/:id
const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const { name, email, phone, address } = req.body;
    await member.update({ name, email, phone, address });
    res.json(member);
  } catch (err) {
    next(err);
  }
};

// DELETE /members/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.destroy();
    res.json({ message: `Member '${member.name}' deleted successfully` });
  } catch (err) {
    next(err);
  }
};

// ── Relationship endpoints ────────────────────────────────────────────────────

// POST /members/:id/borrow  – member borrows a book (creates BorrowRecord)
const borrowBook = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const { bookId, dueDate } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Validation Error', message: 'bookId is required' });
    }
    if (!dueDate) {
      return res.status(400).json({ error: 'Validation Error', message: 'dueDate is required (YYYY-MM-DD)' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    if (book.copies < 1) {
      return res.status(400).json({ error: 'No copies available for borrowing' });
    }

    // Check if member already has an active borrow of this book
    const existing = await BorrowRecord.findOne({
      where: { MemberId: req.params.id, BookId: bookId, status: 'borrowed' },
    });
    if (existing) {
      return res.status(400).json({ error: 'Member already has an active borrow for this book' });
    }

    const record = await BorrowRecord.create({
      MemberId: req.params.id,
      BookId: bookId,
      borrowDate: new Date(),
      dueDate,
      status: 'borrowed',
    });

    // Decrement available copies
    await book.update({ copies: book.copies - 1 });

    res.status(201).json({ message: 'Book borrowed successfully', borrowRecord: record });
  } catch (err) {
    next(err);
  }
};

// PUT /members/:id/return/:recordId  – member returns a book
const returnBook = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const record = await BorrowRecord.findOne({
      where: { id: req.params.recordId, MemberId: req.params.id },
    });
    if (!record) return res.status(404).json({ error: 'Borrow record not found' });
    if (record.status === 'returned') {
      return res.status(400).json({ error: 'This book has already been returned' });
    }

    const today = new Date().toISOString().split('T')[0];
    const status = today > record.dueDate ? 'overdue' : 'returned';

    await record.update({ returnDate: today, status });

    // Increment available copies back
    const book = await Book.findByPk(record.BookId);
    if (book) await book.update({ copies: book.copies + 1 });

    res.json({ message: 'Book returned successfully', borrowRecord: record });
  } catch (err) {
    next(err);
  }
};

// GET /members/:id/borrows  – list all borrow records for a member
const getMemberBorrows = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const records = await BorrowRecord.findAll({
      where: { MemberId: req.params.id },
      include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'isbn'] }],
      order: [['borrowDate', 'DESC']],
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  borrowBook,
  returnBook,
  getMemberBorrows,
};
