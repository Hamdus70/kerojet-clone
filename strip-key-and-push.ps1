# Strip the Gemini key from the repo copy (keep the stable placeholder), amend
# the commit, and push. The live Vercel deployment keeps the real key; the repo
# stores only the placeholder, which the pipeline re-injects on any rebuild.
$ErrorActionPreference = 'Stop'
$git = 'C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe'

$stripped = 0
Get-ChildItem 'C:\REA\kerojet-clone\kerojet-agent\assets' -Filter *.js | ForEach-Object {
  $s = Get-Content $_.FullName -Raw
  $m = [regex]::Match($s, '"(AQ\.[A-Za-z0-9_\-]+)"')
  if ($m.Success) {
    $s = $s.Replace($m.Value, '"__LASUTH_GEMINI_KEY__"')
    Set-Content $_.FullName $s -NoNewline
    $stripped++
    Write-Host ('stripped key from ' + $_.Name)
  }
}
if ($stripped -eq 0) { Write-Host 'no key found (already stripped)' }

& $git -C 'C:\REA\kerojet-clone' add -A
& $git -C 'C:\REA\kerojet-clone' -c user.name='Hamdus70' -c user.email='hamdus70@users.noreply.github.com' commit --amend -m 'Kerojet static site plus AI voice assistant (LASUTH agent tech, Kerojet KB)'
& $git -C 'C:\REA\kerojet-clone' branch -M main
& $git -C 'C:\REA\kerojet-clone' remote get-url origin | Out-Null
& $git -C 'C:\REA\kerojet-clone' push -f -u origin main
if ($LASTEXITCODE -eq 0) { Write-Host 'PUSH OK' } else { throw 'push failed' }
