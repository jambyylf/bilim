# Bilim — Supabase миграциясын іске асыру скрипті
# PowerShell-де іске қосу: .\scripts\apply-migration.ps1

$ErrorActionPreference = 'Stop'

# .env.local файлынан мәндерді оқу
$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) '.env.local'
$env = Get-Content $envPath | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' }
$envMap = @{}
foreach ($line in $env) {
    $kv = $line -split '=', 2
    $envMap[$kv[0].Trim()] = $kv[1].Trim()
}

$SUPABASE_URL      = $envMap['NEXT_PUBLIC_SUPABASE_URL']
$SERVICE_ROLE_KEY  = $envMap['SUPABASE_SERVICE_ROLE_KEY']

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE_KEY) {
    Write-Error "❌ .env.local-да NEXT_PUBLIC_SUPABASE_URL немесе SUPABASE_SERVICE_ROLE_KEY табылмады"
    exit 1
}

$SQL = @"
CREATE OR REPLACE FUNCTION increment_students_count(course_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS `$`$
BEGIN
  UPDATE courses SET students_count = COALESCE(students_count, 0) + 1 WHERE id = course_id;
END;
`$`$;

CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON certificates(cert_number);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
"@

$headers = @{
    'Content-Type'  = 'application/json'
    'Authorization' = "Bearer $SERVICE_ROLE_KEY"
    'apikey'        = $SERVICE_ROLE_KEY
}

$body = @{ query = $SQL } | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/pg-meta/v1/query" `
        -Method POST `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Миграция сәтті орындалды!" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "⚠️  Автоматты миграция мүмкін болмады. Supabase Dashboard → SQL Editor-де қолмен орындаңыз:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $SQL -ForegroundColor Cyan
}
