# CLI Guide

This guide provides an overview of the Trading AI Agent Bot command-line interface (CLI) and explains how to use its various commands.

## Getting Started

To use the CLI, you can either:

1. Run it directly from the project directory:
   ```bash
   npm run cli
   ```

2. Use the globally installed command (if installed globally):
   ```bash
   trading-ai-bot
   ```

## Authentication

The CLI requires authentication to access your trading account. You can authenticate using your API keys or by logging in with your email and password.

### API Key Authentication

To authenticate using API keys, set the following environment variables:

```bash
export ALPACA_API_KEY=your_alpaca_api_key
export ALPACA_API_SECRET=your_alpaca_api_secret
```

Or include them in your `.env` file.

### Email Authentication

To authenticate using your email and password:

```bash
trading-ai-bot login
```

You will be prompted to enter your email and password.

## Command Structure

The CLI uses a command-based structure. The general syntax is:

```bash
trading-ai-bot [command] [subcommand] [options]
```

You can get help for any command by adding `--help` or `-h`:

```bash
trading-ai-bot --help
trading-ai-bot account --help
```

## Available Commands

### General Commands

- `help`: Display help information
- `version`: Display the version of the Trading AI Agent Bot
- `login`: Log in to your account
- `logout`: Log out of your account

### Account Commands

- `account`: Display account information
- `account balance`: Display account balance
- `account status`: Display account status
- `account history`: Display account history

Example:
```bash
trading-ai-bot account
```

Output:
```
Account Information:
ID: ABCDEFG
Status: ACTIVE
Cash: $10,000.00
Portfolio Value: $15,000.00
Buying Power: $20,000.00
Daytrade Count: 0
Pattern Day Trader: false
Trading Blocked: false
Account Blocked: false
Created At: 2025-01-01T00:00:00Z
```

### Market Commands

- `market`: Display market information
- `market hours`: Display market hours
- `market calendar`: Display market calendar
- `market data [symbol]`: Display market data for a symbol
- `market search [query]`: Search for symbols

Example:
```bash
trading-ai-bot market data AAPL
```

Output:
```
Market Data for AAPL:
Price: $150.00
Change: +$2.50 (+1.69%)
Volume: 100,000,000
Open: $148.00
High: $151.00
Low: $147.50
Close: $150.00
```

### Trading Commands

- `trade`: Enter interactive trading mode
- `trade buy [symbol] [quantity] [options]`: Buy an asset
- `trade sell [symbol] [quantity] [options]`: Sell an asset
- `trade cancel [order_id]`: Cancel an order
- `trade list`: List open orders
- `trade history`: List order history

Example:
```bash
trading-ai-bot trade buy AAPL 10 --type market
```

Output:
```
Order placed successfully:
ID: 12345678-abcd-1234-abcd-123456789abc
Symbol: AAPL
Side: buy
Quantity: 10
Type: market
Status: filled
Filled Price: $150.00
Filled At: 2025-03-31T15:30:00Z
```

### Position Commands

- `position`: List positions
- `position [symbol]`: Display position details
- `position close [symbol]`: Close a position
- `position close-all`: Close all positions

Example:
```bash
trading-ai-bot position
```

Output:
```
Positions:
Symbol  Quantity  Entry Price  Current Price  P&L      P&L %
AAPL    10        $148.00      $150.00        +$20.00  +1.35%
MSFT    5         $300.00      $305.00        +$25.00  +1.67%
GOOGL   2         $2,500.00    $2,550.00      +$100.00 +2.00%
```

### Strategy Commands

- `strategy`: List available strategies
- `strategy [name]`: Display strategy details
- `strategy run [name] [symbols] [options]`: Run a strategy
- `strategy backtest [name] [symbols] [options]`: Backtest a strategy

Example:
```bash
trading-ai-bot strategy run momentum AAPL,MSFT,GOOGL --lookback 14
```

