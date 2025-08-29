# PowerHub Project

PowerHub is a full-stack video sharing and channel management platform with the UI/UX inspired by YouTube, built with a modern React frontend and Node.js/Express backend. It supports user registration, profile management (including profile pictures), video uploads, channel creation, filtering, recommendations, and interactive features like likes, dislikes, comments, and subscriptions.

## Project Structure

- `client/` — React frontend (Vite, Tailwind CSS)
- `server/` — Node.js/Express backend (MongoDB, Cloudinary)
- `uploads/` — Local storage for uploaded files (dev only)

## Features
- User registration, login, and authentication
- Channel creation and profile management
- Video upload, display, and recommendations
- Profile picture upload (Cloudinary integration)
- Like, dislike, comment, and subscribe functionality
- Filtering and sorting (latest, category, etc.)
- Responsive UI with skeleton loaders and progress bar

## Getting Started

1. Clone the repo and install dependencies in both `client` and `server` folders using `pnpm install`.
2. Set up environment variables for backend (see `server/README.md`).
3. Start backend (`pnpm run dev` in `server/`) and frontend (`pnpm dev` in `client/`).
4. Access the app at `http://localhost:5173` (default Vite port).

## Development Notes
- Frontend uses React Router for navigation and context for auth.
- Backend uses Express, Mongoose, and Cloudinary for media.
- See individual folder READMEs for more details.

## Contributing
- Follow the code style and structure in both folders.
- Open issues or PRs for bugs, features, or improvements.

## License
Sole rights to this project are owned by Zack Lyula as of August 29, 2025. All rights reserved.
