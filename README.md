# Movies REST API

An Express REST API backed by MongoDB for managing movies and reviews.

## Setup

1. Install Node.js 18 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set the MongoDB connection string in `.env`. The project includes the requested connection string in the local `.env` file, which is excluded from Git.
4. Start the API:

   ```bash
   npm start
   ```

   Use `npm run dev` during development for automatic restarts.

## Endpoints

Both collections support `GET /`, `GET /:id`, `POST /`, `PUT /:id`, and `DELETE /:id`.

- Movies: `http://localhost:3000/api/movies`
- Reviews: `http://localhost:3000/api/reviews`
- Swagger documentation: `http://localhost:3000/api-docs`
- Deployed Swagger documentation: `https://movies-rest-api-bmx1.onrender.com/api-docs`
- Health check: `http://localhost:3000/health`

Movie creation and replacement require these seven fields: `title`, `director`, `year`, `genre`, `duration`, `rating`, and `language`. Review creation requires `movieId` and `text`. Additional fields are accepted and stored in MongoDB.