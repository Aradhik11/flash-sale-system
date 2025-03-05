# Flash Sale System

A high-performance backend API system built with TypeScript, designed to handle flash sale events with real-time inventory updates, user purchases, and leaderboard functionality.

## Features

- **Real-time Inventory Updates**: Track stock levels in real-time during flash sales
- **Concurrency Control**: Prevent overselling through MongoDB atomic operations and transactions
- **Type Safety**: Enhanced code quality with TypeScript's strong typing system
- **User Authentication**: Secure API endpoints with JWT authentication
- **Admin Authorization**: Role-based access control for administrative functions
- **Leaderboard System**: Track users who successfully purchased in chronological order
- **Sale Event Management**: Start, stop, and reset flash sale events
- **Security Measures**: Rate limiting, input validation, and protection against common attacks

## Tech Stack

- **TypeScript**: Strongly typed programming language that builds on JavaScript
- **Node.js & Express**: Fast, unopinionated web framework
- **MongoDB & Mongoose**: NoSQL database with replica set for transaction support
- **JWT Authentication**: Secure API endpoints
- **Winston Logger**: Comprehensive logging system
- **MongoDB Transactions**: Ensure data consistency with ACID transactions
- **Express Rate Limiter**: Prevent abuse and DDoS attacks

## Project Structure

```
src/
├── config/
│   └── db.ts                  # Database configuration
├── controllers/
│   ├── flashSaleController.ts # Flash sale management
│   ├── purchaseController.ts  # Purchase processing
│   └── userController.ts      # User authentication
├── middleware/
│   ├── auth.ts                # Authentication middleware
│   └── rateLimiter.ts         # Rate limiting for API protection
├── models/
│   ├── FlashSale.ts           # Flash sale data model
│   ├── Purchase.ts            # Purchase data model
│   └── User.ts                # User data model
├── routes/
│   ├── flashSaleRoutes.ts     # Flash sale API routes
│   ├── purchaseRoutes.ts      # Purchase API routes
│   └── userRoutes.ts          # User authentication routes
├── types/
│   └── express.ts             # TypeScript type definitions
├── utils/
│   ├── errorHandler.ts        # Error response handling
│   └── logger.ts              # Logging utility
├── adminSeed.ts               # Admin user seeding script
└── app.ts                     # Main application entry point
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) configured as a replica set
- npm or yarn
- TypeScript understanding

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Aradhik11/flash-sale-system.git
   cd flash-sale-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/flash-sale-system?replicaSet=rs0
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   LOG_LEVEL=info
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   PURCHASE_RATE_LIMIT_WINDOW=1
   PURCHASE_RATE_LIMIT_MAX=5
   ADMIN_NAME=System Admin
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=securepassword123
   ```

4. Set up MongoDB replica set (required for transactions):
   ```bash
   # Create data directories
   mkdir -p data/rs0-0 data/rs0-1 data/rs0-2
   
   # Start MongoDB instances (in separate terminals)
   mongod --replSet rs0 --port 27017 --dbpath data/rs0-0 --bind_ip localhost
   mongod --replSet rs0 --port 27018 --dbpath data/rs0-1 --bind_ip localhost
   mongod --replSet rs0 --port 27019 --dbpath data/rs0-2 --bind_ip localhost
   
   # Initialize the replica set (in mongo shell)
   mongo --port 27017
   > rs.initiate({
       _id: "rs0",
       members: [
         { _id: 0, host: "localhost:27017" },
         { _id: 1, host: "localhost:27018" },
         { _id: 2, host: "localhost:27019" }
       ]
     })
   ```

5. Seed the admin user:
   ```bash
   npm run seed:admin
   ```

6. Build the TypeScript code:
   ```bash
   npm run build
   ```

7. Start the server:
   ```bash
   npm start
   ```

For development with hot reloading:
   ```bash
   npm run dev
   ```

The server will be running at `http://localhost:5000` with an API documentation https://flash-sale-system-lssc.onrender.com/api-docs.

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login (returns JWT token)
- `GET /api/users/me` - Get current user profile (protected)

### Flash Sales

- `GET /api/flash-sales` - Get all flash sales
- `POST /api/flash-sales` - Create a new flash sale (admin only)
- `GET /api/flash-sales/:id` - Get a specific flash sale
- `PUT /api/flash-sales/:id` - Update a flash sale (admin only)
- `DELETE /api/flash-sales/:id` - Delete a flash sale (admin only)
- `GET /api/flash-sales/:id/status` - Get real-time status of a flash sale
- `POST /api/flash-sales/:id/reset` - Reset a flash sale for a new event (admin only)
- `GET /api/flash-sales/:id/leaderboard` - Get the leaderboard for a flash sale

### Purchases

- `POST /api/purchases` - Make a purchase in a flash sale (protected)
- `GET /api/purchases/my-purchases` - Get user's purchase history (protected)


