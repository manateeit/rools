# NPM Package Implementation Plan

## Current Issues

1. The npm package doesn't properly include the `.clinerules-*` files and `.roo` directory from the repository root.
2. When the package is consumed, it doesn't correctly extract these files to the target project.

## Required Changes

### 1. Update package.json

The `package.json` file needs to be updated to include the `.clinerules-*` files and `.roo` directory in the published package:

```json
"files": [
  "scripts/extract-config.js",
  "bin/cline-rules-extract.js",
  "README.md",
  ".clinerules-*",
  ".roo/**"
]
```

### 2. Modify the Build Process

We need a build process that copies the `.clinerules-*` files and `.roo` directory from the repository root to the npm package directory before publishing:

1. Create a `prepare` script in package.json that runs before the package is packed or published
2. This script should copy the necessary files from the repository root to the package directory

```json
"scripts": {
  "prepare": "node scripts/prepare-package.js",
  "postinstall": "node scripts/extract-config.js",
  "test": "node test/test-extract.js"
}
```

### 3. Create prepare-package.js Script

Create a new script that copies the required files from the repository root to the package directory:

```javascript
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
    
    console.log('Package preparation completed successfully!');
  } catch (err) {
    console.error('Error preparing package files:', err);
    process.exit(1);
  }
}

// Run the preparation
preparePackage();
```

### 4. Update extract-config.js Script

Modify the extract-config.js script to copy files from the package directory instead of the repository root:

```javascript
// Change this:
const repoRootDir = isInNodeModules 
  ? path.resolve(packageDir, '..', '..') // Project that installed us
  : path.resolve(__dirname, '..', '..', '..'); // Repository root in development

// To this:
const sourceDir = path.resolve(__dirname, '..'); // The package directory
```

And update the file copying logic to use this sourceDir instead of repoRootDir.

## Implementation Steps

1. Create the prepare-package.js script in the scripts directory
2. Update package.json to include the prepare script and update the files array
3. Update extract-config.js to copy files from the package directory
4. Test the changes by:
   - Running npm pack to create a tarball
   - Installing the tarball in a test project
   - Verifying that the .clinerules-* files and .roo directory are correctly copied to the test project

## Expected Outcome

After these changes:
1. The npm package will include all .clinerules-* files and the .roo directory from the repository root
2. When the package is installed in a project, these files will be correctly extracted to the project root
3. The extraction will work both during installation and when manually running the cline-rules-extract command