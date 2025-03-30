/**
 * Roo Code Memory Bank
 * 
 * This module provides a programmatic interface to the Roo Code Memory Bank system,
 * which maintains project context across sessions and memory resets for consistent
 * AI-assisted development.
 */

const path = require('path');
const { execSync } = require('child_process');

/**
 * Populate system variables in system prompt files
 * @param {string} targetDir - The directory containing the .roo directory (defaults to process.cwd())
 * @returns {boolean} - True if population was successful, false otherwise
 */
function populateSystemVariables(targetDir = process.cwd()) {
  try {
    const populateScript = path.resolve(__dirname, 'scripts', 'populate-system-vars.js');
    
    // Change to the target directory to run the script
    const originalDir = process.cwd();
    process.chdir(targetDir);
    
    // Execute the script
    execSync(`node "${populateScript}"`, { stdio: 'inherit' });
    
    // Change back to the original directory
    process.chdir(originalDir);
    
    return true;
  } catch (error) {
    console.error('Error populating system variables:', error);
    return false;
  }
}

/**
 * Wipe system variables from system prompt files
 * @param {string} targetDir - The directory containing the .roo directory (defaults to process.cwd())
 * @returns {boolean} - True if wiping was successful, false otherwise
 */
function wipeSystemVariables(targetDir = process.cwd()) {
  try {
    const wipeScript = path.resolve(__dirname, 'scripts', 'wipe-system-vars.js');
    
    // Change to the target directory to run the script
    const originalDir = process.cwd();
    process.chdir(targetDir);
    
    // Execute the script
    execSync(`node "${wipeScript}"`, { stdio: 'inherit' });
    
    // Change back to the original directory
    process.chdir(originalDir);
    
    return true;
  } catch (error) {
    console.error('Error wiping system variables:', error);
    return false;
  }
}

/**
 * Select and deploy a configuration set
 * @param {string} setName - The name of the configuration set to deploy
 * @param {string} targetDir - The directory to deploy to (defaults to process.cwd())
 * @returns {boolean} - True if deployment was successful, false otherwise
 */
function selectConfigurationSet(setName, targetDir = process.cwd()) {
  try {
    const selectScript = path.resolve(__dirname, 'scripts', 'select-rools-set.js');
    
    // Change to the target directory to run the script
    const originalDir = process.cwd();
    process.chdir(targetDir);
    
    // Execute the script with the set name as an argument
    // This requires modifying the select-rools-set.js script to accept a set name as an argument
    execSync(`node "${selectScript}" "${setName}"`, { stdio: 'inherit' });
    
    // Change back to the original directory
    process.chdir(originalDir);
    
    return true;
  } catch (error) {
    console.error('Error selecting configuration set:', error);
    return false;
  }
}

/**
 * List available configuration sets
 * @param {string} targetDir - The directory containing the .rools directory (defaults to process.cwd())
 * @returns {string[]} - Array of configuration set names
 */
function listConfigurationSets(targetDir = process.cwd()) {
  try {
    const fs = require('fs');
    const roolsDir = path.join(targetDir, '.rools');
    
    // Check if .rools directory exists
    if (!fs.existsSync(roolsDir) || !fs.statSync(roolsDir).isDirectory()) {
      console.error('Error: .rools directory not found');
      return [];
    }
    
    // Get directories in .rools
    return fs.readdirSync(roolsDir)
      .filter(entry => fs.statSync(path.join(roolsDir, entry)).isDirectory());
  } catch (error) {
    console.error('Error listing configuration sets:', error);
    return [];
  }
}

module.exports = {
  populateSystemVariables,
  wipeSystemVariables,
  selectConfigurationSet,
  listConfigurationSets
};