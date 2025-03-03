#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Get the package directory
const packageDir = path.resolve(__dirname, '..');

// Get the repository root directory
const repoRootDir = path.resolve(__dirname, '..', '..', '..');

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
    console.log(`Copied: ${path.relative(repoRootDir, source)} -> ${path.relative(packageDir, target)}`);
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
 * Main function to prepare the package
 */
async function preparePackage() {
  try {
    console.log('Preparing package files...');
    console.log(`Source: ${repoRootDir}`);
    console.log(`Target: ${packageDir}`);
    
    // Copy .clinerules-* files from the repository root
    const files = await readdir(repoRootDir);
    for (const file of files) {
      if (file.startsWith('.clinerules-')) {
        const sourcePath = path.join(repoRootDir, file);
        const targetPath = path.join(packageDir, file);
        
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
      const targetRooDir = path.join(packageDir, '.roo');
      await copyDir(rooDir, targetRooDir);
    } else {
      console.warn(`Warning: .roo directory not found in ${repoRootDir}`);
    }
    
    // Copy .roomodes file if it exists
    const roomodesPath = path.join(repoRootDir, '.roomodes');
    if (fs.existsSync(roomodesPath)) {
      const targetRoomodesPath = path.join(packageDir, '.roomodes');
      await copyFileWithDir(roomodesPath, targetRoomodesPath);
    }
    
    console.log('Package preparation completed successfully!');
  } catch (err) {
    console.error('Error preparing package files:', err);
    process.exit(1);
  }
}

// Run the preparation
preparePackage();