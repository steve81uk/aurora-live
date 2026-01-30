# AuroraHUD.ps1 - Space Weather Dashboard
# Full-screen PowerShell interface for space weather monitoring
# Add this to the very top line of AuroraHUD.ps1
[Console]::TreatControlCAsInput = $false

# Set console to UTF-8 for proper character rendering
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Global configuration
$script:RefreshInterval = 300  # 5 minutes
$script:PythonScript = "SpaceWeatherCore.py"
$script:LastData = $null
$script:AnimationFrame = 0

# Mock data for fallback
$script:MockData = @{
    CurrentKP = 3.5
    SolarWind = @{
        speed = 450.0
        density = 6.5
        bz = -2.3
        bt = 5.8
    }
    SuryaFlareProb = 25.0
    CMEArrivalHours = 48.5
    Cycle25RiskLevel = "MODERATE"
    AuroraVisibilityScore = 45
    XRayClass = "C"
    Timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    Status = "MOCK_DATA"
}

function Initialize-Console {
    <#
    .SYNOPSIS
    Initialize console for full-screen display
    #>
    Clear-Host
    $Host.UI.RawUI.WindowTitle = "AURORA COMMAND - Space Weather HUD"
    
    # Try to maximize window
    try {
        $signature = @"
[DllImport("user32.dll")]
public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
"@
        $type = Add-Type -MemberDefinition $signature -Name Window -Namespace Win32 -PassThru
        $hwnd = (Get-Process -Id $PID).MainWindowHandle
        $type::ShowWindow($hwnd, 3) | Out-Null  # 3 = SW_MAXIMIZE
    }
    catch {
        Write-Verbose "Could not maximize window: $_"
    }
    
    # Hide cursor
    [Console]::CursorVisible = $false
}

function Get-SpaceWeatherData {
    <#
    .SYNOPSIS
    Execute Python script and retrieve space weather data
    #>
    param(
        [switch]$UseMock
    )
    
    if ($UseMock) {
        return $script:MockData
    }
    
    try {
        # Check if Python script exists
        if (-not (Test-Path $script:PythonScript)) {
            Write-Warning "Python script not found: $script:PythonScript"
            return $script:MockData
        }
        
        # Try to find Python
        $pythonCmd = $null
        foreach ($cmd in @('python', 'python3', 'py')) {
            try {
                $result = & $cmd --version 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $pythonCmd = $cmd
                    break
                }
            }
            catch {
                continue
            }
        }
        
        if (-not $pythonCmd) {
            Write-Warning "Python not found in PATH"
            return $script:MockData
        }
        
        # Execute Python script
        $output = & $pythonCmd $script:PythonScript 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Python script failed with exit code: $LASTEXITCODE"
            Write-Warning "Output: $output"
            return $script:MockData
        }
        
        # Parse JSON output
        $data = $output | ConvertFrom-Json
        
        if ($data.Status -eq "ERROR") {
            Write-Warning "Python script returned error: $($data.Message)"
            return $script:MockData
        }
        
        return $data
    }
    catch {
        Write-Warning "Failed to fetch space weather data: $_"
        return $script:MockData
    }
}

function Get-ColorFromValue {
    <#
    .SYNOPSIS
    Get console color based on value intensity
    #>
    param(
        [double]$Value,
        [double]$Min = 0,
        [double]$Max = 100,
        [switch]$Inverse
    )
    
    $normalized = ($Value - $Min) / ($Max - $Min)
    $normalized = [Math]::Max(0, [Math]::Min(1, $normalized))
    
    if ($Inverse) {
        $normalized = 1 - $normalized
    }
    
    if ($normalized -lt 0.33) {
        return "Green"
    }
    elseif ($normalized -lt 0.66) {
        return "Yellow"
    }
    else {
        return "Red"
    }
}

function Show-SolarBurstAnimation {
    <#
    .SYNOPSIS
    Display solar burst animation
    #>
    param([int]$Duration = 2)
    
    $startTime = Get-Date
    $colors = @("Yellow", "Red", "DarkYellow", "DarkRed")
    
    while (((Get-Date) - $startTime).TotalSeconds -lt $Duration) {
        $color = $colors[$script:AnimationFrame % $colors.Count]
        $script:AnimationFrame++
        
        Write-Host "`n`n`n" -NoNewline
        Write-Host "        ☀️  " -NoNewline -ForegroundColor $color
        Write-Host "SOLAR BURST DETECTED" -ForegroundColor $color -BackgroundColor Black
        Write-Host "        ☀️  " -NoNewline -ForegroundColor $color
        Write-Host "HIGH FLARE PROBABILITY" -ForegroundColor $color -BackgroundColor Black
        
        Start-Sleep -Milliseconds 200
        
        if ($Duration -gt 0) {
            # Clear lines for animation
            [Console]::SetCursorPosition(0, [Console]::CursorTop - 4)
        }
    }
}

