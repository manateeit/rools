const nextJest = require('next/jest');

// Create a custom Next.js configuration to be used with Jest
const createJestConfig = nextJest({
  // Path to Next.js app
  dir: './web',
});

// Custom Jest configuration
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test environment for React components
  testEnvironment: 'jest-environment-jsdom',
  
  // Directories to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/'
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Module name mapper for CSS and other files
  moduleNameMapper: {
    // Handle CSS imports
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Handle module aliases
    '^@/components/(.*)$': '<rootDir>/web/components/$1',
    '^@/pages/(.*)$': '<rootDir>/web/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/web/lib/$1',
    '^@/styles/(.*)$': '<rootDir>/web/styles/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/alpaca/(.*)$': '<rootDir>/src/alpaca/$1',
    '^@/llm/(.*)$': '<rootDir>/src/llm/$1',
    '^@/storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@/cli/(.*)$': '<rootDir>/src/cli/$1',
    '^@/web/(.*)$': '<rootDir>/src/web/$1',
    '^@/backtest/(.*)$': '<rootDir>/src/backtest/$1'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'web/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**'
  ],
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Minimum coverage threshold
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  // Transform patterns
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ]
};

// Export the combined configuration
module.exports = createJestConfig(customJestConfig);