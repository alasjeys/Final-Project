const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  borrowBook,
  returnBook,
  getMemberBorrows,
} = require('../controllers/memberController');

router.get('/',                          getAllMembers);
router.get('/:id',                       getMemberById);
router.post('/',                         createMember);
router.put('/:id',                       updateMember);
router.delete('/:id',                    deleteMember);

// Relationship endpoints
router.post('/:id/borrow',               borrowBook);          // borrow a book
router.put('/:id/return/:recordId',      returnBook);          // return a book
router.get('/:id/borrows',               getMemberBorrows);    // list borrow history

module.exports = router;
