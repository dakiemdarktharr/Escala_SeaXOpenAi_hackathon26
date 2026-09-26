param(
    [ValidateSet('light', 'heavy')]
    [string]$Worker = 'heavy'
)

$ErrorActionPreference = 'Stop'
$claude = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claude) {
    throw 'Claude Code CLI is not installed or not on PATH.'
}

. (Join-Path $PSScriptRoot 'configure-deepseek-claude.ps1') -Worker $Worker
Set-Location -LiteralPath $EscalaRepoRoot
Write-Host "Starting Escala $Worker backend worker ($EscalaWorkerModel, $EscalaWorkerEffort effort)."
& $claude.Source
