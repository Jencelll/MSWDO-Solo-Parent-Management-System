$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")

# 1. Update/Create Desktop Shortcut
$DesktopShortcut = $WshShell.CreateShortcut("$DesktopPath\Pagsanjan Solo Parent System.lnk")
$DesktopShortcut.TargetPath = "e:\solo_parent\solo_parent\START_APP.bat"
$DesktopShortcut.WorkingDirectory = "e:\solo_parent\solo_parent"
$DesktopShortcut.WindowStyle = 1
$DesktopShortcut.Description = "Launch Pagsanjan Solo Parent Information System"
$DesktopShortcut.IconLocation = "e:\solo_parent\solo_parent\pagsanjan-frontend\assets\MSWDOLogo.ico"
$DesktopShortcut.Save()
Write-Host "Desktop Shortcut updated successfully!"

# 2. Update/Create Project Folder Shortcut (START_APP - Shortcut.lnk)
$ProjectShortcutPath = "e:\solo_parent\solo_parent\START_APP - Shortcut.lnk"
if (Test-Path $ProjectShortcutPath) {
    $ProjectShortcut = $WshShell.CreateShortcut($ProjectShortcutPath)
    $ProjectShortcut.IconLocation = "e:\solo_parent\solo_parent\pagsanjan-frontend\assets\MSWDOLogo.ico"
    $ProjectShortcut.Save()
    Write-Host "Project Folder Shortcut (START_APP - Shortcut.lnk) updated successfully!"
} else {
    Write-Host "Project Folder Shortcut not found, skipping."
}
