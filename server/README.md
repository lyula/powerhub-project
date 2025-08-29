# PowerHub Server

This folder contains the Node.js/Express backend for PowerHub. It manages authentication, user and channel profiles, video uploads, filtering, and all API endpoints for the frontend.

## Tech Stack
- Node.js
- Express
- MongoDB (via Mongoose)
- Cloudinary (image/video uploads)
- JWT (authentication)

## Structure
- `index.js` — Main server entry point
- `config/` — Database and Cloudinary config
- `controllers/` — Route logic for users, channels, videos, filters
- `middleware/` — Auth and upload middleware
- `models/` — Mongoose schemas for User, Channel, Video, Filter
- `routes/` — API endpoints
- `scripts/` — Utility scripts for DB tasks
- `uploads/` — Local file uploads (dev only)

## Setup
1. Install dependencies: `pnpm install` 
2. Create a `.env` file with:
   - `MONGO_URI` (MongoDB connection string)
   - `CLOUDINARY_URL` (Cloudinary API URL)
   - `JWT_SECRET` (JWT signing key)
   - `PORT` (default: 3000)
3. Start server: `pnpm run dev` 

## API Endpoints
- `/auth` — Login, register
- `/channel` — Channel CRUD
- `/videos` — Video CRUD, recommendations
- `/filter` — Filtering
- `/profile` — Profile picture upload

## Development Notes
- All uploads go to Cloudinary (except local dev in `uploads/`)
- Auth middleware protects sensitive routes
- Scripts in `scripts/` for DB maintenance

## Contributing
- Follow code style and add comments for new endpoints
- Open issues/PRs for bugs or improvements

## License
Sole rights to this project are owned by Zack Lyula as of August 29, 2025. All rights reserved.
