# Test script for the ClinerRules NuGet package
# This script demonstrates how to install and use the package in a .NET project

# Configuration
$testProjectName = "ClinerRulesTest"
$testProjectDir = Join-Path $PSScriptRoot $testProjectName
$packageVersion = "1.0.0"

# Create a test directory if it doesn't exist
if (-not (Test-Path $testProjectDir)) {
    New-Item -ItemType Directory -Path $testProjectDir | Out-Null
    Write-Host "Created test directory: $testProjectDir"
}

# Navigate to the test directory
Push-Location $testProjectDir

try {
    # Create a new console application
    Write-Host "Creating new .NET console application..."
    dotnet new console

    # Add the ClinerRules package
    # Note: In a real scenario, you would use the published package from NuGet
    # For testing, we'll use a local package reference
    Write-Host "Adding ClinerRules package reference..."
    
    # Build and pack the ClinerRules package
    Push-Location (Join-Path $PSScriptRoot "..")
    dotnet build
    dotnet pack -c Release
    $packagePath = Resolve-Path (Join-Path "bin/Release" "ClinerRules.$packageVersion.nupkg")
    Pop-Location
    
    # Add the package reference
    dotnet add package ClinerRules --source (Split-Path $packagePath -Parent) --version $packageVersion
    
    # Build the project to trigger the extraction
    Write-Host "Building the project to trigger extraction..."
    dotnet build
    
    # List the extracted files
    Write-Host "`nExtracted files in project root:"
    Get-ChildItem -Path $testProjectDir -Hidden | Where-Object { $_.Name -like ".clinerules-*" -or $_.Name -eq ".roo" } | ForEach-Object {
        if ($_.PSIsContainer) {
            Write-Host "- $($_.Name) (directory)"
            Get-ChildItem -Path $_.FullName | ForEach-Object {
                Write-Host "  - $($_.Name)"
            }
        } else {
            Write-Host "- $($_.Name)"
        }
    }
    
    Write-Host "`nTest completed successfully!"
} finally {
    # Return to the original directory
    Pop-Location
}