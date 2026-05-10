const sequelize = require('../config/database');
const Author = require('./Author');
const Book = require('./Book');
const Member = require('./Member');
const BorrowRecord = require('./BorrowRecord');

// ── One-to-Many: Author ──► Books ─────────────────────────────────────────────
Author.hasMany(Book, { foreignKey: 'authorId', as: 'books', onDelete: 'CASCADE' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

// ── Many-to-Many: Members ◄──► Books  (through BorrowRecord) ─────────────────
Member.belongsToMany(Book, { through: BorrowRecord, foreignKey: 'MemberId', as: 'borrowedBooks' });
Book.belongsToMany(Member, { through: BorrowRecord, foreignKey: 'BookId', as: 'borrowers' });

// Direct associations so we can do BorrowRecord.findAll({ include: [...] })
BorrowRecord.belongsTo(Member, { foreignKey: 'MemberId', as: 'member' });
BorrowRecord.belongsTo(Book,   { foreignKey: 'BookId',   as: 'book'   });
Member.hasMany(BorrowRecord, { foreignKey: 'MemberId', as: 'borrowRecords' });
Book.hasMany(BorrowRecord,   { foreignKey: 'BookId',   as: 'borrowRecords' });

module.exports = { sequelize, Author, Book, Member, BorrowRecord };
