import { useState } from 'react';

const StrategySelector = ({ onExecute, selectedAsset, disabled }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('momentum');
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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
  
  // Handle strategy execution
  const handleExecute = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (!selectedAsset) {
        throw new Error('Please select an asset');
      }
      
      // Prepare strategy data
      const strategyData = {
        name: selectedStrategy,
        description: strategyDescriptions[selectedStrategy],
        parameters: parameters[selectedStrategy]
      };
      
      // Execute strategy
      const result = await onExecute(strategyData);
      
      // Show success message
      const actionCount = result.filter(r => r.decision.action !== 'hold').length;
      setSuccess(`Strategy executed successfully: ${actionCount} action(s) taken`);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error executing strategy:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Render parameter inputs based on selected strategy
  const renderParameters = () => {
    switch (selectedStrategy) {
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
                disabled={disabled || loading}
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
    <div className="card strategy-selector">
      <div className="card-header">
        Trading Strategy
      </div>
      <div className="card-body">
        {!selectedAsset ? (
          <div className="no-asset-selected">
            <p>Please select an asset to trade</p>
          </div>
        ) : (
          <>
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
              <label htmlFor="strategy">Strategy</label>
              <select
                id="strategy"
                className="form-control"
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                disabled={disabled || loading}
              >
                <option value="momentum">Momentum (RSI)</option>
                <option value="meanReversion">Mean Reversion</option>
                <option value="trendFollowing">Trend Following</option>
                <option value="llmAssisted">LLM Assisted</option>
              </select>
            </div>
            
            <div className="strategy-description">
              {strategyDescriptions[selectedStrategy]}
            </div>
            
            <div className="strategy-parameters">
              <h6>Parameters</h6>
              {renderParameters()}
            </div>
            
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleExecute}
                disabled={disabled || loading}
              >
                {loading ? 'Executing Strategy...' : 'Execute Strategy'}
              </button>
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .strategy-selector {
          height: 100%;
        }
        
        .no-asset-selected {
          text-align: center;
          padding: 2rem;
          color: var(--secondary-color);
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

export default StrategySelector;