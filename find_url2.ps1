$c = Get-Content 'c:\Users\iitia\OneDrive\Desktop\odoohackathon\frontend\dist\assets\index-DQokiOo9.js' -Raw
$m = [regex]::Matches($c, 'https://[a-zA-Z0-9-]+\.onrender\.com[^"]{0,40}')
$urls = $m | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "=== Render URLs found in bundle ==="
$urls | ForEach-Object { Write-Host $_ }
