# Flight Finder - Client 🎨

A modern React + Vite frontend for the Flight Finder application. Built for performance and user experience, this client provides an intuitive interface to search flights and manage price watches with multi-language support.

## Overview

This is the frontend application for Flight Finder, a full-stack flight deal tracker. The client handles:
- Flight search and display
- Destination management
- Price threshold settings
- User notifications preferences
- Interactive flight booking interface
- Airport information display
- Multi-language support via DeepL and i18next

## Tech Stack

- **React 19** - UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **JavaScript (ES6+)** - Modern JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **i18next** - Internationalization framework
- **DeepL Node** - Language translation API client
- **Shadcn UI** - Pre-built, customizable components
- **ESLint** - Code quality and style consistency

## Project Structure

```
client/
├── public/                            # Static assets
│   ├── favicon.ico                    # Website favicon
│   └── [other static files]
│
├── scripts/                           # Build and utility scripts
│   └── [build scripts]
│
├── src/                               # React source code
│   ├── api/                           # API client functions
│   │   ├── flights.js                 # Flight API calls
│   │   ├── airports.js                # Airport API calls
│   │   └── [other API modules]
│   │
│   ├── assets/                        # Images and static resources
│   │   ├── images/                    # Image files
│   │   └── [other assets]
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── FlightCard.jsx             # Display individual flights
│   │   ├── SearchBar.jsx              # Flight search input
│   │   ├── DestinationList.jsx        # Manage watched destinations
│   │   ├── NotificationSettings.jsx   # User notification preferences
│   │   └── [other components]
│   │
│   ├── data/                          # Data files and constants
│   │   ├── airports.json              # Airport codes and data
│   │   └── [other data files]
│   │
│   ├── i18n/                          # Internationalization setup
│   │   ├── i18n.js                    # i18next configuration
│   │   └── locales/                   # Translation files
│   │       ├── en.json                # English translations
│   │       ├── es.json                # Spanish translations
│   │       ├── fr.json                # French translations
│   │       └── [other locales]
│   │
│   ├── pages/                         # Page-level components
│   │   ├── SearchPage.jsx             # Main search interface
│   │   ├── DealsPage.jsx              # Featured deals view
│   │   ├── SettingsPage.jsx           # User settings
│   │   └── [other pages]
│   │
│   ├── lib/                           # Utility libraries
│   │   ├── hooks.js                   # Custom React hooks
│   │   ├── formatters.js              # Data formatting helpers
│   │   └── [other libraries]
│   │
│   ├── utils/                         # Utility functions
│   │   ├── flightFormatters.js        # Flight data formatting helpers
│   │   ├── constants.js               # Application constants
│   │   ├── validators.js              # Input validation
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

3. **Configure environment variables**
   
   Create a `.env.local` file in the `client` directory:
   ```env
   # DeepL API Key for language translation
   VITE_DEEPL_KEY=your_deepl_api_key
   
   # Backend API URL
   VITE_API_URL=http://localhost:5000/api
   
   # Default language (optional, auto-detected by default)
   VITE_DEFAULT_LANGUAGE=en
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173` with HMR (Hot Module Replacement)

5. **Build for production**
   ```bash
   npm run build
   ```
   Creates optimized build in `dist/` directory

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
- Multi-language flight information display

### Airport Information
- Browse airport codes and details
- View airport facilities and information
- Search by airport name or code
- Translated airport names and descriptions

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

### Multi-Language Support
- **i18next** for managing translations
- **DeepL API** for dynamic translation
- **Browser language detection** for automatic language selection
- Support for 29+ languages
- Language switcher in UI
- Persistent language preference

### User Experience
- Responsive design (mobile, tablet, desktop)
- Fast loading with Vite
- Smooth animations and transitions
- Accessibility features
- Dark/Light theme support

## Configuration

### Backend API Connection

Edit API endpoint in `src/api/flights.js` or `src/utils/constants.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

Or set environment variable in `.env.local`:
```bash
VITE_API_URL=https://api.example.com/api
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

### i18n Configuration

Edit `src/i18n/i18n.js` to:
- Add/remove supported languages
- Configure detection and fallback behavior
- Set default language

Add translation files in `src/i18n/locales/` for each language:
```json
{
  "flight": {
    "search": "Search Flights",
    "price": "Price",
    "duration": "Duration"
  }
}
```

## Component Guidelines

### Creating New Components

```jsx
// src/components/MyComponent.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export function MyComponent({ title, onClick }) {
  const { t } = useTranslation();
  
  return (
    <div className="my-component">
      <h2>{t('myComponent.title')}</h2>
      <button onClick={onClick}>{t('common.clickMe')}</button>
    </div>
  );
}

export default MyComponent;
```

### Using Custom Hooks

```jsx
import { useFlights } from '../lib/hooks';

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

### Using i18next for Translations

```jsx
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

## API Integration

### Fetching Flight Data

```javascript
// src/api/flights.js
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

### Fetching Airport Data

```javascript
// src/api/airports.js
export async function getAirportInfo(code) {
  const response = await fetch(`${API_BASE_URL}/airports/${code}`);
  return response.json();
}
```

## Styling

### CSS Organization
- Global styles: `src/index.css`
- Component styles: Co-located with components or separate `.css` files
- Use TailwindCSS utility classes for styling
- Shadcn UI provides pre-styled component bases

### TailwindCSS

Customize in `tailwind.config.js`:
```javascript
export default {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

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
- **Translation caching**: i18next caches translations

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

Add environment variables in Vercel dashboard for `VITE_DEEPL_KEY` and `VITE_API_URL`

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

Add environment variables in Netlify for `VITE_DEEPL_KEY` and `VITE_API_URL`

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
   - Custom hooks in `lib/hooks.js` for reusable logic
   - Keep components readable

4. **Organize API calls**
   - Keep API calls in `api/` folder
   - Use consistent naming conventions
   - Handle errors properly

5. **Translation key naming**
   - Use dot notation: `flight.search.button`
   - Group related keys together
   - Keep keys consistent across languages

6. **Optimize renders**
   - Use `React.memo` for expensive components
   - Avoid inline object/array creation in props

7. **Error handling**
   - Wrap API calls in try/catch
   - Show user-friendly error messages
   - Provide fallback UI when translations fail

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
- Confirm environment variables are set correctly in `.env.local`
- Ensure SerpAPI and AviationStack credentials are configured in backend

### Translation Issues
- Verify DeepL API key is correct in `.env.local`
- Check browser console for i18next warnings
- Ensure locale files exist in `src/i18n/locales/`
- Verify translation keys match between JSX and JSON files

## Further Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [i18next Documentation](https://www.i18next.com/)
- [DeepL API Documentation](https://www.deepl.com/docs/api)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [SerpAPI Documentation](https://serpapi.com/docs)
- [AviationStack Documentation](https://aviationstack.com/documentation)
- [Sheety Documentation](https://sheety.co)

## License

This project is licensed under the MIT License.

## Contributing

See the main [Flight-Finder README](../README.md) for contribution guidelines.

---

Happy coding! 🚀
