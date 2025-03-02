# Cline Rules Package Developer Guide

This guide provides detailed instructions for developers working with the Cline Rules packages for both NPM and NuGet ecosystems.

## Table of Contents

1. [NPM Package](#npm-package)
   - [Publishing](#publishing-npm)
   - [Consuming](#consuming-npm)
   - [Updating](#updating-npm)
   - [Troubleshooting](#troubleshooting-npm)

2. [NuGet Package](#nuget-package)
   - [Publishing](#publishing-nuget)
   - [Consuming](#consuming-nuget)
   - [Updating](#updating-nuget)
   - [Troubleshooting](#troubleshooting-nuget)

3. [Versioning Strategy](#versioning-strategy)
4. [Handling File Conflicts](#handling-file-conflicts)
5. [Continuous Integration and Deployment](#continuous-integration-and-deployment)
6. [Best Practices](#best-practices)

---

## NPM Package

The NPM package (`cline-rules`) contains configuration files that are automatically extracted to the root of consuming projects during installation.

### Publishing NPM

To publish the NPM package:

1. Navigate to the npm-package directory:
   ```bash
   cd package-tools/npm-package
   ```

2. Update the configuration files as needed:
   - `.clinerules-*` files
   - `.roo/` directory contents

3. Update the version in `package.json` following semantic versioning:
   ```json
   {
     "version": "1.0.0"
   }
   ```

4. Login to npm (if not already logged in):
   ```bash
   npm login
   ```

5. Publish the package:
   ```bash
   npm publish
   ```

### Consuming NPM

To use the NPM package in a project:

1. Install the package:
   ```bash
   npm install cline-rules
   ```

2. The configuration files will be automatically extracted to the project root during installation.

3. If you need to manually extract the files (e.g., after updating):
   ```bash
   npx cline-rules-extract
   ```

   You can also specify a target directory:
   ```bash
   npx cline-rules-extract /path/to/target/directory
   ```

4. For programmatic use:
   ```javascript
   const clinerRules = require('cline-rules');
   
   // Extract to current directory
   clinerRules.extractConfigFiles();
   
   // Or specify a target directory
   clinerRules.extractConfigFiles('/path/to/target/directory');
   ```

### Updating NPM

To update the package in a project:

1. Update the package:
   ```bash
   npm update cline-rules
   ```

2. The updated configuration files will be automatically extracted during the update.

3. If the automatic extraction doesn't work, run:
   ```bash
   npx cline-rules-extract
   ```

### Troubleshooting NPM

- **Files not extracted**: Check if the postinstall script ran successfully. You can manually run `npx cline-rules-extract`.
- **Permission issues**: Ensure you have write permissions to the project root directory.
- **Conflicts with existing files**: The extraction script will not overwrite existing files. Delete the existing files if you want to force an update.

---

## NuGet Package

The NuGet package (`ClinerRules`) contains configuration files that are automatically extracted to the root of consuming projects during build.

### Publishing NuGet

To publish the NuGet package:

1. Navigate to the nuget-package directory:
   ```bash
   cd package-tools/nuget-package
   ```

2. Update the configuration files as needed:
   - `content/.clinerules-*` files
   - `content/.roo/` directory contents

3. Update the version in `ClinerRules.csproj`:
   ```xml
   <Version>1.0.0</Version>
   ```

4. Build and pack the project:
   ```bash
   dotnet build
   dotnet pack -c Release
   ```

5. Publish to NuGet:
   ```bash
   dotnet nuget push bin/Release/ClinerRules.1.0.0.nupkg -k YOUR_API_KEY -s https://api.nuget.org/v3/index.json
   ```

### Consuming NuGet

To use the NuGet package in a project:

1. Install the package via NuGet Package Manager:
   ```
   Install-Package ClinerRules
   ```

   Or using the .NET CLI:
   ```bash
   dotnet add package ClinerRules
   ```

2. The configuration files will be automatically extracted to the project root during build.

### Updating NuGet

To update the package in a project:

1. Update the package via NuGet Package Manager or .NET CLI:
   ```bash
   dotnet add package ClinerRules --version X.Y.Z
   ```

2. The updated configuration files will be extracted during the next build.

### Troubleshooting NuGet

- **Files not extracted**: Check the build output for any errors related to the extraction process.
- **Permission issues**: Ensure the build process has write permissions to the project root directory.
- **Conflicts with existing files**: The extraction process will not overwrite existing files that have been modified. Delete the existing files if you want to force an update.

---

## Versioning Strategy

Follow semantic versioning for both packages:

- **Patch version** (1.0.x): For minor changes or corrections that don't affect functionality
- **Minor version** (1.x.0): For new features or non-breaking changes
- **Major version** (x.0.0): For breaking changes that might require manual intervention

Always update both packages to the same version to maintain consistency.

## Handling File Conflicts

Both packages are designed to preserve existing files to avoid overwriting local modifications:

- **NPM package**: The extraction script checks if files exist before copying.
- **NuGet package**: The MSBuild target uses `SkipUnchangedFiles="true"` to avoid overwriting existing files.

If you want to force an update of all configuration files, you can delete the existing files before updating the package.

## Continuous Integration and Deployment

This repository includes a GitHub Actions workflow for automated building, testing, and publishing of both packages. The workflow is defined in the root of the repository at `.github/workflows/build-packages.yml` and provides:

### Features

- **Continuous Integration**: Builds and tests both packages on multiple operating systems and runtime versions
- **Artifact Generation**: Creates package artifacts for each build configuration
- **Automated Publishing**: Publishes packages to NPM and NuGet when a GitHub release is created
- **Documentation Updates**: Automatically updates version references in documentation files

### Setup

To use the GitHub Actions workflow:

1. Ensure your repository has the `.github/workflows/build-packages.yml` file at the root of the repository
2. Set up the required secrets in your GitHub repository:
   - `NPM_TOKEN`: Your NPM authentication token
   - `NUGET_API_KEY`: Your NuGet API key

### Usage

The workflow runs automatically on:
- Push to any branch (development builds)
- Pull requests to the main branch
- Creation of a new release

For automated publishing:

1. Create a new release in GitHub with the appropriate version tag (e.g., `v1.0.0`)
2. The workflow will automatically:
   - Build and test both packages on multiple platforms
   - Publish the packages to NPM and NuGet
   - Update version references in documentation

### Customization

You can customize the workflow by editing the `.github/workflows/build-packages.yml` file:
- Add or remove operating systems or runtime versions in the matrix strategy
- Modify the build, test, or publish steps
- Add additional jobs or steps as needed

## Best Practices

1. **Keep packages in sync**: Ensure both NPM and NuGet packages contain the same configuration files.
2. **Document changes**: Maintain a changelog to help users understand what has changed between versions.
3. **Test before publishing**: Test the packages locally before publishing to ensure the extraction process works correctly.
4. **Provide migration guides**: For major version updates, provide migration guides to help users transition smoothly.
5. **Use CI/CD**: Leverage the GitHub Actions workflow for consistent builds and automated publishing.
6. **Version consistently**: Use the same version number for both packages to maintain consistency.
7. **Monitor issues**: Regularly check for issues reported by users and address them promptly.