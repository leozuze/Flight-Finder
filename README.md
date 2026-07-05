# Flight Finder 🛫

A full-stack flight deal tracker that searches for cheap flights and notifies users via SMS/email. Built with Python backend and React frontend, powered by SerpAPI & AviationStack APIs.

![Python](https://img.shields.io/badge/Python-91.6%25-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-React-yellow)
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
│   ├── main.py                        # Main flight search workflow
│   ├── api.py                         # Flask REST API endpoints
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Environment variables (⚠️ keep secret)
│   │
│   ├── src/                           # Source modules
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
        ├── components/                # Reusable UI components
        ├── pages/                     # Page components
        ├── hooks/                     # Custom React hooks
        ├── utils/                     # Utility functions
        ├── App.jsx                    # Main App component
        └── main.jsx                   # React entry point
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
   # Run the main flight search workflow
   python main.py
   
   # Or start the Flask API server
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

### Flight Search Workflow (main.py)
1. Reads destination and price threshold data from Sheety
2. Searches for flights from your origin (e.g., LHR) to each destination
3. Identifies the cheapest available option
4. If fare is lower than the saved threshold:
   - Updates the sheet with the new price
   - Sends a notification to subscribed users

### REST API (api.py)
Provides endpoints for:
- Fetching available flights
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
