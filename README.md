# Cricket Analytics Dashboard

A comprehensive cricket analytics web application that provides player statistics, rankings, and match outcome predictions using machine learning models.

## Features

1. **Player Stats**
   - Team player performance analysis
   - Best player prediction in specific venues
   - Best bowler and batsman analysis

2. **Top 10 Rankings**
   - Top 10 batsmen with detailed statistics
   - Top 10 bowlers with performance metrics
   - Top 10 all-rounders based on combined performance

3. **Match Outcome**
   - Player performance prediction
   - Match outcome prediction
   - Toss prediction and win ratio analysis

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cricket-analytics
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   Open your web browser and navigate to `http://localhost:5000`

## Data Processing

The application uses two datasets:
- Raw data: Original match and player statistics
- Processed data: Cleaned and transformed data for analysis

## Machine Learning Models

The application uses:
- Random Forest for player performance prediction
- XGBoost for match outcome prediction
- Regression techniques for statistical analysis

## Project Structure

```
cricket-analytics/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── static/                 # Static files
│   ├── css/
│   │   └── style.css      # Stylesheet
│   └── js/
│       ├── main.js        # Common JavaScript functions
│       ├── player_stats.js
│       ├── rankings.js
│       └── match_outcome.js
├── templates/             # HTML templates
│   ├── home.html
│   ├── player_stats.html
│   ├── rankings.html
│   └── match_outcome.html
└── datasets/              # Data files
    ├── raw/              # Raw data
    └── processed/        # Processed data
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 