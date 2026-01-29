# PRIVYDESK Edge Functions Deployment Script
# This script deploys all Edge Functions to Supabase

Write-Host "🚀 PRIVYDESK Edge Functions Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is available
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = npx supabase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Supabase CLI version: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# List of Edge Functions to deploy
$functions = @(
    "analyze-ticket",
    "api-v1",
    "send-otp",
    "verify-otp",
    "send-magic-link",
    "send-team-invite",
    "send-welcome-email",
    "verify-domain",
    "widget-script",
    "process-email-import",
    "security-scan"
)

Write-Host "📦 Functions to deploy:" -ForegroundColor Yellow
foreach ($func in $functions) {
    Write-Host "   - $func" -ForegroundColor White
}
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy all functions to production? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Starting deployment..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$failedFunctions = @()

foreach ($func in $functions) {
    Write-Host "Deploying $func..." -ForegroundColor Yellow
    
    $output = npx supabase functions deploy $func 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $func deployed successfully" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "❌ $func deployment failed" -ForegroundColor Red
        $failCount++
        $failedFunctions += $func
        Write-Host "Error: $output" -ForegroundColor Red
    }
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed functions:" -ForegroundColor Red
    foreach ($func in $failedFunctions) {
        Write-Host "   - $func" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Cyan
