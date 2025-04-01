# Trading AI Agent Bot - Comprehensive Test Plan

This document outlines a comprehensive test plan for the Trading AI Agent Bot, including unit tests, integration tests, API tests, UI tests with Puppeteer, and end-to-end tests.

## 1. Unit Tests

### Core Components Tests

- **Trading Engine Tests**: Test order execution, strategy execution, and position management
- **Alpaca Client Tests**: Test API interactions, market data retrieval, and order creation
- **LLM Integration Tests**: Test market analysis, strategy generation, and recommendation logic
- **Supabase Storage Tests**: Test data persistence, retrieval, and user preference management

### Web Components Tests

- **Error Handler Tests**: Test error creation, classification, and API error handling
- **Auth Context Tests**: Test authentication flows, user session management, and protected routes
- **UI Component Tests**: Test rendering, user interactions, and state management

## 2. Integration Tests

- **Alpaca API Integration**: Test live API connections, market data retrieval, and paper trading
- **Supabase Integration**: Test database operations, authentication, and storage
- **LLM Provider Integration**: Test real API connections and response handling

## 3. API Tests

- **Trading API Routes**: Test account info, positions, orders, and market data endpoints
- **Backtest API Routes**: Test backtest execution, listing, and result retrieval
- **User API Routes**: Test profile, preferences, and API key management

## 4. UI Tests with Puppeteer

### Setup Puppeteer

```bash
npm install --save-dev puppeteer
```

### Login Page Tests

```javascript
// File: test/ui/login.test.js
const puppeteer = require('puppeteer');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
require('dotenv').config();

describe('Login Page', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser in action
      slowMo: 100 // Slow down by 100ms
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  });
  
  test('should show login form', async () => {
    // Check that the login form is displayed
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitButton).not.toBeNull();
  });
  
  test('should show error with invalid credentials', async () => {
    // Fill in the form with invalid credentials
    await page.type('input[name="email"]', 'invalid@example.com');
    await page.type('input[name="password"]', 'wrongpassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForSelector('.text-red-600', { timeout: 5000 });
    
    // Check for error message
    const errorText = await page.$eval('.text-red-600', el => el.textContent);
    expect(errorText).toBeTruthy();
  });
  
  test('should login successfully with valid credentials', async () => {
    // Fill in the form with valid credentials
    await page.type('input[name="email"]', process.env.TEST_USER_EMAIL);
    await page.type('input[name="password"]', process.env.TEST_USER_PASSWORD);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
    
    // Check that we're redirected to the dashboard
    expect(page.url()).toContain('/dashboard');
  });
});
```

### Dashboard Page Tests

```javascript
// File: test/ui/dashboard.test.js
const puppeteer = require('puppeteer');
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
require('dotenv').config();

describe('Dashboard Page', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 100
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', process.env.TEST_USER_EMAIL);
    await page.type('input[name="password"]', process.env.TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
  });
  
  test('should display dashboard title', async () => {
    // Check that the dashboard title is displayed
    const titleText = await page.$eval('h1', el => el.textContent);
    expect(titleText).toContain('Dashboard');
  });
  
  test('should display account summary', async () => {
    // Wait for account summary to load
    await page.waitForSelector('.dashboard-card', { timeout: 5000 });
    
    // Check that account summary is displayed
    const accountSummaryText = await page.$eval('.dashboard-card-header h2', el => el.textContent);
    expect(accountSummaryText).toContain('Account Summary');
  });
  
  test('should display positions', async () => {
    // Wait for positions to load
    await page.waitForSelector('.dashboard-card:nth-child(2)', { timeout: 5000 });
    
    // Check that positions section is displayed
    const positionsText = await page.$eval('.dashboard-card:nth-child(2) .dashboard-card-header h2', el => el.textContent);
    expect(positionsText).toContain('Positions');
  });
});
```

### Trading Page Tests

