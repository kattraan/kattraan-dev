# Kattraan LMS - Learning Management System

A modern, responsive Learning Management System built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Modern dark-themed UI with gradient backgrounds
- 📱 Fully responsive (Mobile, Tablet, Desktop, Large Desktop)
- ✨ Professional animations using Framer Motion
- 🎯 Hero section with compelling call-to-action
- 📚 Trending courses showcase
- 🔍 Search functionality
- 🎭 Smooth transitions and hover effects

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Card, etc.)
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   └── sections/       # Page sections (Hero, Courses, etc.)
├── pages/              # Page components
├── assets/             # Images, fonts, and other static assets
├── styles/             # Global styles and utilities
├── utils/              # Helper functions and utilities
├── hooks/              # Custom React hooks
└── constants/          # Constants and configuration
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT

