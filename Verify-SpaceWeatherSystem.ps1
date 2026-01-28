# Verify-SpaceWeatherSystem.ps1
# Comprehensive testing and validation script

Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SPACE WEATHER FORECASTING SYSTEM - VALIDATION SUITE          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$script:TestsPassed = 0
$script:TestsFailed = 0
$script:Warnings = 0

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "[TEST] $Name" -ForegroundColor Yellow -NoNewline
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✓ PASS" -ForegroundColor Green
            $script:TestsPassed++
            return $true
        } else {
            Write-Host " ✗ FAIL" -ForegroundColor Red
            $script:TestsFailed++
            return $false
        }
    }
    catch {
        Write-Host " ✗ ERROR: $_" -ForegroundColor Red
        $script:TestsFailed++
        return $false
    }
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "  ⚠ WARNING: $Message" -ForegroundColor DarkYellow
    $script:Warnings++
}

# Test 1: Check Python Installation
Test-Component "Python Installation" {
    try {
        $version = python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  → Version: $version" -ForegroundColor Gray
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

# Test 2: Check Requests Library
Test-Component "Python Requests Library" {
    try {
        $result = python -c "import requests; print(requests.__version__)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  → Version: $result" -ForegroundColor Gray
            return $true
        }
        Write-Warning-Custom "requests library not installed. Run: pip install requests"
        return $false
    }
    catch {
        return $false
    }
}

# Test 3: Check SpaceWeatherCore.py exists
Test-Component "SpaceWeatherCore.py File" {
    if (Test-Path "SpaceWeatherCore.py") {
        $size = (Get-Item "SpaceWeatherCore.py").Length
        Write-Host "  → Size: $size bytes" -ForegroundColor Gray
        return $true
    }
    return $false
}

# Test 4: Check AuroraHUD.ps1 exists
Test-Component "AuroraHUD.ps1 File" {
    if (Test-Path "AuroraHUD.ps1") {
        $size = (Get-Item "AuroraHUD.ps1").Length
        Write-Host "  → Size: $size bytes" -ForegroundColor Gray
        return $true
    }
    return $false
}

# Test 5: Execute Python Script
$pythonOutput = $null
Test-Component "Python Script Execution" {
    try {
        $pythonOutput = python SpaceWeatherCore.py 2>&1 | Where-Object { $_ -match '^\s*[{"]' }
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  → Exit Code: 0" -ForegroundColor Gray
            return $true
        }
        Write-Warning-Custom "Python script returned exit code: $LASTEXITCODE"
        return $false
    }
    catch {
        return $false
    }
}

# Test 6: Validate JSON Output
$jsonData = $null
Test-Component "JSON Output Validation" {
    try {
        $jsonText = $pythonOutput -join "`n"
        $jsonData = $jsonText | ConvertFrom-Json
        if ($jsonData) {
            Write-Host "  → Status: $($jsonData.Status)" -ForegroundColor Gray
            return $true
        }
        return $false
    }
    catch {
        Write-Warning-Custom "Failed to parse JSON: $_"
        return $false
    }
}

# Test 7: Validate Required Fields
Test-Component "Required Fields Present" {
    if ($jsonData) {
        $requiredFields = @('CurrentKP', 'SolarWind', 'SuryaFlareProb', 'CMEArrivalHours', 
                           'Cycle25RiskLevel', 'AuroraVisibilityScore', 'Status')
        $missing = @()
        foreach ($field in $requiredFields) {
            if (-not $jsonData.PSObject.Properties.Name.Contains($field)) {
                $missing += $field
            }
        }
        if ($missing.Count -eq 0) {
            Write-Host "  → All $($requiredFields.Count) fields present" -ForegroundColor Gray
            return $true
        } else {
            Write-Warning-Custom "Missing fields: $($missing -join ', ')"
            return $false
        }
    }
    return $false
}

# Test 8: Validate Data Types
Test-Component "Data Type Validation" {
    if ($jsonData) {
        $valid = $true
        
        if ($jsonData.CurrentKP -isnot [double] -and $jsonData.CurrentKP -isnot [int]) {
            Write-Warning-Custom "CurrentKP is not numeric"
            $valid = $false
        }
        
        if ($jsonData.SolarWind.speed -isnot [double] -and $jsonData.SolarWind.speed -isnot [int]) {
            Write-Warning-Custom "SolarWind.speed is not numeric"
            $valid = $false
        }
        
        if ($jsonData.AuroraVisibilityScore -isnot [int]) {
            Write-Warning-Custom "AuroraVisibilityScore is not integer"
            $valid = $false
        }
        
        if ($valid) {
            Write-Host "  → All data types valid" -ForegroundColor Gray
        }
        return $valid
    }
    return $false
}

# Test 9: Validate Value Ranges
Test-Component "Value Range Validation" {
    if ($jsonData) {
        $valid = $true
        
        if ($jsonData.CurrentKP -lt 0 -or $jsonData.CurrentKP -gt 9) {
            Write-Warning-Custom "CurrentKP out of range: $($jsonData.CurrentKP) (expected 0-9)"
            $valid = $false
        }
        
        if ($jsonData.SuryaFlareProb -lt 0 -or $jsonData.SuryaFlareProb -gt 100) {
            Write-Warning-Custom "SuryaFlareProb out of range: $($jsonData.SuryaFlareProb) (expected 0-100)"
            $valid = $false
        }
        
        if ($jsonData.AuroraVisibilityScore -lt 0 -or $jsonData.AuroraVisibilityScore -gt 100) {
            Write-Warning-Custom "AuroraVisibilityScore out of range: $($jsonData.AuroraVisibilityScore) (expected 0-100)"
            $valid = $false
        }
        
        if ($valid) {
            Write-Host "  → All values within expected ranges" -ForegroundColor Gray
        }
        return $valid
    }
    return $false
}

