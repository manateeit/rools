import { useState, useEffect } from 'react';

const BacktestForm = ({ onSubmit, loading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState('momentum');
  const [symbols, setSymbols] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [parameters, setParameters] = useState({
    momentum: {
      lookbackPeriod: 14,
      overboughtThreshold: 70,
      oversoldThreshold: 30
    },
    meanReversion: {
      lookbackPeriod: 20,
      deviationThreshold: 2
    },
    trendFollowing: {
      shortPeriod: 9,
      longPeriod: 21
    },
    llmAssisted: {
      model: 'gpt-4',
      maxPositions: 5
    }
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Set default dates on component mount
  useEffect(() => {
    // Default to last 3 months
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    
    setEndDate(formatDate(end));
    setStartDate(formatDate(start));
  }, []);
  
  // Format date for input field (YYYY-MM-DD)
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Strategy descriptions
  const strategyDescriptions = {
    momentum: 'Uses RSI (Relative Strength Index) to identify overbought and oversold conditions.',
    meanReversion: 'Identifies when prices deviate significantly from their moving average and bets on a return to the mean.',
    trendFollowing: 'Uses moving average crossovers to identify and follow market trends.',
    llmAssisted: 'Leverages LLM models to analyze market data and make trading decisions.'
  };
  
  // Handle parameter change
  const handleParameterChange = (strategy, parameter, value) => {
    setParameters({
      ...parameters,
      [strategy]: {
        ...parameters[strategy],
        [parameter]: value
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      setSuccess(null);
      
      // Validate inputs
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      
      if (!symbols.trim()) {
        throw new Error('At least one symbol is required');
      }
      
      if (!startDate) {
        throw new Error('Start date is required');
      }
      
      if (!endDate) {
        throw new Error('End date is required');
      }
      
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('Start date must be before end date');
      }
      
      // Parse symbols
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      
      // Prepare backtest config
      const backtestConfig = {
        name,
        description,
        strategy,
        parameters: parameters[strategy],
        symbols: symbolList,
        startDate,
        endDate
      };
      
      // Submit backtest
      const result = await onSubmit(backtestConfig);
      
      // Show success message
      setSuccess(`Backtest "${result.name}" completed successfully`);
      
      // Reset form
      setName('');
      setDescription('');
      setSymbols('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error submitting backtest:', err);
      setError(err.message);
    }
  };
  
  // Render parameter inputs based on selected strategy
  const renderParameters = () => {
    switch (strategy) {
      case 'momentum':
        return (
          <>
            <div className="form-group">
              <label htmlFor="lookbackPeriod">Lookback Period</label>
              <input
                type="number"
                id="lookbackPeriod"
                className="form-control"
                value={parameters.momentum.lookbackPeriod}
                onChange={(e) => handleParameterChange('momentum', 'lookbackPeriod', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                disabled={loading}
              />
              <small className="form-text text-muted">Number of periods to calculate RSI</small>
            </div>
            <div className="form-group">
              <label htmlFor="overboughtThreshold">Overbought Threshold</label>
              <input
                type="number"
                id="overboughtThreshold"
                className="form-control"
                value={parameters.momentum.overboughtThreshold}
                onChange={(e) => handleParameterChange('momentum', 'overboughtThreshold', parseInt(e.target.value) || 0)}
                min="50"
                max="100"
                disabled={loading}
              />
              <small className="form-text text-muted">RSI level considered overbought</small>
            </div>
            <div className="form-group">
              <label htmlFor="oversoldThreshold">Oversold Threshold</label>
              <input
                type="number"
                id="oversoldThreshold"
                className="form-control"
                value={parameters.momentum.oversoldThreshold}
                onChange={(e) => handleParameterChange('momentum', 'oversoldThreshold', parseInt(e.target.value) || 0)}
                min="0"
                max="50"
                disabled={loading}
              />
              <small className="form-text text-muted">RSI level considered oversold</small>
            </div>
          </>
        );
        
      case 'meanReversion':
        return (
          <>
            <div className="form-group">
              <label htmlFor="lookbackPeriod">Lookback Period</label>
              <input
                type="number"
                id="lookbackPeriod"
                className="form-control"
                value={parameters.meanReversion.lookbackPeriod}
                onChange={(e) => handleParameterChange('meanReversion', 'lookbackPeriod', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                disabled={loading}
              />
              <small className="form-text text-muted">Number of periods for moving average</small>
            </div>
            <div className="form-group">
              <label htmlFor="deviationThreshold">Deviation Threshold</label>
              <input
                type="number"
                id="deviationThreshold"
                className="form-control"
                value={parameters.meanReversion.deviationThreshold}
                onChange={(e) => handleParameterChange('meanReversion', 'deviationThreshold', parseFloat(e.target.value) || 0)}
                min="0.1"
                max="5"
                step="0.1"
                disabled={loading}
              />
              <small className="form-text text-muted">Standard deviations from mean to trigger action</small>
            </div>
          </>
        );
        
      case 'trendFollowing':
        return (
          <>
            <div className="form-group">
              <label htmlFor="shortPeriod">Short Period</label>
              <input
                type="number"
                id="shortPeriod"
                className="form-control"
                value={parameters.trendFollowing.shortPeriod}
                onChange={(e) => handleParameterChange('trendFollowing', 'shortPeriod', parseInt(e.target.value) || 0)}
                min="1"
                max="50"
                disabled={loading}
              />
              <small className="form-text text-muted">Short-term moving average period</small>
            </div>
            <div className="form-group">
              <label htmlFor="longPeriod">Long Period</label>
              <input
                type="number"
                id="longPeriod"
                className="form-control"
                value={parameters.trendFollowing.longPeriod}
                onChange={(e) => handleParameterChange('trendFollowing', 'longPeriod', parseInt(e.target.value) || 0)}
                min="5"
                max="200"
                disabled={loading}
              />
              <small className="form-text text-muted">Long-term moving average period</small>
            </div>
          </>
        );
        
      case 'llmAssisted':
        return (
          <>
            <div className="form-group">
              <label htmlFor="model">LLM Model</label>
              <select
                id="model"
                className="form-control"
                value={parameters.llmAssisted.model}
                onChange={(e) => handleParameterChange('llmAssisted', 'model', e.target.value)}
                disabled={loading}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
              <small className="form-text text-muted">LLM model to use for analysis</small>
            </div>
            <div className="form-group">
              <label htmlFor="maxPositions">Max Positions</label>
              <input
                type="number"
                id="maxPositions"
                className="form-control"
                value={parameters.llmAssisted.maxPositions}
                onChange={(e) => handleParameterChange('llmAssisted', 'maxPositions', parseInt(e.target.value) || 0)}
                min="1"
                max="20"
                disabled={loading}
              />
              <small className="form-text text-muted">Maximum number of positions to hold</small>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="card backtest-form">
      <div className="card-header">
        Run Backtest
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Backtest name"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows="2"
              disabled={loading}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="symbols">Symbols</label>
            <input
              type="text"
              id="symbols"
              className="form-control"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              placeholder="AAPL, MSFT, GOOGL"
              required
              disabled={loading}
            />
            <small className="form-text text-muted">Comma-separated list of symbols</small>
          </div>
          
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group col-md-6">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="strategy">Strategy</label>
            <select
              id="strategy"
              className="form-control"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              disabled={loading}
            >
              <option value="momentum">Momentum (RSI)</option>
              <option value="meanReversion">Mean Reversion</option>
              <option value="trendFollowing">Trend Following</option>
              <option value="llmAssisted">LLM Assisted</option>
            </select>
          </div>
          
          <div className="strategy-description">
            {strategyDescriptions[strategy]}
          </div>
          
          <div className="strategy-parameters">
            <h6>Parameters</h6>
            {renderParameters()}
          </div>
          
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Running Backtest...' : 'Run Backtest'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .backtest-form {
          height: 100%;
        }
        
        .form-row {
          display: flex;
          margin: 0 -0.5rem;
        }
        
        .form-row > .form-group {
          padding: 0 0.5rem;
        }
        
        .strategy-description {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: var(--light-color);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
        }
        
        .strategy-parameters {
          margin-bottom: 1rem;
        }
        
        .strategy-parameters h6 {
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default BacktestForm;