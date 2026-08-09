@echo off
title HIMA TECH RCM Server
cd /d "%~dp0"
set NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe
if not exist "%NODE_EXE%" set NODE_EXE=node
"%NODE_EXE%" server.js
pause
