# Configuration Guide

This guide explains how to configure the Trading AI Agent Bot to suit your needs.

## Environment Variables

The Trading AI Agent Bot uses environment variables for configuration. These can be set in a `.env` file in the root directory of the project or in your system environment.

### Required Environment Variables

The following environment variables are required for the Trading AI Agent Bot to function properly:

| Variable | Description | Example |
|----------|-------------|---------|
| `ALPACA_API_KEY` | Your Alpaca API key | `AKXXXXXXXXXXXXXXXXXXX` |
| `ALPACA_API_SECRET` | Your Alpaca API secret | `ASXXXXXXXXXXXXXXXXXXX` |
| `SUPABASE_URL` | Your Supabase URL | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | `eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL (for client-side) | `https://xxxxxxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key (for client-side) | `eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `API_KEY_ENCRYPTION_KEY` | Key for encrypting API keys (32 characters) | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

### Optional Environment Variables

The following environment variables are optional and can be used to customize the behavior of the Trading AI Agent Bot:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment (development, production) | `development` | `production` |
| `ALPACA_PAPER_TRADING` | Whether to use paper trading | `true` | `false` |
| `OPENAI_API_KEY` | Your OpenAI API key | - | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_API_URL` | URL for the API | `http://localhost:3000/api` | `https://yourdomain.com/api` |
| `PORT` | Port for the web server | `3000` | `8080` |
| `LOG_LEVEL` | Logging level | `info` | `debug` |

## Configuration Files

In addition to environment variables, the Trading AI Agent Bot uses configuration files for more complex settings.

### Trading Strategies Configuration

The trading strategies configuration file is located at `config/strategies.json`. This file defines the available trading strategies and their parameters.

Example:
```json
{
  "strategies": {
    "momentum": {
      "name": "Momentum",
      "description": "Uses RSI (Relative Strength Index) to identify overbought and oversold conditions.",
      "parameters": {
        "lookbackPeriod": {
          "type": "number",
          "default": 14,
          "min": 1,
          "max": 100,
          "description": "Number of periods to calculate RSI"
        },
        "overboughtThreshold": {
          "type": "number",
          "default": 70,
          "min": 50,
          "max": 100,
          "description": "RSI level considered overbought"
        },
        "oversoldThreshold": {
          "type": "number",
          "default": 30,
          "min": 0,
          "max": 50,
          "description": "RSI level considered oversold"
        }
      }
    },
    "meanReversion": {
      "name": "Mean Reversion",
      "description": "Identifies when prices deviate significantly from their moving average and bets on a return to the mean.",
      "parameters": {
        "lookbackPeriod": {
          "type": "number",
          "default": 20,
          "min": 1,
          "max": 100,
          "description": "Number of periods for moving average"
        },
        "deviationThreshold": {
          "type": "number",
          "default": 2,
          "min": 0.1,
          "max": 5,
          "description": "Standard deviations from mean to trigger action"
        }
      }
    }
  }
}
```

### LLM Models Configuration

The LLM models configuration file is located at `config/llm-models.json`. This file defines the available LLM models and their parameters.

Example:
```json
{
  "models": {
    "gpt-4": {
      "provider": "openai",
      "name": "GPT-4",
      "description": "OpenAI's most advanced model, GPT-4, with improved reasoning capabilities.",
      "parameters": {
        "temperature": {
          "type": "number",
          "default": 0.7,
          "min": 0,
          "max": 1,
          "description": "Controls randomness: Lower values are more deterministic, higher values are more creative"
        },
        "maxTokens": {
          "type": "number",
          "default": 2000,
          "min": 500,
          "max": 4000,
          "description": "Maximum number of tokens to generate in the response"
        },
        "topP": {
          "type": "number",
          "default": 1.0,
          "min": 0.1,
          "max": 1,
          "description": "Controls diversity via nucleus sampling"
        }
      }
    },
    "gpt-3.5-turbo": {
      "provider": "openai",
      "name": "GPT-3.5 Turbo",
      "description": "OpenAI's GPT-3.5 Turbo model, offering a good balance of performance and cost.",
      "parameters": {
        "temperature": {
          "type": "number",
          "default": 0.8,
          "min": 0,
          "max": 1,
          "description": "Controls randomness: Lower values are more deterministic, higher values are more creative"
        },
        "maxTokens": {
          "type": "number",
          "default": 1500,
          "min": 500,
          "max": 4000,
          "description": "Maximum number of tokens to generate in the response"
        },
        "topP": {
          "type": "number",
          "default": 1.0,
          "min": 0.1,
          "max": 1,
          "description": "Controls diversity via nucleus sampling"
        }
      }
    }
  }
}
```

## Web Interface Configuration

The web interface can be configured using the settings page in the application. This allows you to customize:

- User preferences (timezone, currency, dark mode)
- API keys for external services
- Notification settings
- LLM model settings

## CLI Configuration

The CLI interface can be configured using command-line arguments or a configuration file located at `~/.trading-ai-bot/config.json`.

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

## Next Steps

Now that you have configured the Trading AI Agent Bot, you can:

1. [Set up your API keys](api-keys.md)
2. [Start using the web interface](../guides/web-interface.md) or [CLI](../guides/cli.md)