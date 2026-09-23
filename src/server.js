require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { closeDatabaseConnection, connectToDatabase } = require('./db');
const { ensureGitHubConfigured, passport } = require('./auth');
const moviesRouter = require('./routes/movies');
const reviewsRouter = require('./routes/reviews');
const swaggerDocument = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-only-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api-docs', swaggerUi.serve);
app.get(['/api-docs', '/api-docs/'], swaggerUi.setup(swaggerDocument));

app.get('/auth/github', ensureGitHubConfigured, passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', ensureGitHubConfigured, passport.authenticate('github', {
  failureRedirect: '/auth/login-failed'
}), (request, response) => {
  response.json({ message: 'GitHub authentication successful.', user: request.user });
});
app.get('/auth/login-failed', (request, response) => {
  response.status(401).json({ error: 'GitHub authentication failed.' });
});
app.get('/auth/logout', (request, response, next) => {
  request.logout((error) => {
    if (error) return next(error);
    request.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      response.json({ message: 'Logged out successfully.' });
    });
  });
});

app.get('/', (request, response) => {
  response.json({ name: 'Movies REST API', status: 'online' });
});

app.get('/health', async (request, response, next) => {
  try {
    await connectToDatabase();
    response.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/movies', moviesRouter);
app.use('/api/reviews', reviewsRouter);

app.use((request, response) => {
  response.status(404).json({ error: 'Route not found.' });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error.' });
});

function startServer() {
  app.listen(port, () => {
    console.log(`Movies REST API listening on port ${port}`);
  });

  connectToDatabase()
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((error) => console.error('MongoDB connection failed:', error.message));
}

startServer();

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

module.exports = app;