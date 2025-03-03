#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Determine if we're in a node_modules directory
const isInNodeModules = __dirname.includes('node_modules');

// Get the source directory (where our package is installed)
const packageDir = path.resolve(__dirname, '..');

// Get the repository root directory (for accessing the actual .clinerules-* and .roo files)
// When running in development, this is 3 levels up from the scripts directory
// When running in node_modules, we need to look for the files in the project that installed us
const repoRootDir = isInNodeModules 
  ? path.resolve(packageDir, '..', '..') // Project that installed us
  : path.resolve(__dirname, '..', '..', '..'); // Repository root in development

// Get the target directory (the root of the project that installed our package)
// Priority:
// 1. TARGET_DIR environment variable (for programmatic use)
// 2. If we're in node_modules, go up to the project root
// 3. If we're running this script directly (for development), use the current directory
const targetDir = process.env.TARGET_DIR 
  ? process.env.TARGET_DIR
  : isInNodeModules 
    ? path.resolve(packageDir, '..', '..') 
    : process.cwd();

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
    console.log(`Copied: ${path.relative(repoRootDir, source)} -> ${path.relative(targetDir, target)}`);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.warn(`Warning: ${target} already exists. Skipping.`);
    } else {
      console.error(`Error copying ${source} to ${target}:`, err);
    }
  }
}

/**
 * Recursively copy a directory
 */
async function copyDir(source, target) {
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
}

/**
 * Main function to extract config files
 */
async function extractConfig() {
  try {
    console.log('Extracting Roo Code Memory Bank configuration files...');
    console.log(`Source: ${repoRootDir}`);
    console.log(`Target: ${targetDir}`);
    
    // Copy .clinerules-* files from the repository root
    const files = await readdir(repoRootDir);
    for (const file of files) {
      if (file.startsWith('.clinerules-')) {
        const sourcePath = path.join(repoRootDir, file);
        const targetPath = path.join(targetDir, file);
        
        // Check if it's a file
        const stats = await stat(sourcePath);
        if (stats.isFile()) {
          await copyFileWithDir(sourcePath, targetPath);
        }
      }
    }
    
    // Copy .roo directory from the repository root if it exists
    const rooDir = path.join(repoRootDir, '.roo');
    if (fs.existsSync(rooDir)) {
      const targetRooDir = path.join(targetDir, '.roo');
      await copyDir(rooDir, targetRooDir);
    } else {
      console.warn(`Warning: .roo directory not found in ${repoRootDir}`);
    }
    
    console.log('Configuration files extracted successfully!');
  } catch (err) {
    console.error('Error extracting configuration files:', err);
    process.exit(1);
  }
}

// Run the extraction
extractConfig();