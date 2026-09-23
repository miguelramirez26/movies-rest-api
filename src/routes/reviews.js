const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

function getReviewsCollection() {
  return connectToDatabase().then((database) => database.collection(process.env.REVIEWS_COLLECTION));
}

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

router.get('/', async (request, response, next) => {
  try {
    const reviews = await (await getReviewsCollection()).find().sort({ createdAt: -1 }).toArray();
    response.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const reviewId = parseId(request.params.id);
    if (!reviewId) return response.status(400).json({ error: 'Invalid review ID.' });

    const review = await (await getReviewsCollection()).findOne({ _id: reviewId });
    if (!review) return response.status(404).json({ error: 'Review not found.' });

    response.json(review);
  } catch (error) {
    next(error);
  }
});

router.post('/', ensureAuthenticated, async (request, response, next) => {
  try {
    const review = request.body;
    if (!review || typeof review !== 'object' || !review.movieId || !review.text) {
      return response.status(400).json({ error: 'movieId and text are required.' });
    }

    const document = { ...review, createdAt: new Date(), updatedAt: new Date() };
    const result = await (await getReviewsCollection()).insertOne(document);
    response.status(201).json({ _id: result.insertedId, ...document });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', ensureAuthenticated, async (request, response, next) => {
  try {
    const reviewId = parseId(request.params.id);
    if (!reviewId) return response.status(400).json({ error: 'Invalid review ID.' });
    if (!request.body || typeof request.body !== 'object' || !request.body.movieId || !request.body.text) {
      return response.status(400).json({ error: 'movieId and text are required.' });
    }

    const replacement = { ...request.body, updatedAt: new Date() };
    const result = await (await getReviewsCollection()).replaceOne({ _id: reviewId }, replacement);
    if (!result.matchedCount) return response.status(404).json({ error: 'Review not found.' });

    response.json({ _id: reviewId, ...replacement });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', ensureAuthenticated, async (request, response, next) => {
  try {
    const reviewId = parseId(request.params.id);
    if (!reviewId) return response.status(400).json({ error: 'Invalid review ID.' });

    const result = await (await getReviewsCollection()).deleteOne({ _id: reviewId });
    if (!result.deletedCount) return response.status(404).json({ error: 'Review not found.' });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;