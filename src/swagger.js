const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Movies REST API',
    version: '1.0.0',
    description: 'CRUD API for movies and reviews backed by MongoDB.'
  },
  servers: [
    {
      url: 'https://movies-rest-api-bmx1.onrender.com',
      description: 'Render deployment'
    },
    {
      url: 'http://localhost:3000',
      description: 'Local development server'
    }
  ],
  tags: [
    { name: 'Movies', description: 'Movie collection operations' },
    { name: 'Reviews', description: 'Review collection operations' },
    { name: 'Authentication', description: 'GitHub authentication operations' }
  ],
  paths: {
    '/auth/github': {
      get: {
        tags: ['Authentication'],
        summary: 'Start GitHub login',
        responses: { 302: { description: 'Redirects to GitHub for authentication.' } }
      }
    },
    '/auth/github/callback': {
      get: {
        tags: ['Authentication'],
        summary: 'Handle GitHub OAuth callback',
        responses: {
          200: { description: 'Authentication successful.' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/auth/logout': {
      get: {
        tags: ['Authentication'],
        summary: 'Log out the current user',
        responses: { 200: { description: 'Session ended.' } }
      }
    },
    '/api/movies': {
      get: {
        tags: ['Movies'],
        summary: 'List all movies',
        responses: {
          200: {
            description: 'A list of movies.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Movie' } } } }
          }
        }
      },
      post: {
        tags: ['Movies'],
        summary: 'Create a movie',
        security: [{ SessionCookie: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieInput' } } } },
        responses: {
          201: { description: 'Movie created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } } },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/movies/{id}': {
      parameters: [{ $ref: '#/components/parameters/Id' }],
      get: {
        tags: ['Movies'],
        summary: 'Get a movie by ID',
        responses: {
          200: { description: 'Movie found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Movies'],
        summary: 'Replace a movie',
        security: [{ SessionCookie: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieInput' } } } },
        responses: {
          200: { description: 'Movie replaced.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Movies'],
        summary: 'Delete a movie',
        security: [{ SessionCookie: [] }],
        responses: {
          204: { description: 'Movie deleted.' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List all reviews',
        responses: {
          200: {
            description: 'A list of reviews.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Review' } } } }
          }
        }
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create a review',
        security: [{ SessionCookie: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewInput' } } } },
        responses: {
          201: { description: 'Review created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/reviews/{id}': {
      parameters: [{ $ref: '#/components/parameters/Id' }],
      get: {
        tags: ['Reviews'],
        summary: 'Get a review by ID',
        responses: {
          200: { description: 'Review found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Reviews'],
        summary: 'Replace a review',
        security: [{ SessionCookie: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewInput' } } } },
        responses: {
          200: { description: 'Review replaced.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete a review',
        security: [{ SessionCookie: [] }],
        responses: {
          204: { description: 'Review deleted.' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    }
  },
  components: {
    parameters: {
      Id: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'MongoDB ObjectId.',
        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '507f1f77bcf86cd799439011' }
      }
    },
    securitySchemes: {
      SessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
        description: 'Session cookie created after successful GitHub login.'
      }
    },
    responses: {
      BadRequest: {
        description: 'The request is invalid.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      NotFound: {
        description: 'The requested resource was not found.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      Unauthorized: {
        description: 'Authentication is required.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      }
    },
    schemas: {
      MovieInput: {
        type: 'object',
        required: ['title', 'director', 'year', 'genre', 'duration', 'rating', 'language'],
        properties: {
          title: { type: 'string', example: 'Inception' },
          director: { type: 'string', example: 'Christopher Nolan' },
          year: { type: 'integer', example: 2010 },
          genre: { type: 'string', example: 'Science Fiction' },
          duration: { type: 'integer', description: 'Duration in minutes.', example: 148 },
          rating: { type: 'string', example: 'PG-13' },
          language: { type: 'string', example: 'English' }
        }
      },
      Movie: {
        allOf: [
          { $ref: '#/components/schemas/MovieInput' },
          { type: 'object', properties: { _id: { type: 'string', example: '507f1f77bcf86cd799439011' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } }
        ]
      },
      ReviewInput: {
        type: 'object',
        required: ['movieId', 'text'],
        properties: {
          movieId: { type: 'string', description: 'ID of the reviewed movie.', example: '507f1f77bcf86cd799439011' },
          text: { type: 'string', example: 'A compelling and well-paced film.' },
          score: { type: 'number', example: 5 }
        }
      },
      Review: {
        allOf: [
          { $ref: '#/components/schemas/ReviewInput' },
          { type: 'object', properties: { _id: { type: 'string', example: '507f1f77bcf86cd799439012' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } }
        ]
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Resource not found.' } }
      }
    }
  }
};

module.exports = swaggerDocument;