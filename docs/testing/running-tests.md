# Running Tests for Trading AI Agent Bot

This guide explains how to run the various tests for the Trading AI Agent Bot, including the Puppeteer UI tests.

## Prerequisites

Before running tests, ensure you have:

1. Installed all dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env`:
   ```
   # Alpaca API
   ALPACA_API_KEY=your_alpaca_api_key
   ALPACA_API_SECRET=your_alpaca_api_secret
   ALPACA_PAPER_TRADING=true
   
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Test User (for UI and E2E tests)
   TEST_USER_EMAIL=your_test_user_email
   TEST_USER_PASSWORD=your_test_user_password
   ```

3. Set up Supabase according to the [Supabase Setup Guide](../installation/supabase-setup.md)

4. Created a test user in Supabase

## Running the Application for Testing

Before running UI or E2E tests, you need to have the application running:

```bash
# In one terminal, start the web server
npm run web

# Wait for the server to start, then run tests in another terminal
```

## Running All Tests

To run all tests:

```bash
npm run test:all
```

This will run unit tests, integration tests, API tests, UI tests, and end-to-end tests sequentially.

## Running Specific Test Types

### Unit Tests

Unit tests verify that individual components work correctly in isolation:

```bash
npm run test:unit
```

### Integration Tests

Integration tests verify that different components work together correctly:

```bash
npm run test:integration
```

### API Tests

API tests verify that the API endpoints work correctly:

```bash
npm run test:api
```

### UI Tests with Puppeteer

UI tests use Puppeteer to verify that the web interface works correctly:

```bash
npm run test:ui
```

These tests will launch a headless browser and interact with your application. If you want to see the browser in action, you can modify the `headless` option in the test files:

```javascript
// In test/ui/login.test.js
browser = await puppeteer.launch({
  headless: false, // Change to false to see the browser
  slowMo: 50
});
```

### End-to-End Tests

End-to-end tests verify complete workflows:

```bash
npm run test:e2e
```

## Troubleshooting UI Tests

If you encounter issues with UI tests:

1. **Application Not Running**: Ensure the application is running on http://localhost:3000
2. **Authentication Issues**: Verify your TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
3. **Element Not Found**: The UI structure might have changed; update the selectors in the test files
4. **Timeouts**: Increase the timeout values in the test files:
   ```javascript
   await page.waitForSelector('.element', { timeout: 10000 }); // Increase from 5000 to 10000
   ```

## Debugging UI Tests

To debug UI tests:

1. Set `headless: false` to see the browser in action
2. Increase `slowMo` to slow down the test execution
3. Add `console.log` statements to the test files
4. Use `page.screenshot()` to capture screenshots during test execution:
   ```javascript
   await page.screenshot({ path: 'debug-screenshot.png' });
   ```

## Continuous Integration

The project is configured to run tests in CI/CD pipelines. The GitHub Actions workflow will run all tests on each push to the repository.

## Adding New Tests

### Adding New UI Tests

To add a new UI test:

1. Create a new file in the `test/ui` directory
2. Follow the pattern in existing UI tests
3. Use Puppeteer's API to interact with the page
4. Add assertions to verify the expected behavior

Example:

```javascript
// test/ui/settings.test.js
const puppeteer = require('puppeteer');
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
require('dotenv').config();

describe('Settings Page', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      slowMo: 50
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    // Login and navigate to settings page
    // ...
  });
  
  test('should update user preferences', async () => {
    // Test code here
  });
});
```

### Adding New Unit Tests

To add a new unit test:

1. Create a new file in the `test/unit` directory
2. Follow the pattern in existing unit tests
3. Mock dependencies as needed
4. Add assertions to verify the expected behavior

Example:

```javascript
// test/unit/alpacaClient.test.js
const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { AlpacaClient } = require('../../src/alpaca/client');

describe('AlpacaClient', () => {
  // Test code here
});