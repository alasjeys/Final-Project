# 📚 Library Management API

## About This Project

The Library Management API is a complete backend REST API built as the final project for CPE 114 – Software Design. It solves the real-world problem of managing a library's collection of books, authors, and members—along with the borrowing and returning of books.

Managing a library manually through spreadsheets or paper ledgers is error-prone and inefficient. This API provides a centralized, structured system that any frontend application or mobile app can connect to. With this API, a library administrator can register authors and the books they have written, enroll library members, and track which member has borrowed which book on what date and when it is due back. The system automatically decrements the available copy count when a book is borrowed and increments it again when returned, ensuring the inventory is always accurate.

The design follows the MVC (Model-View-Controller) architectural pattern. Routes are thin and only map HTTP methods to controller functions. Controllers contain all business logic including database queries and input validation. Models define the data schema and inter-table relationships. Custom middleware handles logging, 404 errors, and global error catching without ever exposing a server stack trace to the client.

The database schema uses three primary entities—`Author`, `Book`, and `Member`—linked through a fourth junction entity called `BorrowRecord`. An `Author` has many `Books` (one-to-many), and a `Member` can borrow many `Books` while a `Book` can be borrowed by many `Members` (many-to-many through `BorrowRecord`). The `BorrowRecord` stores rich metadata about each transaction: the borrow date, due date, return date, and a status field (`borrowed`, `returned`, or `overdue`) that is automatically computed at the time of return.

This project is built entirely with the technology stack practiced throughout the semester: Node.js as the runtime, Express.js for routing, Sequelize ORM for database interaction, and MySQL/MariaDB as the relational database engine. All database credentials are externalized through a `.env` file and are never committed to version control.

---

## Tech Stack

| Technology | Version |
|------------|---------|
| Node.js    | 20.x    |
| Express.js | 4.19.x  |
| Sequelize  | 6.37.x  |
| MySQL2     | 3.10.x  |
| dotenv     | 16.4.x  |
| MariaDB    | 10.x / 11.x (MySQL-compatible) |

---

## Setup Instructions

### Prerequisites
- Node.js v18 or newer installed
- MariaDB (or MySQL) running locally
- Git installed
- Postman (for testing)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/library-api.git
cd library-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Open `.env` in VS Code and fill in your MariaDB credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_db
DB_USER=root
DB_PASS=your_password
PORT=3000
```

### 4. Create the database
Open your MariaDB client and run:
```sql
CREATE DATABASE library_db;
```
You do **not** need to create tables manually — Sequelize creates and syncs them automatically on startup.

### 5. Start the server
```bash
npm start
```
You should see:
```
✅  Database connection established.
✅  All tables synced.
🚀  Server running at http://localhost:3000
```

---

## Database Schema

### Table: `authors`
| Column      | Type         | Constraints              |
|-------------|--------------|--------------------------|
| id          | INT          | PK, Auto Increment       |
| name        | VARCHAR(150) | NOT NULL                 |
| nationality | VARCHAR(100) | nullable                 |
| bio         | TEXT         | nullable                 |
| createdAt   | DATETIME     | auto                     |
| updatedAt   | DATETIME     | auto                     |

### Table: `books`
| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| id            | INT          | PK, Auto Increment       |
| title         | VARCHAR(255) | NOT NULL                 |
| isbn          | VARCHAR(20)  | NOT NULL, UNIQUE         |
| genre         | VARCHAR(100) | nullable                 |
| publishedYear | INT          | nullable                 |
| copies        | INT          | NOT NULL, default 1      |
| authorId      | INT          | FK → authors.id          |
| createdAt     | DATETIME     | auto                     |
| updatedAt     | DATETIME     | auto                     |

### Table: `members`
| Column    | Type         | Constraints              |
|-----------|--------------|--------------------------|
| id        | INT          | PK, Auto Increment       |
| name      | VARCHAR(150) | NOT NULL                 |
| email     | VARCHAR(255) | NOT NULL, UNIQUE         |
| phone     | VARCHAR(20)  | nullable                 |
| address   | TEXT         | nullable                 |
| createdAt | DATETIME     | auto                     |
| updatedAt | DATETIME     | auto                     |

### Table: `borrow_records` (junction table)
| Column     | Type                          | Constraints                |
|------------|-------------------------------|----------------------------|
| id         | INT                           | PK, Auto Increment         |
| MemberId   | INT                           | FK → members.id            |
| BookId     | INT                           | FK → books.id              |
| borrowDate | DATEONLY                      | NOT NULL                   |
| dueDate    | DATEONLY                      | NOT NULL                   |
| returnDate | DATEONLY                      | nullable (null = active)   |
| status     | ENUM(borrowed,returned,overdue) | NOT NULL, default borrowed |
| createdAt  | DATETIME                      | auto                       |
| updatedAt  | DATETIME                      | auto                       |

---

## ER Diagram

```
┌────────────┐       ┌────────────┐       ┌──────────────────┐       ┌──────────────┐
│  authors   │       │   books    │       │  borrow_records  │       │   members    │
│────────────│       │────────────│       │──────────────────│       │──────────────│
│ id (PK)    │───┐   │ id (PK)    │──┐    │ id (PK)          │   ┌───│ id (PK)      │
│ name       │   └──►│ authorId   │  │    │ BookId   (FK) ◄──┘   │   │ name         │
│ nationality│       │ title      │  └───►│ MemberId (FK)    ◄────┘   │ email        │
│ bio        │       │ isbn       │       │ borrowDate       │       │ phone        │
└────────────┘       │ genre      │       │ dueDate          │       │ address      │
                     │ copies     │       │ returnDate       │       └──────────────┘
                     └────────────┘       │ status           │
                                          └──────────────────┘

