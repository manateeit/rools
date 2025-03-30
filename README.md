<div align="center">

# Roo Code Memory Bank

**Maintain Project Context Across Sessions and Memory Resets for Consistent AI-Assisted Development**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://github.com/RooVetGit/Roo-Code)
[![npm package](https://img.shields.io/badge/npm-roo--code--memory--bank-brightgreen)](https://github.com/GreatScottyMac/roo-code-memory-bank)

</div>

## 🎯 Overview

The Roo Code Memory Bank is a system designed to maintain project context across sessions and memory resets for consistent AI-assisted development. It works alongside Roo Code's built-in context features to provide a more robust solution for managing project knowledge and ensuring consistent AI assistance.

Key features:
- **Persistence Across Memory Resets**: Ensures your project context survives Roo Code's internal memory resets
- **Long-Term Project Knowledge**: Creates a structured repository for capturing architectural decisions and technical context
- **Mode-Based Workflow**: Defines clear workflows for utilizing Roo Code's different modes (Architect, Code, Ask, Debug)
- **Project-Specific Rules**: Implements project-specific rules and coding patterns with `.clinerules` files
## 🚀 Quick Start

### 1. Installation
```bash
npm install roo-code-memory-bank
```

### 2. Populate System Variables
```bash
npm run populate
```
This script detects your current system environment and updates all system prompt files in the `.roo` directory.

### 3. Select Configuration Set
```bash
npm run select
```
This script prompts you to choose from available sets in the `.rools` directory and deploys the selected configuration.

### 4. Start Using with Roo Code
Once you've installed and configured the Memory Bank, you can start using Roo Code with enhanced context persistence. The Memory Bank will ensure your project context survives across sessions and memory resets.

## 📦 Programmatic Usage
You can also use the Memory Bank programmatically in your Node.js scripts:

```javascript
const memoryBank = require('roo-code-memory-bank');

// Populate system variables
memoryBank.populateSystemVariables();

// List available configuration sets
const sets = memoryBank.listConfigurationSets();
console.log('Available sets:', sets);

// Select and deploy a configuration set
memoryBank.selectConfigurationSet('set1');

// Wipe system variables (for version control)
memoryBank.wipeSystemVariables();
```

## 🛠️ Components and Files

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

Each file contains sections for:
- Introduction - What the AI assistant is and its capabilities
- Guidelines - How the AI should behave and respond
- Context - Information about the project and environment
- System Variables - Environment-specific variables

### Configuration Files

| File | Purpose |
|------|---------|
| `.clinerules-*` | Define project-specific rules and coding patterns |
| `.roomodes` | Define custom modes for Roo Code |
| `.rools/` | Directory containing configuration sets |

### NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run populate` | Populate system variables in system prompt files |
| `npm run wipe` | Clear system variables (for version control) |
| `npm run select` | Select and deploy a configuration set |

## 📚 Documentation

For more detailed information, refer to the following documentation:

- [Architecture Document](architecture.md) - Technical overview of the system's components
- [User Guide](user-guide.md) - Comprehensive instructions for using the system
- [Quick Start Guide](quick-start.md) - Concise overview of essential features

## 🔄 Integration with Roo Code

The Memory Bank complements Roo Code's built-in context features:

- **Roo Code's built-in features**: Provide short-term and workspace-level context retention
- **Memory Bank**: Serves as Roo's long-term and structured persistent memory

By using them together, you unlock a truly powerful and robust development workflow.

---
<div align="center">

**[View on GitHub](https://github.com/GreatScottyMac/roo-code-memory-bank) • [Report Issues](https://github.com/GreatScottyMac/roo-code-memory-bank/issues) • [Get Roo Code](https://github.com/RooVetGit/Roo-Code)**

</div>

## Credits
Huge shoutout to [GreatScottyMac](https://github.com/GreatScottyMac) for the initial seed.

## License

Apache 2.0 © 2025