```javascript
// File: test/ui/trading.test.js
const puppeteer = require('puppeteer');
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
require('dotenv').config();

describe('Trading Page', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 100
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', process.env.TEST_USER_EMAIL);
    await page.type('input[name="password"]', process.env.TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
    
    // Navigate to trading page
    await page.click('a[href="/trading"]');
    await page.waitForSelector('.trading-page', { timeout: 5000 });
  });
  
  test('should display asset selector', async () => {
    // Check that asset selector is displayed
    const assetSelectorExists = await page.$('.asset-selector');
    expect(assetSelectorExists).not.toBeNull();
  });
  
  test('should display order form', async () => {
    // Check that order form is displayed
    const orderFormExists = await page.$('.order-form');
    expect(orderFormExists).not.toBeNull();
  });
  
  test('should place a market order', async () => {
    // Select a symbol
    await page.type('input[name="symbol"]', 'AAPL');
    await page.click('.asset-item'); // Click on the first result
    
    // Enter order details
    await page.select('select[name="orderType"]', 'market');
    await page.type('input[name="quantity"]', '1');
    
    // Submit the order
    await page.click('button[type="submit"]');
    
    // Wait for confirmation
    await page.waitForSelector('.order-confirmation', { timeout: 5000 });
    
    // Check for confirmation message
    const confirmationText = await page.$eval('.order-confirmation', el => el.textContent);
    expect(confirmationText).toContain('Order placed successfully');
  });
});
```

## 5. End-to-End Tests

```javascript
// File: test/e2e/trading.test.js
const puppeteer = require('puppeteer');
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
require('dotenv').config();

describe('End-to-End Trading', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 100
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', process.env.TEST_USER_EMAIL);
    await page.type('input[name="password"]', process.env.TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
  });
  
  test('should execute a complete trading workflow', async () => {
    // Navigate to trading page
    await page.click('a[href="/trading"]');
    await page.waitForSelector('.trading-page', { timeout: 5000 });
    
    // Select a symbol
    await page.type('input[name="symbol"]', 'AAPL');
    await page.click('.asset-item'); // Click on the first result
    
    // Enter order details
    await page.select('select[name="orderType"]', 'market');
    await page.type('input[name="quantity"]', '1');
    
    // Submit the order
    await page.click('button[type="submit"]');
    
    // Wait for confirmation
    await page.waitForSelector('.order-confirmation', { timeout: 5000 });
    
    // Navigate to dashboard to check positions
    await page.click('a[href="/dashboard"]');
    await page.waitForSelector('.dashboard-card', { timeout: 5000 });
    
    // Check that positions are updated
    const positionsText = await page.$eval('.dashboard-card:nth-child(2)', el => el.textContent);
    expect(positionsText).toContain('AAPL');
  });
});
```

## 6. Test Script Updates

Update the package.json file to include these test scripts:

```json
"scripts": {
  "test": "jest",
  "test:unit": "jest --testPathPattern=test/unit",
  "test:integration": "jest --testPathPattern=test/integration",
  "test:api": "jest --testPathPattern=test/api",
  "test:ui": "jest --testPathPattern=test/ui",
  "test:e2e": "jest --testPathPattern=test/e2e",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:api && npm run test:ui && npm run test:e2e"
}
```

## 7. Supabase Setup Requirements

Before running tests, you need to set up Supabase:

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and sign up/login
   - Create a new project
   - Note down the URL and anon key (public)
   - Note down the service role key (private)

2. **Set Up Database Tables**:
   - Use the SQL schema in `config/supabase-schema.sql`
   - In the Supabase dashboard, go to SQL Editor and run the schema SQL

3. **Configure Authentication**:
   - In the Supabase dashboard, go to Authentication > Settings
   - Configure the Site URL to match your application URL
   - Enable Email/Password sign-in method

4. **Update Environment Variables**:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

The application will use these credentials to connect to Supabase, but it won't automatically create the database schema or configure authentication settings.
