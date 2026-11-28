# Captures ONLY the Unreal game window (never the rest of the desktop) to a PNG, the way a player sees it, HUD included.
# Usage: capture_window.ps1 -Out shot.png [-ProcessName UnrealEditor] [-WaitSeconds 22]
param([Parameter(Mandatory = $true)][string]$Out, [string]$ProcessName = 'UnrealEditor', [int]$WaitSeconds = 22)

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Win {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
}
"@

Start-Sleep -Seconds $WaitSeconds
$proc = Get-Process $ProcessName -ErrorAction Stop | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { throw "no window for $ProcessName" }
$r = New-Object Win+RECT
[void][Win]::GetClientRect($proc.MainWindowHandle, [ref]$r)
$bmp = New-Object System.Drawing.Bitmap ($r.R - $r.L), ($r.B - $r.T)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
# 1 = client area only, 2 = PW_RENDERFULLCONTENT (works for DirectX windows)
[void][Win]::PrintWindow($proc.MainWindowHandle, $hdc, 3)
$g.ReleaseHdc($hdc)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "saved $Out ($($r.R - $r.L)x$($r.B - $r.T))"
