#!/usr/bin/env node

// This script allows users to manually extract the configuration files
// It simply calls the extract-config.js script which extracts files from the package directory

const path = require('path');
const { spawn } = require('child_process');

// Path to the extract-config.js script
const extractScript = path.resolve(__dirname, '..', 'scripts', 'extract-config.js');

// Get target directory from command line arguments if provided
// Usage: npx cline-rules-extract [target-directory]
const targetDir = process.argv[2];
if (targetDir) {
  process.env.TARGET_DIR = path.resolve(targetDir);
  console.log(`Target directory set to: ${process.env.TARGET_DIR}`);
} else {
  console.log('No target directory specified. Files will be extracted to the root of your project.');
}

// Run the extraction script
const child = spawn('node', [extractScript], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Configuration files extracted successfully!');
  } else {
    console.error(`Extraction failed with code ${code}`);
  }
  process.exit(code);
});