# Run this script from an elevated PowerShell window.
# It adds the jfv.local hosts entry and trusts Caddy's local certificate authority.

$ErrorActionPreference = 'Stop'

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
  throw 'Run this script from an elevated PowerShell window (Run as Administrator).'
}

$hostsPath = Join-Path $env:WINDIR 'System32\drivers\etc\hosts'
$hostsEntry = '127.0.0.1 jfv.local'

if (-not (Select-String -Path $hostsPath -Pattern '^\s*127\.0\.0\.1\s+jfv\.local\s*$' -Quiet)) {
  Add-Content -Path $hostsPath -Value "`r`n$hostsEntry"
  Write-Host "Added hosts entry: $hostsEntry"
} else {
  Write-Host "Hosts entry already exists: $hostsEntry"
}

$caddy = Get-Command caddy -ErrorAction SilentlyContinue
if (-not $caddy) {
  $caddyPath = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\CaddyServer.Caddy_Microsoft.Winget.Source_8wekyb3d8bbwe\caddy.exe'

  if (-not (Test-Path $caddyPath)) {
    throw 'Caddy was not found. Install it with: winget install --id CaddyServer.Caddy --exact --scope user'
  }

  $caddy = $caddyPath
} else {
  $caddy = $caddy.Source
}

& $caddy trust
Write-Host 'Caddy local CA trusted.'
