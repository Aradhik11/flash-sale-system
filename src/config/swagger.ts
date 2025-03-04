import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flash Sale System API',
      version: '1.0.0',
      description: 'A high-performance backend API for handling flash sale events with real-time inventory updates',
      contact: {
        name: 'API Support',
        email: 'your-email@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the user'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              description: 'User email address',
              format: 'email'
            },
            password: {
              type: 'string',
              description: 'User password (hashed)',
              format: 'password'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Whether the user has admin privileges'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        FlashSale: {
          type: 'object',
          required: ['productName', 'totalStock', 'price', 'startTime'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the flash sale'
            },
            productName: {
              type: 'string',
              description: 'Name of the product'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            totalStock: {
              type: 'number',
              description: 'Total stock available for the flash sale'
            },
            remainingStock: {
              type: 'number',
              description: 'Remaining stock available for purchase'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'When the flash sale starts'
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'active', 'completed'],
              description: 'Current status of the flash sale'
            },
            maxPurchasePerUser: {
              type: 'number',
              description: 'Maximum quantity a user can purchase'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Purchase: {
          type: 'object',
          required: ['userId', 'flashSaleId', 'quantity', 'totalPrice'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated ID of the purchase'
            },
            userId: {
              type: 'string',
              description: 'ID of the user making the purchase'
            },
            flashSaleId: {
              type: 'string',
              description: 'ID of the flash sale'
            },
            quantity: {
              type: 'number',
              description: 'Quantity purchased'
            },
            totalPrice: {
              type: 'number',
              description: 'Total price of the purchase'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              description: 'Status of the purchase'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Purchase timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.resolve(__dirname, '../routes/*.ts'),
    path.resolve(__dirname, '../models/*.ts')
  ]
};

const specs = swaggerJsdoc(options);

export default specs;