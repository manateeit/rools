# Web Interface Guide

This guide provides an overview of the Trading AI Agent Bot web interface and explains how to use its various features.

## Getting Started

To access the web interface, start the application with:

```bash
npm run web
```

Then open your browser and navigate to `http://localhost:3000` (or the URL configured in your environment).

## Authentication

The web interface requires authentication to access. If you don't have an account yet, you can create one by clicking on the "Sign Up" button on the login page.

### Login

1. Enter your email address and password
2. Click "Login"

### Sign Up

1. Click "Sign Up" on the login page
2. Enter your email address and password
3. Click "Create Account"

### Reset Password

1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Click "Reset Password"
4. Check your email for a password reset link
5. Follow the link and enter a new password

## Dashboard

The dashboard is the main page of the web interface. It provides an overview of your trading activity and market information.

### Account Summary

The account summary section displays:

- Account value
- Cash balance
- Buying power
- Day trade count
- Account status

### Positions

The positions section shows your current positions:

- Symbol
- Quantity
- Entry price
- Current price
- Profit/loss
- Profit/loss percentage

### Recent Trades

The recent trades section displays your most recent trades:

- Symbol
- Side (buy/sell)
- Quantity
- Price
- Time
- Status

### Market Overview

The market overview section shows the current market status:

- Market indices (S&P 500, Nasdaq, Dow Jones)
- Market hours
- Top gainers and losers

### Performance Chart

The performance chart displays your account performance over time. You can adjust the time range using the buttons above the chart.

## Trading

The trading page allows you to execute trades and manage your trading strategies.

### Asset Selection

1. Use the search box to find assets by symbol or name
2. Select an asset from the list
3. View the asset details (price, volume, market cap, etc.)

### Order Form

1. Select the order type (market, limit, stop, stop limit)
2. Enter the quantity
3. Enter the price (for limit, stop, and stop limit orders)
4. Select the time in force (day, GTC, IOC, FOK)
5. Click "Buy" or "Sell" to place the order

### Strategy Selection

1. Select a trading strategy from the dropdown
2. Configure the strategy parameters
3. Click "Apply Strategy" to use the strategy for trading

### Market Data

The market data section displays:

- Price chart
- Volume chart
- Technical indicators
- Order book
- Recent trades

### Order Status

The order status section shows your open and recently filled orders:

- Symbol
- Side (buy/sell)
- Quantity
- Price
- Type
- Status
- Time

## Backtesting

The backtesting page allows you to test trading strategies against historical data.

### Backtest Form

1. Enter a name for the backtest
2. Select a trading strategy
3. Configure the strategy parameters
4. Select the symbols to include in the backtest
5. Set the start and end dates
6. Click "Run Backtest" to start the backtest

### Backtest Results

The backtest results section displays:

- Performance metrics (total return, Sharpe ratio, max drawdown, etc.)
- Equity curve
- Trade list
- Position history
- Performance by symbol

### Backtest History

The backtest history section shows your previous backtests:

- Name
- Strategy
- Symbols
- Date range
- Performance metrics
- Actions (view, delete)

## Settings

The settings page allows you to configure the Trading AI Agent Bot.

### User Settings

- Name
- Email
- Password
- Timezone
- Currency
- Dark mode

### API Keys

- Add, edit, and delete API keys for external services (Alpaca, OpenAI, etc.)
- View API key details (name, type, created date, last used)

### Notification Settings

- Configure email notifications
- Configure push notifications
- Set notification preferences for different events (trade executed, order filled, etc.)

### Model Settings

- Select the default LLM model
- Configure model parameters (temperature, max tokens, etc.)
- Enable or disable specific models

## Navigation

The navigation menu on the left side of the screen allows you to access different sections of the web interface:

- Dashboard
- Trading
- Backtesting
- Settings
- Logout

## Keyboard Shortcuts

The web interface supports the following keyboard shortcuts:

- `D`: Go to Dashboard
- `T`: Go to Trading
- `B`: Go to Backtesting
- `S`: Go to Settings
- `L`: Logout
- `?`: Show keyboard shortcuts

## Mobile Support

The web interface is responsive and works on mobile devices. The layout adjusts automatically to fit smaller screens.

## Troubleshooting

If you encounter any issues with the web interface, try the following:

1. Refresh the page
2. Clear your browser cache
3. Log out and log back in
4. Check your internet connection
5. Check the [Common Issues](../troubleshooting/common-issues.md) page

If the issue persists, please [open an issue](https://github.com/yourusername/trading-ai-agent-bot/issues) on GitHub.