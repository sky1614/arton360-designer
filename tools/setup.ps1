$ErrorActionPreference = "Stop"

powershell -ExecutionPolicy Bypass -File .\tools\use-node.ps1

if (Test-Path .\package-lock.json) {
  npm ci
} else {
  npm install
}

Write-Host "Done. Run: npm run dev"
