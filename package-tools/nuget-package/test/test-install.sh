#!/bin/bash

# Test script for the ClinerRules NuGet package
# This script demonstrates how to install and use the package in a .NET project

# Configuration
TEST_PROJECT_NAME="ClinerRulesTest"
TEST_PROJECT_DIR="$(dirname "$0")/$TEST_PROJECT_NAME"
PACKAGE_VERSION="1.0.0"

# Create a test directory if it doesn't exist
if [ ! -d "$TEST_PROJECT_DIR" ]; then
    mkdir -p "$TEST_PROJECT_DIR"
    echo "Created test directory: $TEST_PROJECT_DIR"
fi

# Navigate to the test directory
pushd "$TEST_PROJECT_DIR" > /dev/null

# Create a new console application
echo "Creating new .NET console application..."
dotnet new console

# Add the ClinerRules package
# Note: In a real scenario, you would use the published package from NuGet
# For testing, we'll use a local package reference
echo "Adding ClinerRules package reference..."

# Build and pack the ClinerRules package
pushd "$(dirname "$0")/.." > /dev/null
dotnet build
dotnet pack -c Release
PACKAGE_PATH=$(find "$(pwd)/bin/Release" -name "ClinerRules.$PACKAGE_VERSION.nupkg" | head -n 1)
PACKAGE_DIR=$(dirname "$PACKAGE_PATH")
popd > /dev/null

# Add the package reference
dotnet add package ClinerRules --source "$PACKAGE_DIR" --version $PACKAGE_VERSION

# Build the project to trigger the extraction
echo "Building the project to trigger extraction..."
dotnet build

# List the extracted files
echo -e "\nExtracted files in project root:"
for file in $(find "$TEST_PROJECT_DIR" -maxdepth 1 -name ".clinerules-*" -o -name ".roo"); do
    if [ -d "$file" ]; then
        echo "- $(basename "$file") (directory)"
        for subfile in $(find "$file" -maxdepth 1 -type f); do
            echo "  - $(basename "$subfile")"
        done
    else
        echo "- $(basename "$file")"
    fi
done

echo -e "\nTest completed successfully!"

# Return to the original directory
popd > /dev/null