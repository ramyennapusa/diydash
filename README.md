# DIYDash

DIYDash is a modern React dashboard application for managing DIY (Do It Yourself) projects and tasks. Built with React 18+ and Vite for fast development and optimized production builds.

## Features

- Clean, responsive dashboard interface
- Modern React with functional components
- Fast development with Vite and hot module replacement
- Optimized production builds
- Mobile-friendly responsive design

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the DIYDash project
2. Navigate to the project directory:
   ```bash
   cd diydash
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
diydash/
├── public/              # Static assets
├── src/                 # Source code
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # React components
│   │   ├── Dashboard.jsx    # Dashboard component
│   │   └── Dashboard.css    # Dashboard styles
│   ├── App.jsx          # Main App component
│   ├── App.css          # App component styles
│   ├── index.css        # Global styles
│   └── main.jsx         # Application entry point
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # Project documentation
```

## Technology Stack

- **React 18+** - Modern React with functional components and hooks
- **Vite** - Fast build tool and development server
- **CSS** - Modern CSS with flexbox/grid for responsive layouts
- **ESLint** - Code quality and consistency

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.