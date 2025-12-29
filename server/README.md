# Coupon Manager - Backend

Node.js + Express + TypeScript backend API for Coupon Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - MongoDB connection string
   - JWT secrets
   - Google OAuth credentials
   - Email service API key
   - Cloudinary credentials

4. Run development server:
```bash
npm run dev
```

## Build

```bash
npm run build
```

The compiled files will be in the `dist` directory.

## Run Production

```bash
npm start
```

## API Documentation

Base URL: `http://localhost:3000/api`

See API specification in `docs/04_API_Spec_Coupon_Manager.md` for endpoint details.
