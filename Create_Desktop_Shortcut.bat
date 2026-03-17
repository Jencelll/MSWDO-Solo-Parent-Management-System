@echo off
setlocal
title Create Desktop Shortcut
color 0A

echo.
echo ==========================================
echo      Creating Desktop Shortcut...
echo ==========================================
echo.

set "TARGET_SCRIPT=%~dp0Run_System.bat"
set "SHORTCUT_NAME=Pagsanjan Solo Parent System.lnk"
set "ICON_FILE=%~dp0pagsanjan-frontend\assets\MSWDOLogo.ico"

:: Create a temporary VBScript to generate the shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = oWS.ExpandEnvironmentStrings("%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%") >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%TARGET_SCRIPT%" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> CreateShortcut.vbs
echo oLink.IconLocation = "%ICON_FILE%" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

:: Execute the VBScript
cscript //nologo CreateShortcut.vbs

:: Clean up
del CreateShortcut.vbs

echo.
echo [SUCCESS] Shortcut created on your Desktop!
echo.
echo You can now verify the "Pagsanjan Solo Parent System" icon on your Desktop.
echo.
pause