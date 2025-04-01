# Installation Guide

This guide will walk you through the process of installing the Trading AI Agent Bot on your system.

## Prerequisites

Before installing the Trading AI Agent Bot, ensure you have the following prerequisites:

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For cloning the repository
- **Alpaca Account**: For trading and market data
- **Supabase Account**: For data storage and authentication
- **OpenAI API Key**: For LLM capabilities (or other LLM provider)

## Installation Methods

There are two ways to install the Trading AI Agent Bot:

1. [Clone from GitHub](#clone-from-github) (recommended for developers)
2. [Install from npm](#install-from-npm) (recommended for users)

### Clone from GitHub

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

4. Edit the `.env` file with your API keys and configuration.

5. Set up the database:
   ```bash
   npm run prepare-db
   ```

6. Start the application:
   ```bash
   npm start
   ```

### Install from npm

1. Install the package globally:
   ```bash
   npm install -g trading-ai-agent-bot
   ```

2. Create a configuration directory:
   ```bash
   mkdir -p ~/.trading-ai-bot
   cd ~/.trading-ai-bot
   ```

3. Create a `.env` file with the following content:
   ```
   # Environment
   NODE_ENV=production

   # Alpaca API
   ALPACA_API_KEY=your_alpaca_api_key
   ALPACA_API_SECRET=your_alpaca_api_secret
   ALPACA_PAPER_TRADING=true

   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Next.js Public Environment Variables
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # LLM Providers
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Web Interface
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   PORT=3000

   # Security
   API_KEY_ENCRYPTION_KEY=your_encryption_key_32_chars_long

   # Logging
   LOG_LEVEL=info
   ```

4. Replace the placeholder values with your actual API keys and configuration.

5. Start the application:
   ```bash
   trading-ai-bot
   ```

## Verifying the Installation

To verify that the Trading AI Agent Bot is installed correctly:

1. Start the web interface:
   ```bash
   npm run web
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. You should see the login page. If you haven't created an account yet, click on "Sign Up" to create one.

4. After logging in, you should see the dashboard.

## Next Steps

Now that you have installed the Trading AI Agent Bot, you can:

1. [Configure your environment](configuration.md)
2. [Set up your API keys](api-keys.md)
3. [Start using the web interface](../guides/web-interface.md) or [CLI](../guides/cli.md)

## Troubleshooting

If you encounter any issues during installation, check the [Common Issues](../troubleshooting/common-issues.md) page or [open an issue](https://github.com/yourusername/trading-ai-agent-bot/issues) on GitHub.