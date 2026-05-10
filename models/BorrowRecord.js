const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Junction table for the many-to-many relationship between Members and Books
const BorrowRecord = sequelize.define('BorrowRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  borrowDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,   // null = not yet returned
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
    allowNull: false,
    defaultValue: 'borrowed',
  },
  // MemberId and BookId FKs are added by associations
}, {
  tableName: 'borrow_records',
  timestamps: true,
});

module.exports = BorrowRecord;
