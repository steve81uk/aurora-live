# Test-AuroraHUD.ps1 - Test the HUD display once

# Set console to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Source the main functions from AuroraHUD.ps1
. .\AuroraHUD.ps1

# Get test data
Write-Host "Fetching space weather data..." -ForegroundColor Cyan
$testData = Get-SpaceWeatherData

# Display the dashboard once
Show-Dashboard -Data $testData

Write-Host "`n`nTest completed successfully!" -ForegroundColor Green
Write-Host "To run the full auto-refreshing HUD, execute: .\AuroraHUD.ps1" -ForegroundColor Yellow
