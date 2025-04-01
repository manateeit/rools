/**
 * Jest configuration for Trading AI Agent Bot
 */
module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/test/**/*.test.js'
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  // matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // An array of regexp pattern strings that are matched against all source file paths
  // matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],
  
  // A map from regular expressions to paths to transformers
  transform: {},
  
  // An array of regexp pattern strings that are matched against all modules before they are loaded
  // matched files will be mocked
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/'
  ],
  
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover'
  ],
  
  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',
  
  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    '<rootDir>'
  ],
  
  // The paths to modules that run some code to configure or set up the testing environment
  setupFiles: [],
  
  // A list of paths to modules that run some code to configure or set up the testing framework
  setupFilesAfterEnv: [],
  
  // The number of seconds after which a test is considered as slow
  slowTestThreshold: 5,
  
  // A list of paths to snapshot serializer modules Jest should use
  snapshotSerializers: [],
  
  // The test timeout in milliseconds
  testTimeout: 10000
};