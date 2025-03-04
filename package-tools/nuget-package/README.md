# Roo Code Memory Bank NuGet Package

This package contains configuration files for Cline that are automatically extracted to the root of your project during build.

## Contents

- `.clinerules-*` files: Configuration files for different Cline modes
- `.roo/` directory: System prompt files and other Cline-related configurations

## Installation

Install the package via NuGet Package Manager:

```
Install-Package rools
```

Or using the .NET CLI:

```
dotnet add package RooCodeMemoryBank
```

During the build process, the package will automatically extract all configuration files to the root of your project.

## How It Works

The package includes an MSBuild target that runs during the build process to extract the configuration files to your project's root directory. The extraction process:

1. Copies all `.clinerules-*` files to the project root
2. Copies the `.roo/` directory and its contents to the project root
3. Skips files that already exist (to preserve any local modifications)

## Creating and Packaging

To create and package the RooCodeMemoryBank NuGet package:

1. Update the configuration files in the `content/` directory as needed
2. Update the version in the `.csproj` file
3. Build and pack the project:

```
dotnet build
dotnet pack -c Release
```

This will create a `.nupkg` file in the `bin/Release/` directory.

## Publishing

To publish the package to NuGet:

1. Generate an API key from the NuGet website
2. Push the package:

```
dotnet nuget push bin/Release/RooCodeMemoryBank.1.0.0.nupkg -k YOUR_API_KEY -s https://api.nuget.org/v3/index.json
```

## Updating

When updating the package in your project:

```
dotnet add package RooCodeMemoryBank --version X.Y.Z
```

Or update via the NuGet Package Manager.

The updated configuration files will be extracted during the next build.

## Versioning

When making changes to the configuration files:

- **Patch version** (1.0.x): For minor changes or corrections that don't affect functionality
- **Minor version** (1.x.0): For new features or non-breaking changes
- **Major version** (x.0.0): For breaking changes that might require manual intervention

## Build Types

Different build types are available:

- **Latest stable release**: Standard NuGet package
- **Beta builds**: Prerelease packages with `-beta` suffix
- **Nightly builds**: Prerelease packages with `-nightly` suffix
- **Feature branch builds**: Prerelease packages with branch name in suffix

## Handling Conflicts

The extraction process uses `SkipUnchangedFiles="true"` to avoid overwriting existing files that have been modified locally. If you want to force an update of all configuration files, you can delete the existing files before building.

## License

MIT