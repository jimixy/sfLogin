
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\.\defaultConfig\config.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\.\defaultConfig\config.js" %*
)
