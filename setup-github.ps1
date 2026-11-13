# Create GitHub repo Hamdus70/kerojet-clone (if missing) and push the local repo.
$ErrorActionPreference = 'Stop'
$git = 'C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe'
$cred = 'C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\mingw64\libexec\git-core\git-credential-wincred.exe'

$tokenLine = [string] (('protocol=https' + "`n" + 'host=github.com' + "`n" + "`n") | & $cred get |
  Where-Object { $_ -like 'password=*' })
$token = $tokenLine -replace '^password=', ''
if (-not $token) { throw 'no token' }

$hdr = @{ Authorization = 'token ' + $token; 'User-Agent' = 'kerojet-setup' }

$exists = $false
try {
  Invoke-RestMethod -Uri 'https://api.github.com/repos/Hamdus70/kerojet-clone' -Headers $hdr | Out-Null
  $exists = $true
  Write-Host 'repo exists'
} catch { }

if (-not $exists) {
  $body = '{"name":"kerojet-clone","private":false,"description":"Kerojet Services static site mirror with AI voice assistant"}'
  Invoke-RestMethod -Method Post -Uri 'https://api.github.com/user/repos' -Headers $hdr -Body $body -ContentType 'application/json' | Out-Null
  Write-Host 'repo created'
}

& $git -C 'C:\REA\kerojet-clone' init | Out-Null
& $git -C 'C:\REA\kerojet-clone' add -A
& $git -C 'C:\REA\kerojet-clone' -c user.name='Hamdus70' -c user.email='hamdus70@users.noreply.github.com' commit -m 'Kerojet static site plus AI voice assistant (LASUTH agent tech, Kerojet KB)'
& $git -C 'C:\REA\kerojet-clone' branch -M main
& $git -C 'C:\REA\kerojet-clone' remote remove origin
& $git -C 'C:\REA\kerojet-clone' remote add origin ('https://Hamdus70:' + $token + '@github.com/Hamdus70/kerojet-clone.git')
& $git -C 'C:\REA\kerojet-clone' push -u origin main
if ($LASTEXITCODE -eq 0) { Write-Host 'PUSH OK' } else { throw 'push failed' }
