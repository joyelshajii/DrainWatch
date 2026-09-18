@echo off
title Kochi DrainWatch - ANAVANDI 2026 Challenge SC-08
echo =======================================================
echo  Starting Kochi DrainWatch (LSGD Municipal Canal Redressal)
echo  ANAVANDI 2026 Hackathon Prototype
echo =======================================================
echo.

cd /d "%~dp0backend"
python server.py
pause
