$projectRoot = Split-Path $PSScriptRoot -Parent
$browserCache = Join-Path $projectRoot ".playwright\cache"

# Keep browser profiles and downloaded engines in this project's local cache.
$env:LOCALAPPDATA = $browserCache
$env:PWTEST_DAEMON_SESSION_DIR = Join-Path $browserCache "daemon"

$cli = Join-Path $projectRoot "node_modules\.bin\playwright-cli.cmd"
& $cli @args
exit $LASTEXITCODE
