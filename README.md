<div align="center">

# rools

**rools System for roo code custom prompts**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://github.com/RooVetGit/Roo-Code)
[![npm package](https://img.shields.io/badge/npm-rools-brightgreen)](https://www.npmjs.com/package/@automateeverything.cc/rools)

</div>

## 🎯 Overview

rools implements the **.roo file standard** for persistent AI context management. This structured memory system ensures consistent project understanding across development sessions with:
- **Configuration Management**: Easily switch between predefined configuration sets using the `select-rools-set` CLI tool
- Technical decision tracking with rationale
- Automated progress monitoring
- Cross-referenced project knowledge

## 🚀 Quick Start

### 1. Install rools Package
```bash
npm install @automateeverything.cc/rools
```
This command installs the `rools` package which automatically extracts configuration files to your project root. Existing files with matching names will be overwritten.

### 2. Deploy Configuration Set
Use the `select-rools-set` script to deploy a configuration set:
```bash
node package-tools/npm-package/scripts/select-rools-set.js
```
This will prompt you to choose from available sets in the `.rools` directory and deploy the selected configuration.

### 3. Configure Custom Instructions
[Add custom instructions here]

## 📦 Distribution & Installation
Install the `rools` package via npm:
```bash
npm install @automateeverything.cc/rools
```

Update the package using:
```bash
npm install @automateeverything.cc/rools
```

The package automatically extracts configuration files to your project root during installation/updates. Existing files with matching names will be overwritten.

## 🛠️ System Prompts and Utilities

### System Prompt Files
The `.roo` directory contains system prompt files that define the behavior of Roo's different modes:
```
.roo/
├── example-system-prompt
├── system-prompt-architect
├── system-prompt-ask
├── system-prompt-code
└── system-prompt-debug
```

These files contain system variables that are used by Roo to understand your environment:

| Variable | Description |
|----------|-------------|
| `CURRENT_WORKING_DIRECTORY` | The current working directory of your project |
| `HOME_DIRECTORY` | Your home directory path |
| `GLOBAL_CUSTOM_MODES_PATH` | Path to global custom modes configuration |
| `OPERATING_SYSTEM` | Your operating system |
| `DEFAULT_SHELL` | Your default shell |

### Utility Scripts

The `scripts` directory contains utilities for managing system prompt files:
```
scripts/
├── populate-system-vars.js
├── wipe-system-vars.js
└── select-rools-set.js
```

#### Populate System Variables
The `populate-system-vars.js` script automatically populates system variables in all system prompt files:
```bash
node scripts/populate-system-vars.js
```

This script:
- Detects your current system environment
- Updates all system-prompt files in the `.roo` directory
- Provides a summary of updated files

#### Wipe System Variables
The `wipe-system-vars.js` script removes values from system variables in all system prompt files:
```bash
node scripts/wipe-system-vars.js
```

This script:
- Clears all system variable values in system-prompt files
- Useful for preparing files for version control
- Preserves the structure of the files

#### Select Rools Set
The `select-rools-set.js` script allows you to select and deploy configuration sets from the `.rools` directory:
```bash
node scripts/select-rools-set.js
```

This script:
- Lists available configuration sets
- Cleans the target directory
- Copies the selected set's files to the project root
- Handles both directories and files

---
<div align="center">

**[View on GitHub](https://github.com/GreatScottyMac/roo-code-memory-bank) • [Report Issues](https://github.com/GreatScottyMac/roo-code-memory-bank/issues) • [Get Roo Code](https://github.com/RooVetGit/Roo-Code)**

</div>

## Credits 
Huge shoutout to [GreatScottyMac](LICENSE) for the initial seed
## License

Apache 2.0 © 2025
