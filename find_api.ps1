$c = Get-Content 'c:\Users\iitia\OneDrive\Desktop\odoohackathon\frontend\dist\assets\index-DQokiOo9.js' -Raw
# Search for localhost or api patterns
$patterns = @('localhost', 'API_BASE', '4000', '/api', 'hostname')
foreach ($p in $patterns) {
    $m = [regex]::Matches($c, ".{0,40}$p.{0,40}")
    if ($m.Count -gt 0) {
        Write-Host "=== Pattern: $p ($($m.Count) hits) ==="
        $m | Select-Object -First 3 | ForEach-Object { Write-Host $_.Value }
        Write-Host ""
    }
}
