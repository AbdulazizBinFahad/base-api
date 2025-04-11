const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || 'http://localhost';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Base API',
      version: '1.0.0',
      description: 'Basic Auth API with Node.js and Express',
    },
    servers: [
      {
        url: `${BASE_URL}:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
