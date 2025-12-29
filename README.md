# Coupon Manager

Full-stack application for managing coupons and vouchers with support for single-store and multi-store coupons, groups, user permissions, and email notifications.

## Project Structure

```
Coupon App/
├── server/          # Backend API (Node.js + Express + TypeScript)
├── client/          # Frontend (React + TypeScript + Vite)
└── Docs/            # Specifications and documentation
```

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Google OAuth
- Cloudinary (Image uploads)
- Resend/SendGrid (Email)

### Frontend
- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Email service account (Resend or SendGrid)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see `server/.env.example`)

4. Run development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see `client/.env.example`)

4. Run development server:
```bash
npm run dev
```

## Documentation

See `Docs/` directory for:
- HLD (High-Level Design)
- MLD (Mid-Level Design)
- ERD (Entity Relationship Diagram)
- API Specification

## Deployment

### Backend (Render)
- Configure environment variables
- Set up MongoDB Atlas
- Configure cron job for daily expiry check

### Frontend (Netlify)
- Configure build command: `npm run build`
- Set environment variables
- Configure redirects for SPA routing

## License

ISC
