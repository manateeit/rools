#!/usr/bin/env node

/**
 * Test script for the roo-code-memory-bank package
 * 
 * This script demonstrates how to use the package programmatically
 * to extract configuration files to a specified directory.
 */

const path = require('path');
const fs = require('fs');
const clinerRules = require('../index');

// Create a test directory
const testDir = path.join(__dirname, 'test-output');

// Create the test directory if it doesn't exist
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log(`Created test directory: ${testDir}`);
}

// Extract configuration files to the test directory
console.log(`Extracting configuration files to: ${testDir}`);
const result = clinerRules.extractConfigFiles(testDir);

if (result) {
  console.log('Extraction successful!');
  
  // List the extracted files
  console.log('\nExtracted files:');
  const files = fs.readdirSync(testDir);
  files.forEach(file => {
    console.log(`- ${file}`);
  });
  
  // Check if .roo directory was extracted
  const rooDir = path.join(testDir, '.roo');
  if (fs.existsSync(rooDir)) {
    console.log('\n.roo directory contents:');
    const rooFiles = fs.readdirSync(rooDir);
    rooFiles.forEach(file => {
      console.log(`- .roo/${file}`);
    });
  }
  
  // Test overwrite functionality
  console.log('\nTesting overwrite functionality...');
  
  // Create a test file that will be overwritten
  const testFile = path.join(testDir, '.clinerules-test');
  fs.writeFileSync(testFile, 'This is a test file that should be overwritten.');
  console.log(`Created test file: ${testFile}`);
  
  // Extract again to test overwrite
  console.log('Extracting again to test overwrite...');
  const overwriteResult = clinerRules.extractConfigFiles(testDir);
  
  if (overwriteResult) {
    console.log('Second extraction successful!');
    console.log('If any .clinerules-* files were in the package, they should have overwritten the test file.');
  } else {
    console.error('Second extraction failed!');
  }
} else {
  console.error('Extraction failed!');
}