Output:
```
Running momentum strategy on AAPL, MSFT, GOOGL...
Analysis complete.

Recommendations:
AAPL: BUY (RSI: 28.5)
MSFT: HOLD (RSI: 45.2)
GOOGL: SELL (RSI: 72.1)

Execute trades? [y/N]: 
```

### Backtest Commands

- `backtest`: List backtests
- `backtest run [name] [symbols] [options]`: Run a backtest
- `backtest show [id]`: Display backtest results
- `backtest delete [id]`: Delete a backtest

Example:
```bash
trading-ai-bot backtest run "Momentum Test" AAPL,MSFT,GOOGL --strategy momentum --start 2025-01-01 --end 2025-03-31
```

Output:
```
Running backtest "Momentum Test" on AAPL, MSFT, GOOGL...
Backtest complete.

Results:
Total Return: +15.2%
Annualized Return: +76.5%
Sharpe Ratio: 1.8
Max Drawdown: -5.3%
Win Rate: 68.4%
Trade Count: 38

Detailed results saved to: ./backtests/momentum-test-2025-03-31.json
```

### LLM Commands

- `llm`: List available LLM models
- `llm [model]`: Display model details
- `llm analyze [symbol] [options]`: Analyze a symbol using LLM
- `llm generate [prompt] [options]`: Generate text using LLM

Example:
```bash
trading-ai-bot llm analyze AAPL --model gpt-4
```

Output:
```
Analyzing AAPL using GPT-4...
Analysis complete.

Apple Inc. (AAPL) Analysis:
- Strong financial position with $200B+ in cash reserves
- Recent product launches (Vision Pro, iPhone 15) performing well
- Services revenue growing at 20% YoY
- Potential headwinds from regulatory scrutiny in EU and US
- Technical indicators suggest moderate bullish sentiment
- RSI at 58, indicating room for growth without being overbought
- Support at $145, resistance at $155

Recommendation: MODERATE BUY
Target Price: $165 (3-month horizon)
Risk Level: Low
```

### Configuration Commands

- `config`: Display configuration
- `config set [key] [value]`: Set configuration value
- `config get [key]`: Get configuration value
- `config reset`: Reset configuration to defaults

Example:
```bash
trading-ai-bot config set defaultStrategy momentum
```

Output:
```
Configuration updated:
defaultStrategy: momentum
```

## Interactive Mode

The CLI supports an interactive mode that provides a more user-friendly interface. To enter interactive mode:

```bash
trading-ai-bot interactive
```

In interactive mode, you can use the arrow keys to navigate menus and select options.

## Scripting

The CLI can be used in scripts by using the `--json` flag to output results in JSON format:

```bash
trading-ai-bot account --json > account.json
```

You can also use the `--quiet` flag to suppress all output except errors:

```bash
trading-ai-bot trade buy AAPL 10 --type market --quiet
```

## Environment Variables

The CLI respects the following environment variables:

- `ALPACA_API_KEY`: Your Alpaca API key
- `ALPACA_API_SECRET`: Your Alpaca API secret
- `ALPACA_PAPER_TRADING`: Whether to use paper trading (true/false)
- `OPENAI_API_KEY`: Your OpenAI API key
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Configuration File

The CLI uses a configuration file located at `~/.trading-ai-bot/config.json`. You can edit this file directly or use the `config` commands.

Example configuration file:
```json
{
  "defaultStrategy": "momentum",
  "defaultSymbols": ["AAPL", "MSFT", "GOOGL"],
  "defaultTimeframe": "1D",
  "defaultLookbackPeriod": 30,
  "defaultModel": "gpt-4"
}
```

## Troubleshooting

If you encounter any issues with the CLI, try the following:

1. Check your API keys
2. Ensure you have an internet connection
3. Check the logs in `~/.trading-ai-bot/logs`
4. Run the command with the `--debug` flag for more information
5. Check the [Common Issues](../troubleshooting/common-issues.md) page

If the issue persists, please [open an issue](https://github.com/yourusername/trading-ai-agent-bot/issues) on GitHub.