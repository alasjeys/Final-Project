require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const logger      = require('./middleware/logger');
const notFound    = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authorRoutes = require('./routes/authorRoutes');
const bookRoutes   = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Built-in middleware ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Custom logger middleware ──────────────────────────────────────────────────
app.use(logger);

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Library Management API',
    version: '1.0.0',
    endpoints: {
      authors: '/api/authors',
      books:   '/api/books',
      members: '/api/members',
    },
  });
});

app.use('/api/authors', authorRoutes);
app.use('/api/books',   bookRoutes);
app.use('/api/members', memberRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global error handler (must be last; exactly 4 params) ────────────────────
app.use(errorHandler);

// ── Database sync + server start ─────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅  Database connection established.');

    // alter: true updates columns without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅  All tables synced.');

    app.listen(PORT, () => {
      console.log(`🚀  Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌  Unable to connect to the database:', error.message);
    process.exit(1);
  }
})();
