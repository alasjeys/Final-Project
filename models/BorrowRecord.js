const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

}, {
  tableName: 'borrow_records',
  timestamps: true,
});

module.exports = BorrowRecord;
