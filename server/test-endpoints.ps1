# SkillVerse API Test Script (PowerShell)
$BaseUrl = "http://localhost:5000/api"
$Timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$Username = "child_$Timestamp"
$Email = "$Username@school.edu"
$Password = "learn123!"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SkillVerse Backend API Test Suite (PowerShell)" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Health
Write-Host "`n1. Checking Server Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
    $health | ConvertTo-Json
} catch {
    Write-Host "Health check failed: $_" -ForegroundColor Red
}

# 2. Register
Write-Host "`n2. Registering New Student ($Username)..." -ForegroundColor Yellow
$regBody = @{
    username = $Username
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $regRes = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    $regRes | ConvertTo-Json
    $Token = $regRes.token
} catch {
    Write-Host "Registration error: $_" -ForegroundColor Red
}

if (-not $Token) {
    Write-Host "`nAttempting Login..." -ForegroundColor Yellow
    $loginBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $Token = $loginRes.token
}

$Headers = @{
    "Authorization" = "Bearer $Token"
}

# 3. /me
Write-Host "`n3. Checking /api/auth/me..." -ForegroundColor Yellow
try {
    $me = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method Get -Headers $Headers
    $me | ConvertTo-Json
} catch {
    Write-Host "Me check error: $_" -ForegroundColor Red
}

# 4. Get Save
Write-Host "`n4. Getting Initial Save (Expect empty/null)..." -ForegroundColor Yellow
try {
    $save = Invoke-RestMethod -Uri "$BaseUrl/save" -Method Get -Headers $Headers
    $save | ConvertTo-Json
} catch {
    Write-Host "Get save error: $_" -ForegroundColor Red
}

# 5. Put Save
Write-Host "`n5. Saving Day 1 Progress (PUT /api/save)..." -ForegroundColor Yellow
$savePayload = @{
    schemaVersion = 1
    day = 1
    state = @{
        coins = 175
        xp = 40
        day = 1
        sustainability = 85
        skills = @{
            life = 10
            human = 5
            digital = 15
            vocational = 5
            entrepreneurial = 0
        }
        flags = @{
            home_leak_repaired = $true
            farmWaterEfficiencyPct = 90
        }
    }
    worldProgress = @{
        home = @{ leakRepaired = $true }
        farm = @{ completed = $true; waterEfficiencyPct = 90 }
    }
} | ConvertTo-Json -Depth 5

try {
    $putRes = Invoke-RestMethod -Uri "$BaseUrl/save" -Method Put -Body $savePayload -Headers $Headers -ContentType "application/json"
    $putRes | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Save error: $_" -ForegroundColor Red
}

# 6. Retrieve stored save
Write-Host "`n6. Retrieving Stored Save (GET /api/save)..." -ForegroundColor Yellow
try {
    $finalSave = Invoke-RestMethod -Uri "$BaseUrl/save" -Method Get -Headers $Headers
    $finalSave | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Retrieve save error: $_" -ForegroundColor Red
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "API Test Suite Finished!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
