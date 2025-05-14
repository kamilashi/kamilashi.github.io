@echo off
setlocal enabledelayedexpansion

:: === CONFIGURATION ===
set "input_folder=raw"
set "target_width=720"

:: === OUTPUT INFO ===
echo Downscaling videos from "%input_folder%" to width %target_width%
echo Output will be saved in: "%~dp0"

:: === LOOP THROUGH .mp4 FILES ===
for %%f in ("%input_folder%\*.mp4") do (
    set "filename=%%~nxf"
    echo Processing: !filename!

    ffmpeg -i "%%f" -vf "scale=%target_width%:-2" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "%~dp0%%~nxf"
)

echo.
echo ✅ All videos processed. Press any key to close.
pause >nul