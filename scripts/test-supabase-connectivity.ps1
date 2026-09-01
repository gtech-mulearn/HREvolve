# PowerShell script to test Supabase connectivity
# This mimics what the GitHub Action does

$supabaseUrl = "https://ueutwediubqrcevqzojz.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldXR3ZWRpdWJxcmNldnF6b2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTk2ODQsImV4cCI6MjA3Mzc5NTY4NH0.8TXl10oz_QrbWgu6dYtE6c-wCn1X_knjrYqSwCYlAwM"

Write-Host "🔍 Testing Supabase connectivity..."
Write-Host "URL: $supabaseUrl/rest/v1/"

try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Headers @{"apikey" = $supabaseKey} -UseBasicParsing
    $statusCode = $response.StatusCode
    
    if ($statusCode -eq 200) {
        Write-Host "✅ Supabase is active and healthy (HTTP: $statusCode)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Supabase responded with HTTP: $statusCode" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode) {
        Write-Host "❌ Supabase may be paused or having issues (HTTP: $statusCode)" -ForegroundColor Red
    } else {
        Write-Host "❌ Connection failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🧪 Testing keep-alive script..."
try {
    $env:NEXT_PUBLIC_SUPABASE_URL = $supabaseUrl
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $supabaseKey
    & node scripts/keep-alive.js
    Write-Host "✅ Keep-alive script works correctly" -ForegroundColor Green
} catch {
    Write-Host "❌ Keep-alive script failed: $($_.Exception.Message)" -ForegroundColor Red
}