function Show-AuroraTheme {
    <#
    .SYNOPSIS
    Apply aurora theme based on visibility score
    #>
    param([int]$Score)
    
    if ($Score -ge 70) {
        return @{
            Primary = "Green"
            Secondary = "DarkGreen"
            Accent = "Cyan"
            Theme = "AURORA_ACTIVE"
        }
    }
    elseif ($Score -ge 40) {
        return @{
            Primary = "Yellow"
            Secondary = "DarkYellow"
            Accent = "Green"
            Theme = "AURORA_POSSIBLE"
        }
    }
    else {
        return @{
            Primary = "Cyan"
            Secondary = "DarkCyan"
            Accent = "White"
            Theme = "AURORA_QUIET"
        }
    }
}

function Show-ProgressBar {
    <#
    .SYNOPSIS
    Display a progress bar
    #>
    param(
        [double]$Value,
        [double]$Max = 100,
        [int]$Width = 30,
        [string]$ForegroundColor = "Green"
    )
    
    $filled = [Math]::Floor(($Value / $Max) * $Width)
    $empty = $Width - $filled
    
    $bar = "█" * $filled + "░" * $empty
    Write-Host "[" -NoNewline -ForegroundColor DarkGray
    Write-Host $bar -NoNewline -ForegroundColor $ForegroundColor
    Write-Host "]" -NoNewline -ForegroundColor DarkGray
}

