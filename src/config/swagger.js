const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js REST API',
      version: '1.0.0',
      description: 'Simple REST API backend built with Node.js, Express.js using MVC architecture pattern',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'age'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated unique identifier',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Full name in Vietnamese format',
              minLength: 2,
              example: 'Nguyễn Văn A',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Unique email address',
              example: 'nguyenvana@email.com',
            },
            age: {
              type: 'integer',
              minimum: 1,
              maximum: 150,
              description: 'Age in years',
              example: 25,
            },
          },
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email', 'age'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              example: 'Nguyễn Văn A',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'nguyenvana@email.com',
            },
            age: {
              type: 'integer',
              minimum: 1,
              maximum: 150,
              example: 25,
            },
          },
        },
        UserUpdate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              example: 'Nguyễn Văn A - Updated',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'nguyenvana.updated@email.com',
            },
            age: {
              type: 'integer',
              minimum: 1,
              maximum: 150,
              example: 26,
            },
          },
        },
        SearchQuery: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'nguyenvana@email.com',
            },
            name: {
              type: 'string',
              example: 'Nguyễn',
            },
            age: {
              type: 'integer',
              example: 25,
            },
          },
        },
        AdvancedQuery: {
          type: 'object',
          properties: {
            where: {
              type: 'object',
              properties: {
                email: {
                  type: 'object',
                  properties: {
                    equals: {
                      type: 'string',
                      example: 'nguyenvana@email.com',
                    },
                    contains: {
                      type: 'string',
                      example: '@gmail.com',
                    },
                  },
                },
                age: {
                  type: 'object',
                  properties: {
                    gt: {
                      type: 'integer',
                      example: 20,
                    },
                    lt: {
                      type: 'integer',
                      example: 35,
                    },
                    equals: {
                      type: 'integer',
                      example: 25,
                    },
                  },
                },
              },
            },
            select: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['id', 'name', 'email', 'age'],
              },
              example: ['name', 'email'],
            },
            sort: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  enum: ['id', 'name', 'email', 'age'],
                  example: 'name',
                },
                direction: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  example: 'asc',
                },
              },
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 1000,
              example: 10,
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              oneOf: [
                { $ref: '#/components/schemas/User' },
                {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              ],
            },
            total: {
              type: 'integer',
              example: 1,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Validation error 1', 'Validation error 2'],
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Server đang hoạt động',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-28T02:00:00.000Z',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Conflict: {
          description: 'Conflict - Resource already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};