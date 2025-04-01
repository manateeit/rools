import { useState, useEffect } from 'react';

const ModelSettings = ({ user, loading, onSuccess, onError }) => {
  const [defaultModel, setDefaultModel] = useState('gpt-4');
  const [modelSettings, setModelSettings] = useState({
    'gpt-4': {
      enabled: true,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0
    },
    'gpt-3.5-turbo': {
      enabled: true,
      temperature: 0.8,
      maxTokens: 1500,
      topP: 1.0
    },
    'claude-3-opus': {
      enabled: false,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0
    },
    'claude-3-sonnet': {
      enabled: false,
      temperature: 0.7,
      maxTokens: 1500,
      topP: 1.0
    },
    'llama-3': {
      enabled: false,
      temperature: 0.7,
      maxTokens: 1500,
      topP: 1.0
    }
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('gpt-4');
  
  // Load model settings
  useEffect(() => {
    if (!user) return;
    
    const loadModelSettings = async () => {
      try {
        // Fetch model settings
        const response = await fetch('/api/user/model-settings');
        
        if (response.ok) {
          const settings = await response.json();
          setDefaultModel(settings.defaultModel || 'gpt-4');
          setModelSettings(settings.models || modelSettings);
        }
      } catch (err) {
        console.error('Error loading model settings:', err);
        
        // Use defaults in development
        if (process.env.NODE_ENV === 'development') {
          // Keep default values
        }
      }
    };
    
    loadModelSettings();
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      // Update model settings
      const response = await fetch('/api/user/model-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          defaultModel,
          models: modelSettings
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update model settings');
      }
      
      onSuccess('Model settings updated successfully');
    } catch (err) {
      console.error('Error updating model settings:', err);
      onError(err.message);
      
      // Simulate success in development
      if (process.env.NODE_ENV === 'development') {
        onSuccess('Model settings updated successfully (Development Mode)');
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle model toggle
  const handleModelToggle = (model) => {
    setModelSettings({
      ...modelSettings,
      [model]: {
        ...modelSettings[model],
        enabled: !modelSettings[model].enabled
      }
    });
  };
  
  // Handle model parameter change
  const handleParameterChange = (model, parameter, value) => {
    setModelSettings({
      ...modelSettings,
      [model]: {
        ...modelSettings[model],
        [parameter]: value
      }
    });
  };
  
  // Get model display name
  const getModelDisplayName = (model) => {
    switch (model) {
      case 'gpt-4':
        return 'GPT-4';
      case 'gpt-3.5-turbo':
        return 'GPT-3.5 Turbo';
      case 'claude-3-opus':
        return 'Claude 3 Opus';
      case 'claude-3-sonnet':
        return 'Claude 3 Sonnet';
      case 'llama-3':
        return 'Llama 3';
      default:
        return model;
    }
  };
  
  // Get model provider
  const getModelProvider = (model) => {
    if (model.startsWith('gpt')) {
      return 'OpenAI';
    } else if (model.startsWith('claude')) {
      return 'Anthropic';
    } else if (model.startsWith('llama')) {
      return 'Meta';
    } else {
      return 'Unknown';
    }
  };
  
  return (
    <div className="model-settings">
      <h2>LLM Model Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="default-model-section">
          <h3>Default Model</h3>
          <p className="section-description">
            Select the default LLM model to use for AI-assisted trading strategies
          </p>
          
          <div className="form-group">
            <select
              id="defaultModel"
              className="form-control"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              disabled={loading || formLoading}
            >
              {Object.keys(modelSettings).map(model => (
                <option 
                  key={model} 
                  value={model}
                  disabled={!modelSettings[model].enabled}
                >
                  {getModelDisplayName(model)} ({getModelProvider(model)})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="models-section">
          <h3>Available Models</h3>
          <p className="section-description">
            Configure which LLM models are available for use and their parameters
          </p>
          
          <div className="models-tabs">
            {Object.keys(modelSettings).map(model => (
              <button
                key={model}
                type="button"
                className={`model-tab ${activeModel === model ? 'active' : ''}`}
                onClick={() => setActiveModel(model)}
                disabled={loading || formLoading}
              >
                {getModelDisplayName(model)}
              </button>
            ))}
          </div>
          
          <div className="model-config">
            {Object.keys(modelSettings).map(model => (
              <div 
                key={model} 
                className={`model-config-panel ${activeModel === model ? 'active' : ''}`}
              >
                <div className="model-header">
                  <div className="model-info">
                    <h4>{getModelDisplayName(model)}</h4>
                    <div className="model-provider">{getModelProvider(model)}</div>
                  </div>
                  <div className="model-toggle">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        id={`${model}-enabled`}
                        className="form-check-input"
                        checked={modelSettings[model].enabled}
                        onChange={() => handleModelToggle(model)}
                        disabled={loading || formLoading}
                      />
                      <label className="form-check-label" htmlFor={`${model}-enabled`}>
                        {modelSettings[model].enabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="model-parameters">
                  <div className="parameter">
                    <label htmlFor={`${model}-temperature`}>Temperature</label>
                    <input
                      type="range"
                      id={`${model}-temperature`}
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelSettings[model].temperature}
                      onChange={(e) => handleParameterChange(model, 'temperature', parseFloat(e.target.value))}
                      disabled={loading || formLoading || !modelSettings[model].enabled}
                    />
                    <div className="parameter-value">
                      {modelSettings[model].temperature.toFixed(1)}
                    </div>
                    <div className="parameter-description">
                      Controls randomness: Lower values are more deterministic, higher values are more creative
                    </div>
                  </div>
                  
                  <div className="parameter">
                    <label htmlFor={`${model}-maxTokens`}>Max Tokens</label>
                    <input
                      type="range"
                      id={`${model}-maxTokens`}
                      min="500"
                      max="4000"
                      step="100"
                      value={modelSettings[model].maxTokens}
                      onChange={(e) => handleParameterChange(model, 'maxTokens', parseInt(e.target.value))}
                      disabled={loading || formLoading || !modelSettings[model].enabled}
                    />
                    <div className="parameter-value">
                      {modelSettings[model].maxTokens}
                    </div>
                    <div className="parameter-description">
                      Maximum number of tokens to generate in the response
                    </div>
                  </div>
                  
                  <div className="parameter">
                    <label htmlFor={`${model}-topP`}>Top P</label>
                    <input
                      type="range"
                      id={`${model}-topP`}
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={modelSettings[model].topP}
                      onChange={(e) => handleParameterChange(model, 'topP', parseFloat(e.target.value))}
                      disabled={loading || formLoading || !modelSettings[model].enabled}
                    />
                    <div className="parameter-value">
                      {modelSettings[model].topP.toFixed(1)}
                    </div>
                    <div className="parameter-description">
                      Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || formLoading}
          >
            {formLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div className="models-info">
        <h3>About LLM Models</h3>
        <p>
          Large Language Models (LLMs) are used to analyze market data, generate trading insights, and assist in decision-making.
          Different models have different capabilities and costs.
        </p>
        <h4>Model Recommendations</h4>
        <ul>
          <li><strong>GPT-4:</strong> Best for complex analysis and strategy development</li>
          <li><strong>GPT-3.5 Turbo:</strong> Good balance of performance and cost</li>
          <li><strong>Claude 3 Opus:</strong> Excellent for detailed market analysis</li>
          <li><strong>Claude 3 Sonnet:</strong> Good alternative to GPT models</li>
          <li><strong>Llama 3:</strong> Open-source alternative with good performance</li>
        </ul>
      </div>
      
      <style jsx>{`
        .model-settings {
          max-width: 800px;
        }
        
        h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        h4 {
          font-size: 1.1rem;
          margin: 0;
        }
        
        .section-description {
          margin-bottom: 1rem;
          color: var(--secondary-color);
        }
        
        .default-model-section {
          margin-bottom: 2rem;
        }
        
        .models-section {
          margin-bottom: 2rem;
        }
        
        .models-tabs {
          display: flex;
          overflow-x: auto;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .model-tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .model-tab.active {
          border-bottom-color: var(--primary-color);
          font-weight: bold;
        }
        
        .model-config-panel {
          display: none;
        }
        
        .model-config-panel.active {
          display: block;
        }
        
        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .model-provider {
          font-size: 0.875rem;
          color: var(--secondary-color);
        }
        
        .model-parameters {
          background-color: var(--light-color);
          padding: 1rem;
          border-radius: var(--border-radius);
        }
        
        .parameter {
          margin-bottom: 1rem;
        }
        
        .parameter:last-child {
          margin-bottom: 0;
        }
        
        .parameter label {
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .parameter input[type="range"] {
          width: 100%;
        }
        
        .parameter-value {
          text-align: right;
          font-weight: bold;
          margin-top: 0.25rem;
        }
        
        .parameter-description {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin-top: 0.25rem;
        }
        
        .form-group {
          margin-top: 1.5rem;
        }
        
        .models-info {
          margin-top: 2rem;
          background-color: var(--light-color);
          padding: 1.5rem;
          border-radius: var(--border-radius);
        }
        
        .models-info h3 {
          margin-top: 0;
        }
        
        .models-info h4 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .models-info ul {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default ModelSettings;