# PRIVYDESK Supabase Setup Script
# This script sets up the Supabase project connection

Write-Host "🔧 PRIVYDESK Supabase Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "mgnuddfytlbtgprckzto"

# Step 1: Login to Supabase
Write-Host "Step 1: Login to Supabase" -ForegroundColor Yellow
Write-Host "This will open a browser window for authentication..." -ForegroundColor White
Write-Host ""

npx supabase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Link to project
Write-Host "Step 2: Link to Supabase Project" -ForegroundColor Yellow
Write-Host "Project Reference: $projectRef" -ForegroundColor White
Write-Host ""

npx supabase link --project-ref $projectRef

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Project linking failed." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Generate TypeScript types
Write-Host "Step 3: Generate TypeScript Types" -ForegroundColor Yellow
Write-Host "Generating types from database schema..." -ForegroundColor White
Write-Host ""

npx supabase gen types typescript --project-id $projectRef > src/integrations/supabase/types.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript types generated successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Type generation failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Step 4: List current secrets
Write-Host "Step 4: Check Edge Function Secrets" -ForegroundColor Yellow
Write-Host "Listing configured secrets..." -ForegroundColor White
Write-Host ""

npx supabase secrets list

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review SUPABASE_SECRETS.md for required secrets" -ForegroundColor White
Write-Host "2. Set missing secrets in Supabase Dashboard" -ForegroundColor White
Write-Host "3. Run deploy-functions.ps1 to deploy Edge Functions" -ForegroundColor White
Write-Host ""
