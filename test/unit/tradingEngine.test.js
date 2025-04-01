const { describe, test, expect, beforeEach, afterEach, jest } = require('@jest/globals');

/**
 * Unit tests for the Trading Engine
 * 
 * These tests verify that the Trading Engine works correctly:
 * - Executes buy and sell orders
 * - Executes trading strategies
 * - Manages positions
 */
describe('TradingEngine', () => {
  // Mock dependencies
  const mockAlpacaClient = {
    getAccount: jest.fn(),
    getPositions: jest.fn(),
    createOrder: jest.fn(),
    getMarketData: jest.fn()
  };
  
  // Import the TradingEngine after mocking dependencies
  jest.mock('../../src/alpaca/client', () => ({
    AlpacaClient: jest.fn().mockImplementation(() => mockAlpacaClient)
  }));
  
  const { TradingEngine } = require('../../src/core/tradingEngine');
  
  let tradingEngine;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    tradingEngine = new TradingEngine(mockAlpacaClient);
  });
  
  test('should execute a buy order', async () => {
    // Setup
    const orderParams = {
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      type: 'market',
      time_in_force: 'day'
    };
    
    mockAlpacaClient.createOrder.mockResolvedValue({
      id: 'order123',
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      type: 'market',
      status: 'filled'
    });
    
    // Execute
    const result = await tradingEngine.executeOrder('buy', 'AAPL', 10, 'market');
    
    // Verify
    expect(mockAlpacaClient.createOrder).toHaveBeenCalledWith(orderParams);
    expect(result).toEqual({
      id: 'order123',
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      type: 'market',
      status: 'filled'
    });
  });
  
  test('should execute a sell order with limit price', async () => {
    // Setup
    const orderParams = {
      symbol: 'MSFT',
      qty: 5,
      side: 'sell',
      type: 'limit',
      limit_price: 300.50,
      time_in_force: 'day'
    };
    
    mockAlpacaClient.createOrder.mockResolvedValue({
      id: 'order456',
      symbol: 'MSFT',
      qty: 5,
      side: 'sell',
      type: 'limit',
      limit_price: 300.50,
      status: 'new'
    });
    
    // Execute
    const result = await tradingEngine.executeOrder('sell', 'MSFT', 5, 'limit', 300.50);
    
    // Verify
    expect(mockAlpacaClient.createOrder).toHaveBeenCalledWith(orderParams);
    expect(result).toEqual({
      id: 'order456',
      symbol: 'MSFT',
      qty: 5,
      side: 'sell',
      type: 'limit',
      limit_price: 300.50,
      status: 'new'
    });
  });
  
  test('should execute a strategy', async () => {
    // Setup
    const mockStrategy = {
      analyze: jest.fn().mockResolvedValue({
        symbol: 'AAPL',
        action: 'buy',
        quantity: 10,
        reason: 'Strong momentum'
      })
    };
    
    mockAlpacaClient.createOrder.mockResolvedValue({
      id: 'order789',
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      type: 'market',
      status: 'filled'
    });
    
    mockAlpacaClient.getMarketData.mockResolvedValue({
      'AAPL': [
        {
          t: new Date(),
          o: 150,
          h: 155,
          l: 149,
          c: 153,
          v: 1000000
        }
      ]
    });
    
    // Execute
    const result = await tradingEngine.executeStrategy(mockStrategy, 'AAPL');
    
    // Verify
    expect(mockStrategy.analyze).toHaveBeenCalledWith('AAPL', expect.any(Array));
    expect(mockAlpacaClient.createOrder).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'order789',
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      type: 'market',
      status: 'filled'
    });
  });
  
  test('should get account information', async () => {
    // Setup
    mockAlpacaClient.getAccount.mockResolvedValue({
      id: 'account123',
      cash: '10000',
      buying_power: '20000',
      status: 'ACTIVE'
    });
    
    // Execute
    const result = await tradingEngine.getAccountInfo();
    
    // Verify
    expect(mockAlpacaClient.getAccount).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'account123',
      cash: '10000',
      buying_power: '20000',
      status: 'ACTIVE'
    });
  });
  
  test('should get positions', async () => {
    // Setup
    mockAlpacaClient.getPositions.mockResolvedValue([
      {
        symbol: 'AAPL',
        qty: 10,
        avg_entry_price: 150,
        current_price: 155,
        market_value: 1550,
        unrealized_pl: 50,
        unrealized_plpc: 0.033
      }
    ]);
    
    // Execute
    const result = await tradingEngine.getPositions();
    
    // Verify
    expect(mockAlpacaClient.getPositions).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe('AAPL');
  });
  
  test('should handle errors when executing orders', async () => {
    // Setup
    mockAlpacaClient.createOrder.mockRejectedValue(new Error('Insufficient funds'));
    
    // Execute and verify
    await expect(tradingEngine.executeOrder('buy', 'AAPL', 10, 'market'))
      .rejects.toThrow('Insufficient funds');
  });
});