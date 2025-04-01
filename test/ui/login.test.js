const puppeteer = require('puppeteer');
const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
require('dotenv').config();

/**
 * UI tests for the login page using Puppeteer
 * 
 * These tests verify that the login page works correctly:
 * - Shows the login form
 * - Displays errors for invalid credentials
 * - Successfully logs in with valid credentials
 */
describe('Login Page', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    // Launch the browser
    browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      slowMo: 50, // Slow down by 50ms to make it easier to see what's happening
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Needed for some CI environments
    });
  });
  
  afterAll(async () => {
    // Close the browser
    await browser.close();
  });
  
  beforeEach(async () => {
    // Create a new page for each test
    page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the login page
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle0' // Wait until the network is idle
    });
  });
  
  test('should show login form', async () => {
    // Check that the login form is displayed
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    // Assert that the form elements exist
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitButton).not.toBeNull();
    
    // Check the page title
    const title = await page.title();
    expect(title).toContain('Login');
  });
  
  test('should show error with invalid credentials', async () => {
    // Fill in the form with invalid credentials
    await page.type('input[name="email"]', 'invalid@example.com');
    await page.type('input[name="password"]', 'wrongpassword');
    
    // Submit the form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForSelector('.text-red-600', { timeout: 5000 }) // Wait for error message
    ]);
    
    // Check for error message
    const errorText = await page.$eval('.text-red-600', el => el.textContent);
    expect(errorText).toBeTruthy();
    expect(errorText).toContain('Invalid credentials');
  });
  
  test('should login successfully with valid credentials', async () => {
    // Skip this test if test credentials are not provided
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      console.log('Skipping test: TEST_USER_EMAIL or TEST_USER_PASSWORD not provided');
      return;
    }
    
    // Fill in the form with valid credentials
    await page.type('input[name="email"]', process.env.TEST_USER_EMAIL);
    await page.type('input[name="password"]', process.env.TEST_USER_PASSWORD);
    
    // Submit the form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }) // Wait for navigation
    ]);
    
    // Check that we're redirected to the dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Check that the dashboard title is displayed
    const dashboardTitle = await page.$eval('h1', el => el.textContent);
    expect(dashboardTitle).toContain('Dashboard');
  });
  
  test('should navigate to signup page', async () => {
    // Click on the signup link
    await Promise.all([
      page.click('a[href="/signup"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }) // Wait for navigation
    ]);
    
    // Check that we're on the signup page
    expect(page.url()).toContain('/signup');
    
    // Check that the signup form is displayed
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    // Assert that the form elements exist
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(submitButton).not.toBeNull();
  });
  
  test('should navigate to forgot password page', async () => {
    // Click on the forgot password link
    await Promise.all([
      page.click('a[href="/forgot-password"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }) // Wait for navigation
    ]);
    
    // Check that we're on the forgot password page
    expect(page.url()).toContain('/forgot-password');
    
    // Check that the forgot password form is displayed
    const emailInput = await page.$('input[name="email"]');
    const submitButton = await page.$('button[type="submit"]');
    
    // Assert that the form elements exist
    expect(emailInput).not.toBeNull();
    expect(submitButton).not.toBeNull();
  });
});