# Check Supabase Edge Function Secrets

Write-Host "🔐 Checking Supabase Edge Function Secrets" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Required secrets
$requiredSecrets = @(
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL",
    "SMTP_FROM_NAME"
)

$optionalSecrets = @(
    "APP_URL"
)

Write-Host "Fetching configured secrets..." -ForegroundColor Yellow
Write-Host ""

$output = npx supabase secrets list 2>&1 | Out-String
$configuredSecrets = @()

# Parse the output to get secret names
$lines = $output -split "`n"
foreach ($line in $lines) {
    if ($line -match "^\s*([A-Z_]+)\s*$") {
        $configuredSecrets += $matches[1]
    }
}

Write-Host "Required Secrets:" -ForegroundColor Yellow
foreach ($secret in $requiredSecrets) {
    if ($configuredSecrets -contains $secret) {
        Write-Host "✅ $secret" -ForegroundColor Green
    } else {
        Write-Host "❌ $secret (MISSING)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Optional Secrets:" -ForegroundColor Yellow
foreach ($secret in $optionalSecrets) {
    if ($configuredSecrets -contains $secret) {
        Write-Host "✅ $secret" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $secret (not set)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "All configured secrets:" -ForegroundColor Cyan
npx supabase secrets list

Write-Host ""
Write-Host "📚 For more information, see SUPABASE_SECRETS.md" -ForegroundColor White
