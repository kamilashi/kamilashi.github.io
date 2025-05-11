@echo off

set "input_folder=raw"

for %%f in ("%input_folder%\*.mp4") do (
    set "filename=%%~nxf"
    call :convert "%%f" "%%~dp0%%~nf_f.mp4"
)
goto :eof

:convert
ffmpeg -i %1 -vcodec libx264 -an -acodec aac -strict -2 %2