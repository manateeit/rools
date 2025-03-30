# Roo Code Memory Bank: User Guide

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Integration with Development Workflow](#integration-with-development-workflow)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Introduction

The Roo Code Memory Bank is a powerful system designed to maintain project context across sessions and memory resets for consistent AI-assisted development. This guide will walk you through using the Roo Code Memory Bank system to enhance your development experience with Roo Code.

### What is Roo Code Memory Bank?

Roo Code Memory Bank serves as a long-term, structured persistent memory for Roo Code. While Roo Code has built-in features for preserving context within a single VS Code workspace session, the Memory Bank ensures that context persists across Roo's periodic memory resets and provides a framework for organized project knowledge.

### Key Benefits

- **Persistence Across Memory Resets**: Ensures your project context survives Roo Code's internal memory resets.
- **Long-Term Project Knowledge**: Creates a structured repository for capturing architectural decisions, technical context, and design patterns.
- **Mode-Based Workflow**: Defines clear workflows for utilizing Roo Code's different modes (Architect, Code, Ask, Debug).
- **Project-Specific Rules**: Implements project-specific rules and coding patterns with `.clinerules` files.

## Installation

### Installing via NPM

1. Open your terminal and navigate to your project directory.
2. Run the following command to install the Roo Code Memory Bank package:

```bash
npm install @automateeverything.cc/rools
```

3. The package will automatically extract configuration files to your project root during installation.

### Installing via NuGet (for .NET Projects)

1. Open your .NET project in Visual Studio or your preferred IDE.
2. Add the ClinerRules NuGet package using one of the following methods:
   - **Package Manager Console**: `Install-Package ClinerRules`
   - **dotnet CLI**: `dotnet add package ClinerRules`
   - **Visual Studio NuGet Package Manager**: Search for "ClinerRules" and install it.
3. The package will automatically extract configuration files to your project root during the next build.

## Basic Usage

### Managing System Variables

The Roo Code Memory Bank uses system variables to customize the behavior of Roo Code based on your environment. These variables are stored in system prompt files in the `.roo` directory.

#### Populating System Variables

To populate system variables with your current environment values:

```bash
node scripts/populate-system-vars.js
```

This script will:
1. Detect your current system environment (operating system, shell, directories, etc.).
2. Update all system prompt files in the `.roo` directory with these values.
3. Provide a summary of updated files.

#### Wiping System Variables

When preparing files for version control, you may want to clear the system variables:

```bash
node scripts/wipe-system-vars.js
```

This script will:
1. Clear all system variable values in system prompt files.
2. Preserve the structure of the files.

### Selecting Configuration Sets

The Roo Code Memory Bank allows you to switch between predefined configuration sets using the `select-rools-set` script:

```bash
node scripts/select-rools-set.js
```

This script will:
1. List available configuration sets in the `.rools` directory.
2. Prompt you to choose a set.
3. Deploy the selected configuration by copying its files to your project root.

## Integration with Development Workflow

### Using with Roo Code

The Roo Code Memory Bank works alongside Roo Code's built-in context features to provide a more robust solution for managing project knowledge:

1. **Install and Set Up**: Install the Memory Bank and populate system variables.
2. **Select Configuration Set**: Choose a configuration set that matches your project's needs.
3. **Begin Development**: Start using Roo Code with the enhanced context provided by the Memory Bank.
4. **Memory Reset Handling**: When Roo Code undergoes a memory reset, the Memory Bank ensures your project context is preserved.

### Mode-Based Workflows

The Memory Bank establishes explicit mode-based workflows for utilizing Roo Code's different modes:

#### Architect Mode

Use Architect Mode for high-level planning and architecture decisions:
1. Create and refine architecture documents.
2. Define system components and their relationships.
3. Make high-level design decisions.

The Memory Bank stores these architectural decisions in a structured format that persists across sessions.

#### Code Mode

Use Code Mode for implementing code based on the architecture:
1. Write code that follows the architectural decisions.
2. Refactor existing code to align with the architecture.
3. Implement new features.

The Memory Bank ensures that Roo Code understands the architectural context when writing or modifying code.

#### Ask Mode

Use Ask Mode for asking questions and getting information:
1. Ask about the project's architecture.
2. Get explanations of code or design decisions.
3. Request information about best practices.

The Memory Bank provides Roo Code with the context needed to give accurate and relevant answers.

#### Debug Mode

Use Debug Mode for debugging issues in the code:
1. Identify and fix bugs.
2. Optimize performance.
3. Resolve errors.

The Memory Bank ensures that Roo Code understands the project's structure and behavior when debugging.

## Advanced Features

### Creating Custom Configuration Sets

You can create custom configuration sets to match your project's specific needs:

1. Create a new directory in the `.rools` directory with a descriptive name.
2. Copy the system prompt files, `.clinerules-*` files, and `.roomodes` file that you want to include in the set.
3. Modify these files as needed.
4. Use the `select-rools-set.js` script to deploy your custom set.

### Using .clinerules Files

`.clinerules` files define project-specific rules and coding patterns:

1. Create a `.clinerules-<name>` file in your project root.
2. Define rules using the appropriate syntax.
3. Roo Code will automatically follow these rules when generating or modifying code.

Example `.clinerules` file:

```
# Project-specific rules

RULE: Use camelCase for variable names
RULE: Use PascalCase for class names
RULE: Use 2-space indentation
RULE: Maximum line length is 80 characters
```

### Using .roomodes Files

The `.roomodes` file defines custom modes for Roo Code:

1. Create a `.roomodes` file in your project root.
2. Define custom modes using the appropriate syntax.
3. Roo Code will make these modes available in addition to the standard modes.

Example `.roomodes` file:

```json
{
  "modes": [
    {
      "name": "Database",
      "slug": "database",
      "description": "Specialized mode for database design and queries",
      "systemPrompt": "You are a database expert..."
    },
    {
      "name": "UI",
      "slug": "ui",
      "description": "Specialized mode for UI design and implementation",
      "systemPrompt": "You are a UI/UX expert..."
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### System Variables Not Updating

**Issue**: Running `populate-system-vars.js` doesn't update system variables.

**Solution**:
1. Ensure the `.roo` directory exists in your project root.
2. Check that the system prompt files contain the system variables section.
3. Run the script with administrator/sudo privileges if necessary.

#### Configuration Set Not Deploying

**Issue**: Running `select-rools-set.js` doesn't deploy the selected configuration set.

**Solution**:
1. Ensure the `.rools` directory exists and contains configuration sets.
2. Check for file permission issues.
3. Run the script with administrator/sudo privileges if necessary.

#### NuGet Package Not Extracting Files

**Issue**: The ClinerRules NuGet package doesn't extract configuration files.

**Solution**:
1. Ensure the package is properly installed.
2. Rebuild the project to trigger the MSBuild target.
3. Check the build output for any errors.

### Getting Help

If you encounter issues not covered in this guide, you can:
- Check the [GitHub repository](https://github.com/jtalborough/rools) for updates and known issues.
- Open an issue on GitHub to report a bug or request help.
- Consult the [Roo Code documentation](https://github.com/RooVetGit/Roo-Code) for more information about Roo Code itself.

## FAQ

### General Questions

#### Q: How does the Memory Bank differ from Roo Code's built-in context features?

**A**: Roo Code's built-in features provide short-term and workspace-level context retention, enhancing the fluidity of your immediate coding session. The Memory Bank serves as Roo's long-term and structured persistent memory, ensuring consistent project understanding that endures across sessions and memory resets.

#### Q: Can I use the Memory Bank with other AI coding assistants?

**A**: The Memory Bank is specifically designed for Roo Code and may not work with other AI coding assistants without modification.

#### Q: How often should I update system variables?

**A**: You should update system variables whenever your environment changes (e.g., when moving to a new machine or changing your development setup).

### Technical Questions

#### Q: Can I manually edit system prompt files?

**A**: Yes, you can manually edit system prompt files to customize Roo Code's behavior. However, be careful not to break the structure of the files, especially the system variables section.

#### Q: How do I create a new configuration set?

**A**: Create a new directory in the `.rools` directory, copy the desired configuration files into it, and modify them as needed. Then use the `select-rools-set.js` script to deploy your new set.

#### Q: Can I use the Memory Bank in a team environment?

**A**: Yes, the Memory Bank is designed to work in team environments. You can commit the configuration files to version control (after wiping system variables) and each team member can populate their own system variables.

---

This user guide provides a comprehensive overview of the Roo Code Memory Bank system. For more detailed information about the system's architecture and implementation, refer to the [architecture.md](architecture.md) document.