const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');

const router = express.Router();
const requiredMovieFields = ['title', 'director', 'year', 'genre', 'duration', 'rating', 'language'];

function getMoviesCollection() {
  return connectToDatabase().then((database) => database.collection(process.env.MOVIES_COLLECTION));
}

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function hasRequiredMovieFields(movie) {
  return movie && typeof movie === 'object' && requiredMovieFields.every((field) => {
    return movie[field] !== undefined && movie[field] !== null && movie[field] !== '';
  });
}

router.get('/', async (request, response, next) => {
  try {
    const movies = await (await getMoviesCollection()).find().sort({ title: 1 }).toArray();
    response.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const movieId = parseId(request.params.id);
    if (!movieId) return response.status(400).json({ error: 'Invalid movie ID.' });

    const movie = await (await getMoviesCollection()).findOne({ _id: movieId });
    if (!movie) return response.status(404).json({ error: 'Movie not found.' });

    response.json(movie);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const movie = request.body;
    if (!hasRequiredMovieFields(movie)) {
      return response.status(400).json({
        error: 'Movies require title, director, year, genre, duration, rating, and language.'
      });
    }

    const result = await (await getMoviesCollection()).insertOne({ ...movie, createdAt: new Date(), updatedAt: new Date() });
    response.status(201).json({ _id: result.insertedId, ...movie });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const movieId = parseId(request.params.id);
    if (!movieId) return response.status(400).json({ error: 'Invalid movie ID.' });
    if (!hasRequiredMovieFields(request.body)) {
      return response.status(400).json({
        error: 'Movies require title, director, year, genre, duration, rating, and language.'
      });
    }

    const replacement = { ...request.body, updatedAt: new Date() };
    const result = await (await getMoviesCollection()).replaceOne({ _id: movieId }, replacement);
    if (!result.matchedCount) return response.status(404).json({ error: 'Movie not found.' });

    response.json({ _id: movieId, ...replacement });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const movieId = parseId(request.params.id);
    if (!movieId) return response.status(400).json({ error: 'Invalid movie ID.' });

    const result = await (await getMoviesCollection()).deleteOne({ _id: movieId });
    if (!result.deletedCount) return response.status(404).json({ error: 'Movie not found.' });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;