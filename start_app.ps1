Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Starting Kochi DrainWatch (LSGD Municipal Canal Redressal)" -ForegroundColor Yellow
Write-Host " ANAVANDI 2026 Hackathon Prototype" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\backend"
Write-Host "Server running at: http://localhost:8088" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
python server.py
