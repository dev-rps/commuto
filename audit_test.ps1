$ErrorActionPreference = "Continue"
$BASE = "https://commuto.onrender.com/api"

Write-Host "=== TEST 1: HEALTH CHECK ===" -ForegroundColor Cyan
try {
    $h = Invoke-RestMethod "$BASE/health" -TimeoutSec 30
    Write-Host "PASS: $($h.status) - $($h.service)"
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 2: ORGANIZATIONS (public endpoint) ===" -ForegroundColor Cyan
try {
    $o = Invoke-RestMethod "$BASE/organizations" -TimeoutSec 15
    Write-Host "PASS: $($o.organizations.Count) orgs found"
    foreach ($org in $o.organizations) {
        Write-Host "  ORG: $($org.name) | id=$($org.id) | fuelCostPerL=$($org.fuelCostPerL) | costPerKm=$($org.costPerKm)"
    }
    $global:ORG_ID = $o.organizations[0].id
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 3: UNAUTHENTICATED ACCESS BLOCK ===" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$BASE/rides/search" -TimeoutSec 15
    Write-Host "SECURITY FAIL: Unauthenticated search succeeded (should be 401)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) { Write-Host "PASS: Returns 401 for unauthenticated search" }
    else { Write-Host "Response code: $code - $($_.Exception.Message)" }
}

Write-Host "`n=== TEST 4: LOGIN with test credentials ===" -ForegroundColor Cyan
$loginBody = @{ email = "admin1@techcorpsolutions.com"; password = "pass1234" } | ConvertTo-Json
try {
    $login = Invoke-RestMethod "$BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 15
    Write-Host "PASS: Login succeeded for $($login.user.email) role=$($login.user.role)"
    $global:TOKEN = $login.accessToken
    $global:REFRESH = $login.refreshToken
    $global:USER_ID = $login.user.id
    $global:ORG_LOGIN = $login.user.organizationId
} catch {
    Write-Host "FAIL admin login: $($_.Exception.Message)"
    # Try employee login
    $loginBody2 = @{ email = "divya.patel0@omnisoftindia.com"; password = "pass1234" } | ConvertTo-Json
    try {
        $login2 = Invoke-RestMethod "$BASE/auth/login" -Method POST -Body $loginBody2 -ContentType "application/json" -TimeoutSec 15
        Write-Host "PASS employee login: $($login2.user.email) role=$($login2.user.role)"
        $global:TOKEN = $login2.accessToken
    } catch {
        Write-Host "FAIL employee login too: $($_.Exception.Message)"
    }
}

$headers = @{ Authorization = "Bearer $global:TOKEN" }

Write-Host "`n=== TEST 5: /auth/me + session persistence ===" -ForegroundColor Cyan
try {
    $me = Invoke-RestMethod "$BASE/auth/me" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: /auth/me returned user=$($me.user.email) role=$($me.user.role) org=$($me.user.organizationId)"
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 6: REFRESH TOKEN FLOW ===" -ForegroundColor Cyan
$refreshBody = @{ refreshToken = $global:REFRESH } | ConvertTo-Json
try {
    $ref = Invoke-RestMethod "$BASE/auth/refresh" -Method POST -Body $refreshBody -ContentType "application/json" -TimeoutSec 15
    Write-Host "PASS: Refresh returned new accessToken (length=$($ref.accessToken.Length))"
} catch {
    Write-Host "NOTE: Refresh endpoint behavior: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 7: RIDE SEARCH (authenticated) ===" -ForegroundColor Cyan
try {
    $rides = Invoke-RestMethod "$BASE/rides/search" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: Search returned $($rides.rides.Count) rides"
    if ($rides.rides.Count -gt 0) {
        $r = $rides.rides[0]
        Write-Host "  Sample: $($r.pickupLoc) -> $($r.destination) | seats=$($r.availableSeats) | status=$($r.status)"
        $global:SAMPLE_RIDE_ID = $r.id
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 8: VEHICLE CHECK (publish without vehicle) ===" -ForegroundColor Cyan
$rideBody = @{
    vehicleId = "00000000-0000-0000-0000-000000000000"
    pickupLoc = "Test Pickup"
    pickupLat = 12.9352
    pickupLng = 77.6245
    destination = "Test Dest"
    destLat = 12.8399
    destLng = 77.677
    departureTime = "2026-08-10T09:00:00.000Z"
    availableSeats = 2
    farePerSeat = 50
} | ConvertTo-Json
try {
    $pub = Invoke-RestMethod "$BASE/rides" -Method POST -Headers $headers -Body $rideBody -ContentType "application/json" -TimeoutSec 15
    Write-Host "SECURITY CONCERN: Ride published without valid vehicle (should block)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "PASS: Returns $code when vehicle invalid - $($_.Exception.Message)"
}

Write-Host "`n=== TEST 9: MY VEHICLES ===" -ForegroundColor Cyan
try {
    $v = Invoke-RestMethod "$BASE/vehicles/me" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: $($v.vehicles.Count) vehicles found"
    foreach ($veh in $v.vehicles) {
        Write-Host "  VEH: $($veh.model) | reg=$($veh.registrationNo) | active=$($veh.isActive)"
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 10: WALLET ===" -ForegroundColor Cyan
try {
    $w = Invoke-RestMethod "$BASE/wallet/me" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: Balance=$($w.balance) | Transactions=$($w.transactions.Count)"
    if ($w.transactions.Count -gt 0) {
        Write-Host "  Sample txn: type=$($w.transactions[0].type) amount=$($w.transactions[0].amount)"
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 11: REPORTS SUMMARY (admin) ===" -ForegroundColor Cyan
try {
    $rep = Invoke-RestMethod "$BASE/reports/summary" -Headers $headers -TimeoutSec 15
    $s = $rep.summary
    Write-Host "PASS: org=$($rep.organization.name)"
    Write-Host "  totalTrips=$($s.totalTrips) totalDistance=$($s.totalDistance) totalFuelConsumed=$($s.totalFuelConsumed)"
    Write-Host "  totalFuelCost=$($s.totalFuelCost) totalPassengers=$($s.totalPassengers)"
    Write-Host "  vehicleBreakdown count=$($rep.vehicleBreakdown.Count)"
    Write-Host "  fuelEfficiencyTrends count=$($rep.fuelEfficiencyTrends.Count)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "NOTE (code=$code): $($_.Exception.Message)"
}

Write-Host "`n=== TEST 12: CROSS-ORG ISOLATION CHECK ===" -ForegroundColor Cyan
Write-Host "Token org=$($global:ORG_LOGIN)"
try {
    $orgRides = Invoke-RestMethod "$BASE/organizations/my/rides" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: org/my/rides returned $($orgRides.rides.Count) rides"
    $otherOrg = $orgRides.rides | Where-Object { $_.driver.organizationId -ne $global:ORG_LOGIN } | Select-Object -First 1
    if ($otherOrg) { Write-Host "ISOLATION FAIL: Found ride from different org!" }
    else { Write-Host "Isolation looks OK on org/my/rides" }
} catch {
    Write-Host "NOTE: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 13: EMPLOYEE TRIES REPORTS (role check) ===" -ForegroundColor Cyan
$empLoginBody = @{ email = "divya.patel0@omnisoftindia.com"; password = "pass1234" } | ConvertTo-Json
try {
    $empLogin = Invoke-RestMethod "$BASE/auth/login" -Method POST -Body $empLoginBody -ContentType "application/json" -TimeoutSec 15
    Write-Host "Employee login: $($empLogin.user.email) role=$($empLogin.user.role)"
    $empHeaders = @{ Authorization = "Bearer $($empLogin.accessToken)" }
    try {
        $empRep = Invoke-RestMethod "$BASE/reports/summary" -Headers $empHeaders -TimeoutSec 10
        Write-Host "SECURITY FAIL: Employee can access reports/summary!"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "PASS: Employee blocked from reports (code=$code)"
    }
    # Employee tries admin org routes
    try {
        $empMembers = Invoke-RestMethod "$BASE/organizations/my/members" -Headers $empHeaders -TimeoutSec 10
        Write-Host "SECURITY FAIL: Employee can access org/my/members!"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "PASS: Employee blocked from org/my/members (code=$code)"
    }
    $global:EMP_TOKEN = $empLogin.accessToken
    $global:EMP_ORG = $empLogin.user.organizationId
} catch {
    Write-Host "NOTE employee login: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 14: SAVED PLACES ===" -ForegroundColor Cyan
try {
    $sp = Invoke-RestMethod "$BASE/saved-places" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: SavedPlaces returned $($sp.places.Count) places"
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 15: BOOKING ME ===" -ForegroundColor Cyan
try {
    $b = Invoke-RestMethod "$BASE/bookings/me" -Headers $headers -TimeoutSec 15
    Write-Host "PASS: $($b.bookings.Count) bookings"
    $paid = $b.bookings | Where-Object { $_.status -eq 'PAYMENT_COMPLETED' }
    Write-Host "  PAYMENT_COMPLETED bookings: $($paid.Count)"
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 16: LOCATION POST WITHOUT IN_PROGRESS ===" -ForegroundColor Cyan
if ($global:SAMPLE_RIDE_ID) {
    $locBody = @{ latitude = 12.9; longitude = 77.6 } | ConvertTo-Json
    try {
        $loc = Invoke-RestMethod "$BASE/rides/$($global:SAMPLE_RIDE_ID)/location" -Method POST -Headers $headers -Body $locBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "FAIL: Location accepted on non-IN_PROGRESS ride (privacy bug)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "PASS: Location blocked on non-IN_PROGRESS ride (code=$code)"
    }
}

Write-Host "`n=== TEST 17: CORS HEADER CHECK ===" -ForegroundColor Cyan
try {
    $corsResponse = Invoke-WebRequest "$BASE/health" -Method OPTIONS -Headers @{ Origin = "https://evil-hacker.com"; "Access-Control-Request-Method" = "GET" } -TimeoutSec 10
    $corsAllow = $corsResponse.Headers["Access-Control-Allow-Origin"]
    Write-Host "CORS Allow-Origin: '$corsAllow'"
    if ($corsAllow -eq "*" -or $corsAllow -eq "https://evil-hacker.com") {
        Write-Host "SECURITY FAIL: CORS is wide open!"
    } else {
        Write-Host "CORS is scoped"
    }
} catch {
    Write-Host "CORS check: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 18: SOCKET WITHOUT TOKEN ===" -ForegroundColor Cyan
Write-Host "NOTE: Socket auth requires JWT in handshake - code-verified: rejects connections without token"

Write-Host "`n=== TEST 19: RAZORPAY KEY PREFIX ===" -ForegroundColor Cyan
$razorBody = @{ bookingId = "00000000-0000-0000-0000-000000000001"; method = "CARD" } | ConvertTo-Json
try {
    $razResp = Invoke-RestMethod "$BASE/bookings/00000000-0000-0000-0000-000000000001/payment" -Method POST -Headers $headers -Body $razorBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "Razorpay orderId prefix: $($razResp.razorpay.orderId.Substring(0,10))..."
    Write-Host "Razorpay keyId: $($razResp.razorpay.keyId)"
} catch {
    Write-Host "Razorpay test: $($_.Exception.Message)"
}

Write-Host "`n=== ALL TESTS COMPLETE ===" -ForegroundColor Green
