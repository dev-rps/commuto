$content = Get-Content 'c:\Users\iitia\OneDrive\Desktop\odoohackathon\frontend\dist\assets\index-DQokiOo9.js' -Raw
# Find onrender URL
$pattern = 'https://[a-zA-Z0-9\-]+\.onrender\.com[a-zA-Z0-9/]*'
$matches2 = [regex]::Matches($content, $pattern)
Write-Host "=== Backend URL in bundle ==="
foreach ($m in $matches2) { Write-Host $m.Value } | Select-Object -Unique

# Also check VITE_API_URL pattern
$pattern2 = '"https://[^"]{5,100}api[^"]{0,50}"'
$matches3 = [regex]::Matches($content, $pattern2)
Write-Host "`n=== API URL patterns ==="
foreach ($m in $matches3) { Write-Host $m.Value }
