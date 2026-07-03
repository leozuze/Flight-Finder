# Flight Finder - Client 🎨

A modern React + Vite frontend for the Flight Finder application. Built for performance and user experience, this client provides an intuitive interface to search flights and manage price watches.

## Overview

This is the frontend application for Flight Finder, a full-stack flight deal tracker. The client handles:
- Flight search and display
- Destination management
- Price threshold settings
- User notifications preferences
- Interactive flight booking interface

## Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **JavaScript (ES6+)** - Modern JavaScript
- **ESLint** - Code quality and style consistency
- **Shadcn UI Components** - Pre-built, customizable components

## Project Structure

```
client/
├── public/                            # Static assets
│   ├── favicon.ico                    # Website favicon
│   └── [other static files]
│
├── src/                               # React source code
│   ├── components/                    # Reusable UI components
│   │   ├── FlightCard.jsx             # Display individual flights
│   │   ├── SearchBar.jsx              # Flight search input
│   │   ├── DestinationList.jsx        # Manage watched destinations
│   │   ├── NotificationSettings.jsx   # User notification preferences
│   │   └── [other components]
│   │
│   ├── pages/                         # Page-level components
│   │   ├── SearchPage.jsx             # Main search interface
│   │   ├── DealsPage.jsx              # Featured deals view
│   │   ├── SettingsPage.jsx           # User settings
│   │   └── [other pages]
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useFlights.js              # Flight data fetching logic
│   │   ├── useDestinations.js         # Destination management
│   │   └── [other hooks]
│   │
│   ├── utils/                         # Utility functions
│   │   ├── api.js                     # API client functions
│   │   ├── formatters.js              # Data formatting helpers
│   │   └── [other utilities]
│   │
│   ├── App.jsx                        # Main App component & routing
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Global styles
│
├── index.html                         # HTML template
├── vite.config.js                     # Vite configuration
├── eslint.config.js                   # ESLint configuration
├── jsconfig.json                      # JavaScript configuration
├── components.json                    # UI component registry
├── package.json                       # Dependencies & scripts
├── package-lock.json                  # Dependency lock file
├── .gitignore                         # Git ignore rules
└── README.md                          # This file
```

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- The backend server should be running on `http://localhost:5000`

### Setup Steps

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173` with HMR (Hot Module Replacement)

4. **Build for production**
   ```bash
   npm run build
   ```
   Creates optimized build in `dist/` directory

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production (minified) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

## Features

### Flight Search
- Search flights by:
  - Origin and destination airports
  - Departure date ranges
  - Passenger count
  - Cabin class (economy, business, first)
- Real-time price updates from backend API (powered by SerpAPI & AviationStack)
- Sort and filter results

### Destination Management
- Add/remove flight destination watches
- Set price alert thresholds
- View price history and trends
- Get notified when prices drop

### Notification Settings
- Choose notification methods:
  - Email alerts
  - SMS (Twilio)
- Set quiet hours
- Frequency preferences
- Destination-specific rules

### User Experience
- Responsive design (mobile, tablet, desktop)
- Fast loading with Vite
- Smooth animations and transitions
- Accessibility features

## Configuration

### Backend API Connection

Edit API endpoint in `src/utils/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

Or set environment variable:
```bash
VITE_API_URL=https://api.example.com/api npm run dev
```

### Vite Configuration

Edit `vite.config.js` for custom build settings:
```javascript
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
}
```

## Component Guidelines

### Creating New Components

```jsx
// src/components/MyComponent.jsx
import React from 'react';

export function MyComponent({ title, onClick }) {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onClick}>Click me</button>
    </div>
  );
}

export default MyComponent;
```

### Using Custom Hooks

```jsx
import { useFlights } from '../hooks/useFlights';

export function FlightList() {
  const { flights, loading, error } = useFlights();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {flights.map(flight => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
```

## API Integration

### Fetching Flight Data

```javascript
// src/utils/api.js
export async function searchFlights(params) {
  const response = await fetch(`${API_BASE_URL}/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}

// Usage in component
const flights = await searchFlights({
  origin: 'LHR',
  destination: 'CDG',
  departDate: '2024-12-25'
});
```

## Styling

### CSS Organization
- Global styles: `src/index.css`
- Component styles: Co-located with components or separate `.css` files
- Use CSS modules for scoped styling
- Shadcn UI provides base component styles

### Tailwind CSS Integration

If you want to add Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then configure `tailwind.config.js` and import Tailwind directives.

## Code Quality

### Running ESLint
```bash
npm run lint
```

### ESLint Rules
Configured in `eslint.config.js` for:
- React best practices
- Hooks rules
- Modern JavaScript patterns
- Code consistency

### Recommended Improvements
- Add TypeScript for type safety
- Implement Husky for pre-commit linting
- Set up GitHub Actions for CI/CD
- Add unit tests (Vitest/Jest)

## Performance Optimization

- **Vite bundle**: ~100KB gzipped
- **Code splitting**: Automatic route-based splits
- **Image optimization**: Use lazy loading
- **Caching**: Browser caching for assets

## Deployment

### Deploy to GitHub Pages

1. Update `vite.config.js`:
   ```javascript
   export default {
     base: '/Flight-Finder/',
     // ... other config
   }
   ```

2. Build and deploy:
   ```bash
   npm run build
   git add dist
   git commit -m "Deploy to GitHub Pages"
   git push
   ```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Mobile

## Development Best Practices

1. **Use meaningful component names**
   - `FlightSearchBar.jsx` ✅
   - `SearchBar.jsx` ✅
   - `Bar.jsx` ❌

2. **Keep components small and focused**
   - One responsibility per component
   - Easy to test and maintain

3. **Use hooks for logic**
   - Custom hooks for reusable logic
   - Keep components readable

4. **Optimize renders**
   - Use `React.memo` for expensive components
   - Avoid inline object/array creation in props

5. **Error handling**
   - Wrap API calls in try/catch
   - Show user-friendly error messages

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Connection Issues
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Confirm `.env` variables are set correctly
- Ensure SerpAPI and AviationStack credentials are configured in backend

## Further Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [SerpAPI Documentation](https://serpapi.com/docs)
- [AviationStack Documentation](https://aviationstack.com/documentation)

## License

This project is licensed under the MIT License.

## Contributing

See the main [Flight-Finder README](../README.md) for contribution guidelines.

---

Happy coding! 🚀