Relationships:
  Author (1) ───────── (Many) Book         [Author hasMany Books]
  Member (Many) ─────── (Many) Book        [via borrow_records junction table]
```

---

## API Reference

### Authors

| Method | Path                | Body (JSON)                        | Response             |
|--------|---------------------|------------------------------------|----------------------|
| GET    | /api/authors        | –                                  | 200 Array of authors |
| GET    | /api/authors/:id    | –                                  | 200 Author + books / 404 |
| POST   | /api/authors        | `{ name*, nationality, bio }`      | 201 Created / 400    |
| PUT    | /api/authors/:id    | `{ name, nationality, bio }`       | 200 Updated / 404    |
| DELETE | /api/authors/:id    | –                                  | 200 Message / 404    |

### Books

| Method | Path                    | Body (JSON)                                              | Response             |
|--------|-------------------------|----------------------------------------------------------|----------------------|
| GET    | /api/books              | –                                                        | 200 Array of books   |
| GET    | /api/books/:id          | –                                                        | 200 Book + author + borrowers / 404 |
| POST   | /api/books              | `{ title*, isbn*, authorId*, genre, publishedYear, copies }` | 201 Created / 400 |
| PUT    | /api/books/:id          | `{ title, isbn, genre, publishedYear, copies, authorId }` | 200 Updated / 404 |
| DELETE | /api/books/:id          | –                                                        | 200 Message / 404    |
| GET    | /api/books/:id/borrowers | –                                                       | 200 Borrow records   |

### Members

| Method | Path                          | Body (JSON)                              | Response              |
|--------|-------------------------------|------------------------------------------|-----------------------|
| GET    | /api/members                  | –                                        | 200 Array of members  |
| GET    | /api/members/:id              | –                                        | 200 Member + history / 404 |
| POST   | /api/members                  | `{ name*, email*, phone, address }`      | 201 Created / 400     |
| PUT    | /api/members/:id              | `{ name, email, phone, address }`        | 200 Updated / 404     |
| DELETE | /api/members/:id              | –                                        | 200 Message / 404     |
| POST   | /api/members/:id/borrow       | `{ bookId*, dueDate* }`                  | 201 BorrowRecord / 400 |
| PUT    | /api/members/:id/return/:rid  | –                                        | 200 Updated record / 404 |
| GET    | /api/members/:id/borrows      | –                                        | 200 Borrow history    |

`*` = required field

---

## Error Responses

| Status | When it occurs | JSON structure |
|--------|---------------|----------------|
| 400    | Missing or invalid request body fields | `{ "error": "Validation Error", "message": "..." }` |
| 404    | Record not found by ID, or undefined route | `{ "error": "...", "message": "..." }` |
| 500    | Unexpected server error | `{ "error": "Internal Server Error", "message": "..." }` |

### Example 400 Response
```json
{
  "error": "Validation Error",
  "message": "title is required"
}
```

### Example 404 Response
```json
{
  "error": "Book not found"
}
```

### Example Undefined Route 404
```json
{
  "error": "Route not found",
  "message": "Cannot GET /api/nonexistent"
}
```

---

## Project Structure

```
library-api/
├── config/
│   └── database.js          # Sequelize connection setup
├── controllers/
│   ├── authorController.js  # Author business logic
│   ├── bookController.js    # Book business logic
│   └── memberController.js  # Member + borrow/return logic
├── middleware/
│   ├── logger.js            # Custom request logger
│   ├── notFound.js          # 404 catch-all handler
│   └── errorHandler.js      # Global error handler (4 params)
├── models/
│   ├── index.js             # Model associations
│   ├── Author.js
│   ├── Book.js
│   ├── Member.js
│   └── BorrowRecord.js      # Junction table model
├── routes/
│   ├── authorRoutes.js
│   ├── bookRoutes.js
│   └── memberRoutes.js
├── docs/
│   └── postman_collection.json
├── .env.example
├── .gitignore
├── index.js                 # Entry point
├── package.json
└── README.md
```
