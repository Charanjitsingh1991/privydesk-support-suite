# Generate TypeScript types from Supabase database

Write-Host "🔄 Generating TypeScript types from Supabase..." -ForegroundColor Cyan
Write-Host ""

$projectRef = "mgnuddfytlbtgprckzto"

npx supabase gen types typescript --project-id $projectRef > src/integrations/supabase/types.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript types generated successfully!" -ForegroundColor Green
    Write-Host "📁 File: src/integrations/supabase/types.ts" -ForegroundColor White
} else {
    Write-Host "❌ Type generation failed." -ForegroundColor Red
    Write-Host "Make sure you're logged in: npx supabase login" -ForegroundColor Yellow
}

Write-Host ""
