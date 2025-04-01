# Trading AI Agent Bot

An AI-powered trading bot that uses Large Language Models (LLMs) to analyze market data and execute trades through the Alpaca API.

## Features

- **AI-Assisted Trading**: Leverage LLMs to analyze market data and make trading decisions
- **Multiple Trading Strategies**: Choose from momentum, mean reversion, trend following, and LLM-assisted strategies
- **Paper Trading**: Practice trading without risking real money
- **Backtesting**: Test strategies against historical data
- **Web Interface**: User-friendly dashboard for monitoring and managing trades
- **CLI Interface**: Command-line interface for advanced users
- **API Integration**: Connect with Alpaca for market data and trade execution

## Architecture

The Trading AI Agent Bot is built with a modular architecture:

- **Core Trading Engine**: Orchestrates trading activities
- **Alpaca API Client**: Handles market data and trade execution
- **LLM Integration Layer**: Connects to various LLM providers
- **Supabase Storage Layer**: Manages data persistence
- **CLI Interface**: Provides command-line interaction
- **Web Interface**: Offers a user-friendly dashboard

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Alpaca API account
- Supabase account
- OpenAI API key (or other LLM provider)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trading-ai-agent-bot.git
   cd trading-ai-agent-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in the environment variables in the `.env` file:
   - Alpaca API credentials
   - Supabase credentials
   - LLM API keys
   - Other configuration options

## Usage

### Web Interface

1. Start the web server:
   ```bash
   npm run web
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Log in with your credentials

4. Use the dashboard to monitor and manage your trading activities

### CLI Interface

1. Start the CLI:
   ```bash
   npm run cli
   ```

2. Use the available commands to interact with the trading bot:
   ```bash
   # Get help
   help

   # Get account information
   account

   # Get market data
   market-data AAPL

   # Place an order
   order buy AAPL 10

   # Run a backtest
   backtest momentum AAPL,MSFT,GOOGL
   ```

## Deployment

### Vercel Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### GitHub Actions CI/CD

The repository includes a GitHub Actions workflow for CI/CD:

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

2. Push to the `development` branch to deploy to the development environment

3. Push to the `main` branch to deploy to the production environment

## Environment Variables

The following environment variables are required:

- `NODE_ENV`: Environment (development, production)
- `ALPACA_API_KEY`: Your Alpaca API key
- `ALPACA_API_SECRET`: Your Alpaca API secret
- `ALPACA_PAPER_TRADING`: Whether to use paper trading (true/false)
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL (for client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (for client-side)
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_API_URL`: URL for the API
- `PORT`: Port for the web server
- `API_KEY_ENCRYPTION_KEY`: Key for encrypting API keys

## License

This project is licensed under the MIT License - see the LICENSE file for details.