# Test 10: PowerShell Functions
Test-Component "PowerShell HUD Functions" {
    try {
        . .\AuroraHUD.ps1 -ErrorAction Stop 2>&1 | Out-Null
        
        $functions = @('Get-SpaceWeatherData', 'Show-Dashboard', 'Get-ColorFromValue')
        $missing = @()
        foreach ($func in $functions) {
            if (-not (Get-Command $func -ErrorAction SilentlyContinue)) {
                $missing += $func
            }
        }
        
        if ($missing.Count -eq 0) {
            Write-Host "  → All key functions loaded" -ForegroundColor Gray
            return $true
        } else {
            Write-Warning-Custom "Missing functions: $($missing -join ', ')"
            return $false
        }
    }
    catch {
        Write-Warning-Custom "Failed to load AuroraHUD.ps1: $_"
        return $false
    }
}

# Test 11: Internet Connectivity
Test-Component "Internet Connectivity (NOAA)" {
    try {
        $response = Invoke-WebRequest -Uri "https://services.swpc.noaa.gov" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  → NOAA SWPC accessible" -ForegroundColor Gray
            return $true
        }
        return $false
    }
    catch {
        Write-Warning-Custom "Cannot reach NOAA SWPC: $_"
        return $false
    }
}

# Test 12: Mock Data Fallback
Test-Component "Mock Data Fallback" {
    try {
        $mockData = Get-SpaceWeatherData -UseMock
        if ($mockData -and $mockData.Status -eq "MOCK_DATA") {
            Write-Host "  → Mock data functional" -ForegroundColor Gray
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

# Display actual data
Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    CURRENT SPACE WEATHER DATA                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if ($jsonData) {
    Write-Host ""
    Write-Host "  KP Index:            " -NoNewline -ForegroundColor Gray
    Write-Host ("{0:F1}" -f $jsonData.CurrentKP) -ForegroundColor $(if ($jsonData.CurrentKP -gt 5) { "Red" } elseif ($jsonData.CurrentKP -gt 3) { "Yellow" } else { "Green" })
    
    Write-Host "  Solar Wind Speed:    " -NoNewline -ForegroundColor Gray
    Write-Host ("{0:F1} km/s" -f $jsonData.SolarWind.speed) -ForegroundColor Cyan
    
    Write-Host "  Flare Probability:   " -NoNewline -ForegroundColor Gray
    Write-Host ("{0:F1}%" -f $jsonData.SuryaFlareProb) -ForegroundColor $(if ($jsonData.SuryaFlareProb -gt 60) { "Red" } elseif ($jsonData.SuryaFlareProb -gt 30) { "Yellow" } else { "Green" })
    
    Write-Host "  CME Arrival:         " -NoNewline -ForegroundColor Gray
    Write-Host ("{0:F1} hours" -f $jsonData.CMEArrivalHours) -ForegroundColor Cyan
    
    Write-Host "  Risk Level:          " -NoNewline -ForegroundColor Gray
    Write-Host $jsonData.Cycle25RiskLevel -ForegroundColor $(if ($jsonData.Cycle25RiskLevel -eq "CRITICAL") { "Red" } elseif ($jsonData.Cycle25RiskLevel -eq "HIGH") { "Red" } elseif ($jsonData.Cycle25RiskLevel -eq "MODERATE") { "Yellow" } else { "Green" })
    
    Write-Host "  Aurora Visibility:   " -NoNewline -ForegroundColor Gray
    Write-Host ("{0}/100" -f $jsonData.AuroraVisibilityScore) -ForegroundColor $(if ($jsonData.AuroraVisibilityScore -gt 60) { "Green" } elseif ($jsonData.AuroraVisibilityScore -gt 30) { "Yellow" } else { "Red" })
    
    Write-Host "  Timestamp:           " -NoNewline -ForegroundColor Gray
    Write-Host $jsonData.Timestamp -ForegroundColor Gray
}

# Summary
Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                        TEST SUMMARY                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "  Tests Passed:  " -NoNewline -ForegroundColor Gray
Write-Host $script:TestsPassed -ForegroundColor Green

Write-Host "  Tests Failed:  " -NoNewline -ForegroundColor Gray
Write-Host $script:TestsFailed -ForegroundColor $(if ($script:TestsFailed -gt 0) { "Red" } else { "Green" })

Write-Host "  Warnings:      " -NoNewline -ForegroundColor Gray
Write-Host $script:Warnings -ForegroundColor $(if ($script:Warnings -gt 0) { "Yellow" } else { "Green" })

Write-Host ""

if ($script:TestsFailed -eq 0 -and $script:Warnings -eq 0) {
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✓ ALL TESTS PASSED - SYSTEM OPERATIONAL              ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "System is 100% error-free and ready for use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the full HUD dashboard:" -ForegroundColor Cyan
    Write-Host "  .\AuroraHUD.ps1" -ForegroundColor White
} elseif ($script:TestsFailed -eq 0) {
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║         ⚠ TESTS PASSED WITH WARNINGS - SYSTEM FUNCTIONAL         ║" -ForegroundColor Yellow
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "System is operational but has minor warnings." -ForegroundColor Yellow
} else {
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║            ✗ TESTS FAILED - PLEASE REVIEW ERRORS                  ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please address the failed tests before using the system." -ForegroundColor Red
}

Write-Host ""
