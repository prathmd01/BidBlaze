
# BidBlaze Backend API

A Node.js + Express backend for the BidBlaze auction platform.

## Features

- User authentication and authorization (JWT)
- Role-based access control (User, Seller, Admin)
- Auction management with real-time bidding
- Payment processing with Razorpay
- MongoDB integration with Mongoose
- Input validation and error handling
- Security middleware (Helmet, CORS, Rate Limiting)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
- MongoDB connection string
- JWT secret
- Razorpay credentials
- Other settings

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/my-auctions` - Get user's auctions (sellers)

### Auctions
- `GET /api/auctions` - Get all auctions (with filtering)
- `GET /api/auctions/:id` - Get single auction
- `POST /api/auctions` - Create auction (sellers only)
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction

### Bids
- `POST /api/bids` - Place a bid
- `GET /api/bids/auction/:auctionId` - Get auction bids
- `GET /api/bids/my-bids` - Get user's bids
- `GET /api/bids/winning` - Get winning bids

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/transactions` - Get user transactions
- `POST /api/payments/webhook` - Razorpay webhook

## Database Models

### User
- Authentication and profile information
- Role-based permissions
- KYC status tracking

### Auction
- Auction details and metadata
- Timing and pricing information
- Status management

### Bid
- Bidding history
- Auto-bidding support
- Winning bid tracking

### Transaction
- Payment processing
- Razorpay integration
- Transaction history

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- Rate limiting
- Helmet for security headers

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Environment Variables

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay API secret
- `FRONTEND_URL` - Frontend URL for CORS
