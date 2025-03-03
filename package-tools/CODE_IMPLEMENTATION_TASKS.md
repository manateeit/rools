# NPM Package Implementation Tasks for Code Mode

Based on the architectural plan outlined in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md), the following tasks need to be implemented by Code mode:

## 1. Update package.json

Update the `package.json` file in the npm-package directory to:

- Include `.clinerules-*` files and `.roo/**` in the "files" array
- Add a "prepare" script that runs before the package is packed or published

```json
{
  "files": [
    "scripts/extract-config.js",
    "bin/cline-rules-extract.js",
    "README.md",
    ".clinerules-*",
    ".roo/**"
  ],
  "scripts": {
    "prepare": "node scripts/prepare-package.js",
    "postinstall": "node scripts/extract-config.js",
    "test": "node test/test-extract.js"
  }
}
```

## 2. Create prepare-package.js Script

Create a new script at `package-tools/npm-package/scripts/prepare-package.js` that:

- Copies all `.clinerules-*` files from the repository root to the package directory
- Copies the `.roo` directory from the repository root to the package directory

The script should follow the implementation outlined in the [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) document.

## 3. Update extract-config.js Script

Modify the `package-tools/npm-package/scripts/extract-config.js` script to:

- Copy files from the package directory instead of the repository root
- Ensure files are overwritten in the target directory

Key changes:
- Replace the `repoRootDir` variable with a `sourceDir` variable that points to the package directory
- Update the file copying logic to use this `sourceDir` instead of `repoRootDir`
- Modify the `copyFileWithDir` function to overwrite existing files

## 4. Update index.js (Optional)

If needed, update the `package-tools/npm-package/index.js` file to expose the new functionality.

## 5. Update Test Script

Update the `package-tools/npm-package/test/test-extract.js` script to test the new functionality:

- Test that files are correctly copied from the package directory to the target directory
- Test that existing files are overwritten

## Testing Procedure

After implementing these changes, the following testing procedure should be followed:

1. Run `npm pack` in the npm-package directory to create a tarball
2. Extract the tarball to verify that it includes the `.clinerules-*` files and `.roo` directory
3. Install the tarball in a test project using `npm install path/to/tarball.tgz`
4. Verify that the `.clinerules-*` files and `.roo` directory are correctly copied to the test project root
5. Modify one of the copied files, then run `npx cline-rules-extract` to verify that it overwrites the modified file

## Expected Outcome

After implementing these changes:

1. The npm package will include all `.clinerules-*` files and the `.roo` directory from the repository root
2. When the package is installed in a project, these files will be correctly extracted to the project root, overwriting any existing files
3. The extraction will work both during installation and when manually running the `cline-rules-extract` command