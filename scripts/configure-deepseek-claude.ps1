param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('light', 'heavy')]
    [string]$Worker
)

$ErrorActionPreference = 'Stop'
$EscalaRepoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $EscalaRepoRoot '.env.local'

if (-not (Test-Path -LiteralPath $envFile)) {
    throw 'Missing .env.local. Add the separate DEEPSEEK_API_KEY there before starting Claude Code.'
}

$envValues = @{}
foreach ($line in Get-Content -LiteralPath $envFile) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
        $value = $Matches[2].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $envValues[$Matches[1]] = $value
    }
}

if ([string]::IsNullOrWhiteSpace($envValues['DEEPSEEK_API_KEY'])) {
    throw 'Set DEEPSEEK_API_KEY in ignored .env.local, then run this task again.'
}

$env:ANTHROPIC_BASE_URL = 'https://api.deepseek.com/anthropic'
$env:ANTHROPIC_AUTH_TOKEN = $envValues['DEEPSEEK_API_KEY']
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = 'deepseek-flash'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = 'deepseek-flash'
$env:CLAUDE_CODE_SUBAGENT_MODEL = 'deepseek-flash'
$env:ESCALA_WORKER_TIER = $Worker

if ($Worker -eq 'light') {
    $EscalaWorkerModel = 'deepseek-flash'
    $EscalaWorkerEffort = 'low'
    $env:ANTHROPIC_MODEL = $EscalaWorkerModel
    $env:ANTHROPIC_DEFAULT_OPUS_MODEL = 'deepseek-flash'
} else {
    # DeepSeek maps Claude model names beginning with "claude-opus" to V4 Pro.
    $EscalaWorkerModel = 'claude-opus-4-6'
    $EscalaWorkerEffort = 'high'
    $env:ANTHROPIC_MODEL = $EscalaWorkerModel
    $env:ANTHROPIC_DEFAULT_OPUS_MODEL = $EscalaWorkerModel
}

$env:CLAUDE_CODE_EFFORT_LEVEL = $EscalaWorkerEffort
