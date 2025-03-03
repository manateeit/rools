# Roo Code Memory Bank

This package contains configuration files for Cline that are automatically extracted to the root of your project during installation.

## Contents

- `.clinerules-*` files: Configuration files for different Cline modes
- `.roo/` directory: System prompt files and other Cline-related configurations

## Installation

```bash
npm install @automateeverything.cc/roo-code-memory-bank
```

During installation, the package will automatically extract all configuration files to the root of your project.

## Manual Extraction

If you need to manually extract the configuration files (e.g., after updating the package), you can run:

```bash
npx cline-rules-extract
```

You can also specify a target directory:

```bash
npx cline-rules-extract /path/to/target/directory
```

## Programmatic API

You can also use the package programmatically:

```javascript
const clinerRules = require('@automateeverything.cc/roo-code-memory-bank');

// Extract to current directory
clinerRules.extractConfigFiles();

// Or specify a target directory
clinerRules.extractConfigFiles('/path/to/target/directory');
```

## Publishing

If you're maintaining this package and need to publish updates:

1. Update the configuration files as needed
2. Update the version in `package.json`
3. Publish to npm:

```bash
npm publish
```

## Updating

When updating the package in your project:

```bash
npm update @automateeverything.cc/roo-code-memory-bank
```

The updated configuration files will be automatically extracted during the update process.

## Versioning

When making changes to the configuration files:

- **Patch version** (1.0.x): For minor changes or corrections that don't affect functionality
- **Minor version** (1.x.0): For new features or non-breaking changes
- **Major version** (x.0.0): For breaking changes that might require manual intervention

## Build Types

Different build types are available:

- **Latest stable release**: `npm install @automateeverything.cc/roo-code-memory-bank`
- **Beta builds** (from main branch): `npm install @automateeverything.cc/roo-code-memory-bank@beta`
- **Nightly builds**: `npm install @automateeverything.cc/roo-code-memory-bank@nightly`
- **Feature branch builds**: `npm install @automateeverything.cc/roo-code-memory-bank@dev-feature-branch`
- **Pull request builds**: `npm install @automateeverything.cc/roo-code-memory-bank@pr-123`

## Handling Conflicts

The extraction process will not overwrite existing files by default. If you've made local modifications to the configuration files, they will be preserved.

If you want to force an update of all configuration files, you can delete the existing files before updating the package.

## License

MIT