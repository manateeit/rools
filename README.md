# Trading AI Agent Bot

A sophisticated trading bot that leverages Large Language Models (LLMs) to make trading decisions for US stocks and ETFs using the Alpaca API.

## Overview

The Trading AI Agent Bot is designed to:

- Use configurable LLM models to analyze market data and make trading decisions
- Connect to the Alpaca API for executing trades
- Support paper trading for risk-free testing
- Provide backtesting capabilities to evaluate strategies
- Allow users to select which assets to trade
- Offer both CLI and web interfaces for different user needs

## Key Features

- **Pluggable LLM Architecture**: Support for multiple LLM models with the ability to switch between them
- **Alpaca API Integration**: Seamless connection to Alpaca for market data and trade execution
- **Paper Trading**: Risk-free trading simulation
- **Backtesting**: Evaluate strategies against historical data with key performance metrics
- **Asset Selection**: Choose which stocks and ETFs to trade
- **Dual Interface**: Both command-line and web dashboard interfaces
- **Configurable Trading Frequency**: AI-assisted determination of optimal trading times
- **Enhanced Security**: Encryption for API keys and role-based access control

## Architecture

The system is built with a modular architecture consisting of:

1. **User Interfaces**: CLI and web dashboard
2. **Core Trading Engine**: Central orchestration of trading activities
3. **LLM Integration Layer**: Pluggable architecture for multiple LLM models
4. **Alpaca API Client**: Communication with Alpaca for trading and market data
5. **Backtesting Engine**: Simulation and evaluation of trading strategies
6. **Data Storage Layer**: Persistence of trading data and configurations

## Technology Stack

- **Frontend**: Next.js (React framework)
- **Backend**: Node.js with serverless functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **LLM Integration**: Support for various LLM providers
- **Trading API**: Alpaca API

## Getting Started

### Prerequisites

- Node.js (v16+)
- Alpaca API account
- Supabase account
- Vercel account (for deployment)
- Access to LLM APIs (OpenAI, etc.)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/tradingViewAIBot.git
   cd tradingViewAIBot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API keys and configuration.

4. Run the development server:
   ```
   npm run dev
   ```

### Configuration

The bot can be configured through:

- Environment variables for sensitive information
- Configuration files for general settings
- Web interface for user-specific settings
- CLI commands for quick adjustments

## Documentation

Detailed documentation is available in the `memory-bank` directory:

- [Product Context](memory-bank/productContext.md): Project overview and goals
- [Architecture](memory-bank/architecture.md): System design and component interactions
- [Component Specifications](memory-bank/component-specifications.md): Detailed component information
- [Development Roadmap](memory-bank/development-roadmap.md): Implementation plan and timeline

## Development Status

This project is currently in the architecture and planning phase. See the [Progress Tracker](memory-bank/progress.md) for current status.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is for educational and informational purposes only. Trading involves risk, and past performance is not indicative of future results. Use at your own risk.