@echo off

set "input_folder=raw"
set "target_width=720"

for %%f in ("%input_folder%\*.mp4") do (
    set "filename=%%~nxf"
    call :convert "%%f" "%%~dp0%%~nf_f.mp4"
)
goto :eof

:convert
ffmpeg -i %1 -vf scale=%target_width%:-2 -vcodec libx264 -an -preset fast -crf 23 -movflags +faststart -strict -2 %2