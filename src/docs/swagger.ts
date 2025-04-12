import swaggerJSDoc from 'swagger-jsdoc';

require('dotenv').config();

const SWAGGER_PORT: number = parseInt(process.env.PORT || '5000', 10);
const SWAGGER_BASE_URL: string = process.env.BASE_URL || 'http://localhost';

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
        url: `${SWAGGER_BASE_URL}:${SWAGGER_PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;