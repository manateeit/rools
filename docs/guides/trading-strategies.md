# Trading Strategies Guide

This guide explains the trading strategies available in the Trading AI Agent Bot and how to use them effectively.

## Overview

The Trading AI Agent Bot supports several trading strategies, ranging from traditional algorithmic strategies to advanced AI-assisted strategies using Large Language Models (LLMs). Each strategy has its own parameters and is suitable for different market conditions.

## Available Strategies

### Momentum Strategy

The Momentum strategy is based on the Relative Strength Index (RSI), a momentum oscillator that measures the speed and change of price movements. It identifies overbought and oversold conditions in the market.

#### Parameters

- **Lookback Period**: Number of periods to calculate RSI (default: 14)
- **Overbought Threshold**: RSI level considered overbought (default: 70)
- **Oversold Threshold**: RSI level considered oversold (default: 30)

#### Trading Logic

- **Buy Signal**: When RSI falls below the oversold threshold
- **Sell Signal**: When RSI rises above the overbought threshold

#### Best Used When

- Markets are trending
- There are clear overbought and oversold conditions
- Price movements are volatile

#### Example

```bash
# CLI
trading-ai-bot strategy run momentum AAPL,MSFT,GOOGL --lookback 14 --overbought 70 --oversold 30

# Web Interface
1. Go to Trading page
2. Select "Momentum" from the Strategy dropdown
3. Set Lookback Period to 14
4. Set Overbought Threshold to 70
5. Set Oversold Threshold to 30
6. Click "Apply Strategy"
```

### Mean Reversion Strategy

The Mean Reversion strategy is based on the principle that prices tend to revert to their mean over time. It identifies when prices deviate significantly from their moving average and bets on a return to the mean.

#### Parameters

- **Lookback Period**: Number of periods for moving average (default: 20)
- **Deviation Threshold**: Standard deviations from mean to trigger action (default: 2)

#### Trading Logic

- **Buy Signal**: When price falls below the moving average by more than the deviation threshold
- **Sell Signal**: When price rises above the moving average by more than the deviation threshold

#### Best Used When

- Markets are range-bound
- There are no strong trends
- Price movements are mean-reverting

#### Example

```bash
# CLI
trading-ai-bot strategy run mean-reversion AAPL,MSFT,GOOGL --lookback 20 --deviation 2

# Web Interface
1. Go to Trading page
2. Select "Mean Reversion" from the Strategy dropdown
3. Set Lookback Period to 20
4. Set Deviation Threshold to 2
5. Click "Apply Strategy"
```

### Trend Following Strategy

The Trend Following strategy uses moving average crossovers to identify and follow market trends. It generates signals when a short-term moving average crosses a long-term moving average.

#### Parameters

- **Short Period**: Short-term moving average period (default: 9)
- **Long Period**: Long-term moving average period (default: 21)

#### Trading Logic

- **Buy Signal**: When the short-term moving average crosses above the long-term moving average
- **Sell Signal**: When the short-term moving average crosses below the long-term moving average

#### Best Used When

- Markets are trending strongly
- There are clear directional movements
- Price movements are sustained

#### Example

```bash
# CLI
trading-ai-bot strategy run trend-following AAPL,MSFT,GOOGL --short 9 --long 21

# Web Interface
1. Go to Trading page
2. Select "Trend Following" from the Strategy dropdown
3. Set Short Period to 9
4. Set Long Period to 21
5. Click "Apply Strategy"
```

### LLM-Assisted Strategy

The LLM-Assisted strategy leverages Large Language Models to analyze market data and make trading decisions. It combines traditional technical analysis with natural language processing to generate trading signals.

#### Parameters

- **Model**: LLM model to use (default: gpt-4)
- **Max Positions**: Maximum number of positions to hold (default: 5)

#### Trading Logic

The LLM-Assisted strategy follows these steps:

1. Gather market data for the specified symbols
2. Prepare a prompt for the LLM with the market data
3. Send the prompt to the LLM and receive a response
4. Parse the response to extract trading recommendations
5. Execute trades based on the recommendations

#### Best Used When

- Markets are complex and require nuanced analysis
- Multiple factors need to be considered
- Traditional strategies are not performing well

#### Example

```bash
# CLI
trading-ai-bot strategy run llm-assisted AAPL,MSFT,GOOGL --model gpt-4 --max-positions 5

# Web Interface
1. Go to Trading page
2. Select "LLM Assisted" from the Strategy dropdown
3. Set Model to "GPT-4"
4. Set Max Positions to 5
5. Click "Apply Strategy"
```

## Creating Custom Strategies

