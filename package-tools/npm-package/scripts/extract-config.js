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

// Get the source directory (where the configuration files are located)
// This is the package directory itself, as the files are now bundled with the package
const sourceDir = packageDir;

// Find the root of the consuming repository
function findProjectRoot(startDir) {
  // If we're not in node_modules, just use the current directory
  if (!isInNodeModules) {
    return process.cwd();
  }

  // Start from the package directory and go up until we find a directory that's not node_modules
  let currentDir = startDir;
  
  // Maximum number of levels to go up to prevent infinite loops
  const maxLevels = 10;
  let levels = 0;
  
  while (currentDir.includes('node_modules') && levels < maxLevels) {
    currentDir = path.dirname(currentDir);
    levels++;
  }
  
  // If we've gone up too many levels without finding a non-node_modules directory,
  // fall back to the default behavior
  if (levels >= maxLevels) {
    console.warn('Warning: Could not determine project root. Using default.');
    return path.resolve(packageDir, '..', '..');
  }
  
  return currentDir;
}

// Get the target directory (the root of the project that installed our package)
// Priority:
// 1. TARGET_DIR environment variable (for programmatic use)
// 2. If we're in node_modules, find the project root
// 3. If we're running this script directly (for development), use the current directory
const targetDir = process.env.TARGET_DIR 
  ? process.env.TARGET_DIR
  : isInNodeModules 
    ? findProjectRoot(packageDir)
    : process.cwd();

/**
 * Copy a file from source to target
 */
async function copyFileWithDir(source, target) {
  try {
    // Create directory if it doesn't exist
    const targetDir = path.dirname(target);
    await mkdir(targetDir, { recursive: true });
    
    // Copy the file, overwriting if it exists
    await copyFile(source, target, fs.constants.COPYFILE_FICLONE);
    console.log(`Copied: ${path.relative(sourceDir, source)} -> ${path.relative(targetDir, target)}`);
  } catch (err) {
    console.error(`Error copying ${source} to ${target}:`, err);
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
    console.log(`Source: ${sourceDir}`);
    console.log(`Target: ${targetDir}`);
    
    // Copy .clinerules-* files from the package directory
    const files = await readdir(sourceDir);
    for (const file of files) {
      if (file.startsWith('.clinerules-')) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        // Check if it's a file
        const stats = await stat(sourcePath);
        if (stats.isFile()) {
          await copyFileWithDir(sourcePath, targetPath);
        }
      }
    }
    
    // Copy .roomodes file if it exists
    const roomodesPath = path.join(sourceDir, '.roomodes');
    if (fs.existsSync(roomodesPath)) {
      const targetRoomodesPath = path.join(targetDir, '.roomodes');
      await copyFileWithDir(roomodesPath, targetRoomodesPath);
    }
    
    // Copy .roo directory from the package directory if it exists
    const rooDir = path.join(sourceDir, '.roo');
    if (fs.existsSync(rooDir)) {
      const targetRooDir = path.join(targetDir, '.roo');
      await copyDir(rooDir, targetRooDir);
    } else {
      console.warn(`Warning: .roo directory not found in ${sourceDir}`);
    }
    
    console.log('Configuration files extracted successfully!');
  } catch (err) {
    console.error('Error extracting configuration files:', err);
    process.exit(1);
  }
}

// Run the extraction
extractConfig();