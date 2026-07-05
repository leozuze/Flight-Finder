# Flight Finder 🛫

A full-stack flight deal tracker that searches for cheap flights and notifies users via SMS/email. Built with Python backend and React frontend, powered by SerpAPI & AviationStack APIs.

![Python](https://img.shields.io/badge/Python-91.5%25-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-8.5%25-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Smart Flight Search**: Search for cheap flights from a fixed origin to multiple destinations
- **Fallback Options**: Try direct flights first, then fall back to indirect options
- 💰 **Price Comparison**: Compare the latest fare against the stored lowest price
- 📊 **Data Management**: Update destination pricing in Google Sheets via Sheety
- 📧 **Multi-Channel Alerts**: Send notifications via email 
- ⚙️ **Environment Configuration**: Secure API keys and endpoints using `.env`
- **Modern UI**: React + Vite frontend for easy flight browsing
- **REST API**: Flask-based API for seamless integration
- ✈️ **Airport Information**: Real-time airport data and flight details

## Tech Stack

### Backend
- **Python 3.8+**
- **Flask** - RESTful API framework
- **Requests & requests-cache** - HTTP client with caching
- **python-dotenv** - Environment variable management
- **Sheety** - Google Sheets integration
- **SerpAPI** - Flight search data
- **AviationStack** - Flight data and airport information
- **SMTP** - Email notifications

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **JavaScript/JSX** - Component development

## Project Structure

```
Flight-Finder/
├── README.md                          # Main documentation
├── .gitignore                         # Git ignore rules
│
├── server/                            # Python backend
│   ├── api.py                         # Flask REST API endpoints
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Environment variables (⚠️ keep secret)
│   │
│   ├── src/                           # Source modules
│   │   ├── airport_board.py           # Airport information & flight details
│   │   ├── data_manager.py            # Google Sheets management via Sheety
│   │   ├── flight_data.py             # Flight data formatting & selection
│   │   ├── flight_search.py           # SerpAPI & AviationStack integration
│   │   └── notification_manager.py    # Email notification handler
│   │
│   └── venv/                          # Python virtual environment (ignored)
│
└── client/                            # React frontend
    ├── README.md                      # Client-specific documentation
    ├── package.json                   # Node dependencies
    ├── package-lock.json              # Dependency lock file
    ├── vite.config.js                 # Vite configuration
    ├── eslint.config.js               # Linting rules
    ├── jsconfig.json                  # JavaScript configuration
    ├── components.json                # UI component registry
    ├── index.html                     # HTML entry point
    ├── .gitignore                     # Client git ignore
    │
    ├── public/                        # Static assets
    │   └── [favicon, images, etc.]
    │
    └── src/                           # React components & logic
        ├── api/                       # API client functions
        │   ├── flights.js             # Flight API calls
        │   ├── airports.js            # Airport API calls
        │   └── [other API modules]
        │
        ├── assets/                    # Images and static resources
        │   ├── images/                # Image files
        │   └── [other assets]
        │
        ├── components/                # Reusable UI components
        │   ├── FlightCard.jsx         # Display individual flights
        │   ├── SearchBar.jsx          # Flight search input
        │   ├── DestinationList.jsx    # Manage watched destinations
        │   ├── NotificationSettings.jsx # User notification preferences
        │   └── [other components]
        │
        ├── data/                      # Data files and constants
        │   ├── airports.json          # Airport codes and data
        │   └── [other data files]
        │
        ├── pages/                     # Page-level components
        │   ├── SearchPage.jsx         # Main search interface
        │   ├── DealsPage.jsx          # Featured deals view
        │   ├── SettingsPage.jsx       # User settings
        │   └── [other pages]
        │
        ├── lib/                       # Utility libraries
        │   ├── hooks.js               # Custom React hooks
        │   ├── formatters.js          # Data formatting helpers
        │   └── [other libraries]
        │
        ├── utils/                     # Utility functions
        │   ├── constants.js           # Application constants
        │   ├── validators.js          # Input validation
        │   └── [other utilities]
        │
        ├── App.jsx                    # Main App component & routing
        ├── main.jsx                   # React entry point
        └── index.css                  # Global styles
```

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayzcreative/Flight-Finder.git
   cd Flight-Finder
   ```

2. **Create and activate virtual environment**
   ```bash
   cd server
   python -m venv venv
   
   # On macOS/Linux
   source venv/bin/activate
   
   # On Windows
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   # SerpAPI Configuration
   SERPAPI_KEY=your_serpapi_api_key
   SERPAPI_ENDPOINT=https://serpapi.com/search

   # AviationStack Configuration
   AVIATIONSTACK_KEY=your_aviationstack_api_key
   AVIATIONSTACK_ENDPOINT=https://api.aviationstack.com/v1

   # Sheety Configuration
   SHEETY_TOKEN=your_sheety_basic_auth_token
   SHEETY_ENDPOINT=https://api.sheety.co/your-sheet-id/prices
   SHEETY_ENDPOINT_USERS=https://api.sheety.co/your-sheet-id/users

   # Email Configuration
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password

   # Origin Airport (IATA code)
   ORIGIN_AIRPORT=LHR
   ```

5. **Run the application**
   ```bash
   # Start the Flask API server
   python api.py
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The client will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## How It Works

### Flight Search Workflow
The backend integrates with SerpAPI and AviationStack to:
1. Fetch real-time flight availability and pricing via SerpAPI
2. Retrieve comprehensive airport information via AviationStack
3. Compare flight options and identify the cheapest fares
4. Update Google Sheets with price changes via Sheety
5. Send email notifications when prices drop below thresholds

### REST API (api.py)
Provides endpoints for:
- Fetching available flights
- Retrieving airport information
- Updating destination watches
- Managing user preferences
- Checking flight status

## Configuration

### API Keys Required

1. **SerpAPI** - Get from [serpapi.com](https://www.serpapi.com)
   - Provides flight search data
   - Free tier available for testing
   - Supports Google Flights data scraping

2. **AviationStack** - Get from [aviationstack.com](https://aviationstack.com)
   - Real-time flight data and airport information
   - Comprehensive flight database
   - Free tier available with limitations

3. **Sheety** - Get from [sheety.co](https://sheety.co)
   - Connects to your Google Sheet
   - Stores destinations and prices

4. **Gmail** - Use your Gmail account
   - Generate [App Password](https://myaccount.google.com/apppasswords) for SMTP

## Usage Examples

### Search Flights via API
```bash
curl http://localhost:5000/api/flights?destination=CDG&days=30
```

### Get Airport Information
```bash
curl http://localhost:5000/api/airports?code=CDG
```

### Watch Flight Prices
The frontend allows users to:
- Set up destination watches
- Define price thresholds
- Choose notification preferences
- View price history

## Customization

### Change Origin Airport
Update `ORIGIN_AIRPORT` in `.env`:
```env
ORIGIN_AIRPORT=JFK  # Instead of LHR
```

### Modify Notification Logic
Edit `server/src/notification_manager.py` to customize alerts

### Style the Frontend
Update CSS/components in `client/src/` for custom branding

## Security Notes

- ⚠️ **Never commit `.env` file** to version control
- Add `.env` to `.gitignore` (already done)
- Use strong API keys and tokens
- Rotate credentials periodically
- Don't share `.env` details in public repositories

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
```bash
# Ensure virtual environment is activated
pip install -r server/requirements.txt
```

### API connection errors
- Verify `.env` configuration is correct
- Check API credentials and endpoints
- Ensure internet connectivity
- Verify SerpAPI and AviationStack credentials are valid

### Frontend not connecting to backend
- Verify Flask API is running (`python server/api.py`)
- Check CORS configuration in `api.py`
- Confirm API URL matches in frontend code

## Development Workflow

1. **Backend development**: Edit files in `server/src/`
2. **Frontend development**: Edit files in `client/src/`
3. **Test changes locally** before committing
4. **Push to main** when ready for production

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Submit a pull request

## Future Enhancements

- [ ] Multi-origin airport support
- [ ] Advanced filtering (stops, airlines, duration)
- [ ] Price trend analytics
- [ ] Mobile app (React Native)
- [ ] Webhook integrations
- [ ] Dark mode UI
- [ ] User authentication system

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open a [GitHub Issue](https://github.com/jayzcreative/Flight-Finder/issues)
- Check [existing discussions](https://github.com/jayzcreative/Flight-Finder/discussions)

## Disclaimer

This project is for educational purposes. Flight prices and availability are subject to change. Always verify prices on official airline websites before booking.

---

Made with love by [jayzcreative](https://github.com/jayzcreative)