You can create custom strategies by extending the base Strategy class. Here's an example of a simple custom strategy:

```javascript
// custom-strategy.js
const { Strategy } = require('trading-ai-agent-bot');

class CustomStrategy extends Strategy {
  constructor(params = {}) {
    super({
      name: 'Custom Strategy',
      description: 'A custom trading strategy',
      parameters: {
        threshold: params.threshold || 0.5
      }
    });
  }

  async analyze(symbol, marketData) {
    // Implement your analysis logic here
    const latestPrice = marketData[marketData.length - 1].close;
    const previousPrice = marketData[marketData.length - 2].close;
    const priceChange = (latestPrice - previousPrice) / previousPrice;

    if (priceChange > this.parameters.threshold) {
      return {
        symbol,
        action: 'buy',
        confidence: 0.8,
        reason: `Price increased by ${(priceChange * 100).toFixed(2)}%, which is above the threshold of ${(this.parameters.threshold * 100).toFixed(2)}%`
      };
    } else if (priceChange < -this.parameters.threshold) {
      return {
        symbol,
        action: 'sell',
        confidence: 0.8,
        reason: `Price decreased by ${(Math.abs(priceChange) * 100).toFixed(2)}%, which is below the negative threshold of ${(this.parameters.threshold * 100).toFixed(2)}%`
      };
    } else {
      return {
        symbol,
        action: 'hold',
        confidence: 0.5,
        reason: `Price change of ${(priceChange * 100).toFixed(2)}% is within the threshold of ±${(this.parameters.threshold * 100).toFixed(2)}%`
      };
    }
  }
}

module.exports = CustomStrategy;
```

To use your custom strategy:

```javascript
// Register the custom strategy
const { registerStrategy } = require('trading-ai-agent-bot');
const CustomStrategy = require('./custom-strategy');

registerStrategy('custom', CustomStrategy);

// Use the custom strategy
const tradingEngine = require('trading-ai-agent-bot').tradingEngine;
tradingEngine.runStrategy('custom', ['AAPL', 'MSFT', 'GOOGL'], { threshold: 0.02 });
```

## Strategy Performance

You can evaluate the performance of different strategies using the backtesting feature. This allows you to test strategies against historical data and compare their results.

To backtest a strategy:

```bash
# CLI
trading-ai-bot backtest run "Strategy Test" AAPL,MSFT,GOOGL --strategy momentum --start 2025-01-01 --end 2025-03-31

# Web Interface
1. Go to Backtesting page
2. Enter a name for the backtest
3. Select a strategy
4. Configure the strategy parameters
5. Select the symbols to include
6. Set the start and end dates
7. Click "Run Backtest"
```

## Strategy Combinations

You can combine multiple strategies to create a more robust trading system. The Trading AI Agent Bot supports strategy combinations through the Strategy Combiner.

Example:

```javascript
const { StrategyCombiner } = require('trading-ai-agent-bot');
const { MomentumStrategy, MeanReversionStrategy } = require('trading-ai-agent-bot/strategies');

// Create individual strategies
const momentum = new MomentumStrategy({ lookbackPeriod: 14, overboughtThreshold: 70, oversoldThreshold: 30 });
const meanReversion = new MeanReversionStrategy({ lookbackPeriod: 20, deviationThreshold: 2 });

// Create a strategy combiner
const combiner = new StrategyCombiner({
  strategies: [momentum, meanReversion],
  weights: [0.6, 0.4], // 60% weight to momentum, 40% to mean reversion
  combinationMethod: 'weighted' // 'weighted', 'majority', or 'unanimous'
});

// Use the combined strategy
const tradingEngine = require('trading-ai-agent-bot').tradingEngine;
tradingEngine.runStrategy(combiner, ['AAPL', 'MSFT', 'GOOGL']);
```

## Best Practices

Here are some best practices for using trading strategies effectively:

1. **Backtest First**: Always backtest a strategy before using it with real money
2. **Start Small**: Begin with small position sizes when using a new strategy
3. **Monitor Performance**: Regularly review the performance of your strategies
4. **Adjust Parameters**: Fine-tune strategy parameters based on performance
5. **Diversify**: Use multiple strategies across different assets
6. **Consider Market Conditions**: Different strategies work better in different market conditions
7. **Use Stop Losses**: Implement stop losses to limit potential losses
8. **Be Patient**: Give strategies time to work; avoid frequent changes

## Next Steps

Now that you understand the available trading strategies, you can:

1. [Learn about backtesting](backtesting.md)
2. [Set up paper trading](paper-trading.md)
3. [Configure LLM integration](llm-integration.md)