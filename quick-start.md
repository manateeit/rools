# Roo Code Memory Bank: Quick Start Guide

This quick start guide provides a concise overview of the essential features of the Roo Code Memory Bank system, helping you get up and running quickly.

## What is Roo Code Memory Bank?

Roo Code Memory Bank is a system that maintains project context across sessions and memory resets for consistent AI-assisted development with Roo Code. It serves as Roo's long-term memory, ensuring your project knowledge persists.

## Installation

### NPM (JavaScript/Node.js Projects)

```bash
npm install @automateeverything.cc/rools
```

The package automatically extracts configuration files to your project root.

### NuGet (.NET Projects)

```bash
dotnet add package ClinerRules
```

Or via Package Manager Console:

```
Install-Package ClinerRules
```

Configuration files are extracted during the next build.

## Essential Commands

### Populate System Variables

Updates system prompt files with your current environment:

```bash
node scripts/populate-system-vars.js
```

### Select Configuration Set

Switch between predefined configuration sets:

```bash
node scripts/select-rools-set.js
```

### Wipe System Variables (for version control)

Clears system variables before committing to version control:

```bash
node scripts/wipe-system-vars.js
```

## Basic Workflow

1. **Install** the Memory Bank package
2. **Populate** system variables
3. **Select** a configuration set
4. **Begin development** with Roo Code
5. When Roo undergoes a memory reset, the Memory Bank **provides context**
6. Before committing to version control, **wipe** system variables

## Mode-Based Development

The Memory Bank supports Roo Code's different modes:

- **Architect Mode**: High-level planning and architecture decisions
- **Code Mode**: Implementing code based on the architecture
- **Ask Mode**: Asking questions and getting information
- **Debug Mode**: Debugging issues in the code

## Next Steps

- Read the [User Guide](user-guide.md) for detailed instructions
- Explore the [Architecture Document](architecture.md) for technical details
- Create custom configuration sets in the `.rools` directory
- Define project-specific rules with `.clinerules-*` files
- Create custom modes with the `.roomodes` file

## Quick Reference

| File/Directory | Purpose |
|----------------|---------|
| `.roo/` | Contains system prompt files |
| `.clinerules-*` | Defines project-specific rules |
| `.roomodes` | Defines custom modes |
| `.rools/` | Contains configuration sets |
| `scripts/` | Contains utility scripts |

## Common Issues

- If system variables aren't updating, ensure the `.roo` directory exists
- If configuration sets aren't deploying, check for file permission issues
- For NuGet package issues, rebuild the project to trigger the MSBuild target