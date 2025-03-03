/**
 * Roo Code Memory Bank
 * 
 * This package contains configuration files for Cline that are automatically
 * extracted to the root of consuming projects during installation.
 * 
 * This module provides a programmatic interface to the extraction functionality.
 */

const path = require('path');
const { execSync } = require('child_process');

/**
 * Extract configuration files to the specified directory
 * @param {string} targetDir - The directory to extract files to (defaults to process.cwd())
 * @returns {boolean} - True if extraction was successful, false otherwise
 */
function extractConfigFiles(targetDir = process.cwd()) {
  try {
    const extractScript = path.resolve(__dirname, 'scripts', 'extract-config.js');
    
    // Set TARGET_DIR environment variable for the extract script
    process.env.TARGET_DIR = targetDir;
    
    // Execute the extraction script
    execSync(`node "${extractScript}"`, { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('Error extracting configuration files:', error);
    return false;
  }
}

module.exports = {
  extractConfigFiles
};