function Show-Dashboard {
    <#
    .SYNOPSIS
    Display the main HUD dashboard
    #>
    param($Data)
    
    Clear-Host
    
    # Determine theme
    $theme = Show-AuroraTheme -Score $Data.AuroraVisibilityScore
    
    # Header
    Write-Host "╔═══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor $theme.Primary
    Write-Host "║                        " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "AURORA COMMAND - SPACE WEATHER HUD" -NoNewline -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "                    ║" -ForegroundColor $theme.Primary
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Theme: $($theme.Theme)" -NoNewline -ForegroundColor $theme.Accent
    Write-Host (" " * (69 - $theme.Theme.Length)) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Timestamp: $($Data.Timestamp)" -NoNewline -ForegroundColor Gray
    Write-Host (" " * (69 - $Data.Timestamp.Length - 11)) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    Write-Host "╠═══════════════════════════════════════════════════════════════════════════╣" -ForegroundColor $theme.Primary
    
    # KP Index Section
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "GEOMAGNETIC ACTIVITY (KP INDEX)" -ForegroundColor Yellow
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Current: " -NoNewline -ForegroundColor Gray
    $kpColor = Get-ColorFromValue -Value $Data.CurrentKP -Max 9
    Write-Host ("{0:F1}" -f $Data.CurrentKP) -NoNewline -ForegroundColor $kpColor
    Write-Host " / 9.0" -ForegroundColor Gray
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Show-ProgressBar -Value $Data.CurrentKP -Max 9 -ForegroundColor $kpColor
    Write-Host (" " * 40) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    
    # Solar Wind Section
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "SOLAR WIND PARAMETERS" -ForegroundColor Yellow
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Speed:   " -NoNewline -ForegroundColor Gray
    $speedColor = Get-ColorFromValue -Value $Data.SolarWind.speed -Min 300 -Max 800
    Write-Host ("{0,6:F1} km/s" -f $Data.SolarWind.speed) -ForegroundColor $speedColor
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Density: " -NoNewline -ForegroundColor Gray
    Write-Host ("{0,6:F2} p/cm³" -f $Data.SolarWind.density) -ForegroundColor Cyan
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Bz:      " -NoNewline -ForegroundColor Gray
    $bzColor = if ($Data.SolarWind.bz -lt 0) { "Red" } else { "Green" }
    Write-Host ("{0,6:F2} nT" -f $Data.SolarWind.bz) -ForegroundColor $bzColor
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Bt:      " -NoNewline -ForegroundColor Gray
    Write-Host ("{0,6:F2} nT" -f $Data.SolarWind.bt) -ForegroundColor Cyan
    
    # Solar Flare Section
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "SOLAR FLARE PREDICTION (SURYA AI)" -ForegroundColor Yellow
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Probability: " -NoNewline -ForegroundColor Gray
    $flareColor = Get-ColorFromValue -Value $Data.SuryaFlareProb
    Write-Host ("{0:F1}%" -f $Data.SuryaFlareProb) -NoNewline -ForegroundColor $flareColor
    Write-Host "  |  X-Ray Class: " -NoNewline -ForegroundColor Gray
    Write-Host $Data.XRayClass -ForegroundColor Magenta
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Show-ProgressBar -Value $Data.SuryaFlareProb -ForegroundColor $flareColor
    Write-Host (" " * 40) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    
    # CME Arrival Section
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "CME PROPAGATION MODEL (EUHFORIA)" -ForegroundColor Yellow
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Earth Arrival: " -NoNewline -ForegroundColor Gray
    Write-Host ("{0:F1} hours" -f $Data.CMEArrivalHours) -NoNewline -ForegroundColor Cyan
    Write-Host "  (" -NoNewline -ForegroundColor Gray
    Write-Host ("{0:F1} days" -f ($Data.CMEArrivalHours / 24)) -NoNewline -ForegroundColor Cyan
    Write-Host ")" -ForegroundColor Gray
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Solar Cycle 25 Risk: " -NoNewline -ForegroundColor Gray
    $riskColor = switch ($Data.Cycle25RiskLevel) {
        "CRITICAL" { "Red" }
        "HIGH" { "Red" }
        "MODERATE" { "Yellow" }
        default { "Green" }
    }
    Write-Host $Data.Cycle25RiskLevel -ForegroundColor $riskColor
    
    # Aurora Visibility Section
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "AURORA VISIBILITY FORECAST" -ForegroundColor Yellow
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Visibility Score: " -NoNewline -ForegroundColor Gray
    $visColor = Get-ColorFromValue -Value $Data.AuroraVisibilityScore
    Write-Host ("{0}/100" -f $Data.AuroraVisibilityScore) -ForegroundColor $visColor
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Show-ProgressBar -Value $Data.AuroraVisibilityScore -ForegroundColor $visColor
    Write-Host (" " * 40) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    
    # Status Section
    Write-Host "║                                                                           ║" -ForegroundColor $theme.Primary
    Write-Host "╠═══════════════════════════════════════════════════════════════════════════╣" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Status: " -NoNewline -ForegroundColor Gray
    $statusColor = if ($Data.Status -eq "SUCCESS") { "Green" } elseif ($Data.Status -eq "MOCK_DATA") { "Yellow" } else { "Red" }
    Write-Host $Data.Status -NoNewline -ForegroundColor $statusColor
    Write-Host (" " * (65 - $Data.Status.Length)) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    Write-Host "║  " -NoNewline -ForegroundColor $theme.Primary
    Write-Host "Next Refresh: $script:RefreshInterval seconds" -NoNewline -ForegroundColor Gray
    Write-Host (" " * 47) -NoNewline
    Write-Host "║" -ForegroundColor $theme.Primary
    Write-Host "╚═══════════════════════════════════════════════════════════════════════════╝" -ForegroundColor $theme.Primary
    
    # Trigger animations based on data
    if ($Data.SuryaFlareProb -gt 50) {
        Write-Host ""
        Show-SolarBurstAnimation -Duration 1
    }
    
    # Display warning messages
    if ($Data.AuroraVisibilityScore -ge 70) {
        Write-Host "`n  🌌 " -NoNewline -ForegroundColor Green
        Write-Host "HIGH AURORA ACTIVITY - EXCELLENT VIEWING CONDITIONS" -ForegroundColor Green -BackgroundColor Black
    }
    
    if ($Data.Cycle25RiskLevel -eq "CRITICAL") {
        Write-Host "`n  ⚠️  " -NoNewline -ForegroundColor Red
        Write-Host "CRITICAL SPACE WEATHER EVENT - MONITOR CLOSELY" -ForegroundColor Red -BackgroundColor Black
    }
    
    Write-Host "`n  Press Ctrl+C to exit..." -ForegroundColor DarkGray
}

function Start-AutoRefresh {
    <#
    .SYNOPSIS
    Main loop with auto-refresh
    #>
    Initialize-Console
    
    Write-Host "Initializing Space Weather HUD..." -ForegroundColor Cyan
    Write-Host "Checking Python environment..." -ForegroundColor Gray
    
    # Initial data fetch
    $script:LastData = Get-SpaceWeatherData
    
    while ($true) {
        try {
            Show-Dashboard -Data $script:LastData
            
            # Wait for refresh interval
            $waited = 0
            while ($waited -lt $script:RefreshInterval) {
                Start-Sleep -Seconds 1
                $waited++
                
                # Check for Ctrl+C
                if ([Console]::KeyAvailable) {
                    $key = [Console]::ReadKey($true)
                    if ($key.Key -eq [ConsoleKey]::C -and $key.Modifiers -eq [ConsoleModifiers]::Control) {
                        throw "User interrupted"
                    }
                }
            }
            
            # Refresh data
            $script:LastData = Get-SpaceWeatherData
        }
        catch {
            Write-Host "`nExiting..." -ForegroundColor Yellow
            break
        }
    }
}

# Main execution
try {
    Start-AutoRefresh
}
finally {
    # Cleanup
    [Console]::CursorVisible = $true
    Clear-Host
    Write-Host "Aurora Command HUD terminated." -ForegroundColor Cyan
}
