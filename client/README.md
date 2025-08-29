# PowerHub Client

This folder contains the React frontend for PowerHub. It provides a modern, responsive UI for video browsing, channel management, and user interaction.

## Tech Stack

- React (Vite)
- Tailwind CSS
- React Router
- Context API (Auth)
- Fetch API for backend communication

## Structure

- `src/`
  - `components/` — UI components (Header, Sidebar, ProgressBar, etc.)
  - `pages/` — Main pages (Home, Watch, Profile, ChannelProfile, etc.)
  - `context/` — Auth context
  - `theme/` — Theme colors
  - `utils/` — Utility functions
- `public/` — Static assets
- `index.html` — Main HTML entry

## Features

- User registration, login, and profile management
- Channel creation and editing
- Video upload, display, and recommendations
- Like, dislike, comment, and subscribe
- Filtering and sorting
- Skeleton loaders and progress bar for smooth UX

## Setup

1. Install dependencies: `pnpm install` 
2. Start dev server: `pnpm run dev`
3. Access at `http://localhost:5173`

## Development Notes

- Uses context for authentication state
- ProgressBar and skeleton UI for loading states
- Responsive design for desktop and mobile

## Contributing

- Follow code style and add comments for new components/pages
- Open issues/PRs for bugs or improvements

## License
Sole rights to this project are owned by Zack Lyula as of August 29, 2025. All rights reserved.
