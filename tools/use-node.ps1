$ErrorActionPreference = "Stop"

$ver = "20.19.1"
$zip = "node-v$ver-win-x64.zip"
$url = "https://nodejs.org/dist/v$ver/$zip"

$root = Split-Path -Parent $PSScriptRoot
$dir  = Join-Path $root ".node"
$zipPath = Join-Path $dir $zip
$nodeHome = Join-Path $dir "node-v$ver-win-x64"

New-Item -ItemType Directory -Force $dir | Out-Null

if (!(Test-Path $zipPath)) {
  Invoke-WebRequest -Uri $url -OutFile $zipPath
}

if (!(Test-Path $nodeHome)) {
  Expand-Archive -Path $zipPath -DestinationPath $dir -Force
}

$env:PATH = "$nodeHome;$env:PATH"