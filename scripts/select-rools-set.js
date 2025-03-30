#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rm = promisify(fs.rm);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

/**
 * List available configuration sets in the .rools directory
 */
async function listRoolsSets() {
  const roolsDir = path.join(process.cwd(), '.rools');
  
  // Check if .rools directory exists
  try {
    const stats = await stat(roolsDir);
    if (!stats.isDirectory()) {
      console.error('Error: .rools is not a directory');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error: .rools directory not found. Please create it first.');
    process.exit(1);
  }
  
  // Get directories in .rools
  const entries = await readdir(roolsDir);
  const dirs = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(roolsDir, entry);
      const stats = await stat(entryPath);
      return stats.isDirectory() ? entry : null;
    })
  );
  return dirs.filter((dir) => dir !== null);
}

/**
 * Prompt user to select a configuration set
 */
async function promptSelection(sets) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\nAvailable configuration sets:');
    sets.forEach((set, index) => {
      console.log(`${index + 1}. ${set}`);
    });
    
    rl.question('\nSelect a configuration set by number: ', (answer) => {
      rl.close();
      const selection = parseInt(answer, 10);
      if (isNaN(selection) || selection < 1 || selection > sets.length) {
        console.error('Invalid selection. Please enter a number between 1 and ' + sets.length);
        process.exit(1);
      }
      resolve(selection);
    });
  });
}

/**
 * Clean target directory by removing existing configuration files
 */
async function cleanTargetDir() {
  const targetDir = process.cwd();
  console.log('Cleaning target directory...');

  // Remove .roo directory if it exists
  const rooDir = path.join(targetDir, '.roo');
  try {
    await stat(rooDir);
    console.log('Removing existing .roo directory...');
    await rm(rooDir, { recursive: true, force: true });
  } catch (err) {
    // Directory doesn't exist, no need to remove
  }

  // Remove .roomodes file if it exists
  const roomodesFile = path.join(targetDir, '.roomodes');
  try {
    await stat(roomodesFile);
    console.log('Removing existing .roomodes file...');
    await rm(roomodesFile, { force: true });
  } catch (err) {
    // File doesn't exist, no need to remove
  }

  // Remove all .clinerules* files
  const files = await readdir(targetDir);
  for (const file of files) {
    if (file.startsWith('.clinerules')) {
      const filePath = path.join(targetDir, file);
      const stats = await stat(filePath);
      if (stats.isFile()) {
        console.log(`Removing existing ${file} file...`);
        await rm(filePath, { force: true });
      } else if (stats.isDirectory()) {
        console.log(`Removing existing ${file} directory...`);
        await rm(filePath, { recursive: true, force: true });
      }
    }
  }
}

/**
 * Copy a file from source to target
 */
async function copyFileWithDir(source, target) {
  try {
    // Create directory if it doesn't exist
    const targetDir = path.dirname(target);
    await mkdir(targetDir, { recursive: true });
    
    // Copy the file
    await copyFile(source, target);
    console.log(`Copied: ${path.relative(process.cwd(), source)} -> ${path.relative(process.cwd(), target)}`);
  } catch (err) {
    console.error(`Error copying ${source} to ${target}:`, err);
  }
}

/**
 * Recursively copy a directory
 */
async function copyDir(source, target) {
  try {
    // Create target directory
    await mkdir(target, { recursive: true });
    
    // Read source directory
    const entries = await readdir(source, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy subdirectory
        await copyDir(sourcePath, targetPath);
      } else {
        // Copy file
        await copyFileWithDir(sourcePath, targetPath);
      }
    }
  } catch (err) {
    console.error(`Error copying directory ${source} to ${target}:`, err);
  }
}

/**
 * Copy selected configuration set to target directory
 */
async function copySet(setName) {
  const sourceDir = path.join(process.cwd(), '.rools', setName);
  const targetDir = process.cwd();
  
  console.log(`\nDeploying configuration set: ${setName}`);
  
  // Get all files and directories in the source directory
  const entries = await readdir(sourceDir);
  
  // Copy each entry to the target directory
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry);
    const targetPath = path.join(targetDir, entry);
    
    const stats = await stat(sourcePath);
    if (stats.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else {
      await copyFileWithDir(sourcePath, targetPath);
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Roo Code Memory Bank - Configuration Set Selector');
    console.log('===============================================');
    
    // Check if a set name was provided as an argument
    const providedSetName = process.argv[2];
    let chosenSet;
    
    // List available configuration sets
    const sets = await listRoolsSets();
    if (sets.length === 0) {
      console.error('No configuration sets found in .rools directory');
      process.exit(1);
    }
    
    if (providedSetName) {
      // Use the provided set name if it exists
      if (sets.includes(providedSetName)) {
        chosenSet = providedSetName;
        console.log(`Using provided configuration set: ${chosenSet}`);
      } else {
        console.error(`Error: Configuration set "${providedSetName}" not found`);
        console.log('Available sets:', sets.join(', '));
        process.exit(1);
      }
    } else {
      // Prompt user to select a set
      const selection = await promptSelection(sets);
      chosenSet = sets[selection - 1];
      console.log(`\nSelected: ${chosenSet}`);
    }
    
    // Clean target directory
    await cleanTargetDir();
    
    // Copy selected set
    await copySet(chosenSet);
    
    console.log('\nConfiguration set deployed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run populate" to populate system variables');
    console.log('2. Start using Roo Code with the deployed configuration');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Run the main function
main();