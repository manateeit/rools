import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { logError } from '../../lib/errorHandler';

// Mock the logError function
jest.mock('../../lib/errorHandler', () => ({
  logError: jest.fn()
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('ErrorBoundary', () => {
  // Save the original console.error
  const originalConsoleError = console.error;
  
  // Suppress console.error during tests
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  // Restore console.error after tests
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
  
  it('should render fallback UI when there is an error', () => {
    // We need to spy on console.error to prevent React from logging the error
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check that the fallback UI is rendered
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We\'re sorry, but an error occurred while rendering this page.')).toBeInTheDocument();
    
    // Check that logError was called
    expect(logError).toHaveBeenCalled();
    
    // Restore console.error
    spy.mockRestore();
  });
  
  it('should call custom fallback when provided', () => {
    // We need to spy on console.error to prevent React from logging the error
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const customFallback = jest.fn((error, errorInfo, resetError) => (
      <div data-testid="custom-fallback">
        <p>Custom Error: {error.message}</p>
        <button onClick={resetError}>Reset</button>
      </div>
    ));
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check that the custom fallback was called
    expect(customFallback).toHaveBeenCalled();
    
    // Check that the custom fallback UI is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error: Test error')).toBeInTheDocument();
    
    // Restore console.error
    spy.mockRestore();
  });
  
  it('should reset error state when "Try Again" is clicked', () => {
    // We need to spy on console.error to prevent React from logging the error
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const TestComponent = ({ shouldThrow, setShouldThrow }) => {
      return (
        <ErrorBoundary>
          {shouldThrow ? (
            <ThrowError shouldThrow={true} />
          ) : (
            <div data-testid="no-error">
              <button onClick={() => setShouldThrow(true)}>Throw Error</button>
            </div>
          )}
        </ErrorBoundary>
      );
    };
    
    // Use a wrapper component to control the shouldThrow state
    const Wrapper = () => {
      const [shouldThrow, setShouldThrow] = React.useState(false);
      return <TestComponent shouldThrow={shouldThrow} setShouldThrow={setShouldThrow} />;
    };
    
    render(<Wrapper />);
    
    // Initially, no error
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
    
    // Trigger an error
    fireEvent.click(screen.getByText('Throw Error'));
    
    // Error boundary should show fallback UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click "Try Again"
    fireEvent.click(screen.getByText('Try Again'));
    
    // Error boundary should reset and show children
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
    
    // Restore console.error
    spy.mockRestore();
  });
});