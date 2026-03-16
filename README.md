# Medical Shop Backend API

Backend structure for the Medical Shop application using Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and other configurations.

4. Connect to MongoDB in `server.js`:
```javascript
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
```

5. Start the server:
```bash
npm run dev
```

## API Routes (Placeholders)

- `GET /api/health` - Health check
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine (Admin)
- `PUT /api/medicines/:id` - Update medicine (Admin)
- `DELETE /api/medicines/:id` - Delete medicine (Admin)
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Models

- **Medicine** - Medicine/product information
- **Order** - Order details and status
- **User** - User accounts and authentication
- **Category** - Medicine categories

## TODO

- Implement full CRUD operations
- Add authentication middleware
- Implement file upload for prescriptions
- Add validation and error handling
- Add pagination and filtering
- Implement search functionality
- Add email notifications
- Add order tracking


