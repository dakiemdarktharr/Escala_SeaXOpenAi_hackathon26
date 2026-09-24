param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot '.env.local'
$briefFile = Join-Path $repoRoot 'docs\BACKEND_WORKER_BRIEF.md'
$claude = Get-Command claude -ErrorAction SilentlyContinue

if (-not $claude) { throw 'Claude Code CLI is not installed or not on PATH.' }
if (-not (Test-Path -LiteralPath $envFile)) { throw 'Missing .env.local.' }
if (-not (Test-Path -LiteralPath $briefFile)) { throw 'Missing backend worker brief.' }

$envValues = @{}
foreach ($line in Get-Content -LiteralPath $envFile) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*?)\s*$') {
        $value = $Matches[2].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $envValues[$Matches[1]] = $value
    }
}

if ([string]::IsNullOrWhiteSpace($envValues['DEEPSEEK_API_KEY'])) {
    throw 'Set a separate DEEPSEEK_API_KEY in the ignored .env.local file.'
}

$env:ANTHROPIC_BASE_URL = 'https://api.deepseek.com/anthropic'
$env:ANTHROPIC_AUTH_TOKEN = $envValues['DEEPSEEK_API_KEY']
$env:ANTHROPIC_MODEL = 'claude-opus-4-6'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = 'claude-opus-4-6'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = 'claude-opus-4-6'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = 'claude-opus-4-6'
$env:CLAUDE_CODE_SUBAGENT_MODEL = 'claude-opus-4-6'
$env:CLAUDE_CODE_EFFORT_LEVEL = 'low'

Set-Location -LiteralPath $repoRoot
$prompt = Get-Content -LiteralPath $briefFile -Raw
$arguments = @(
    '--bare', '--model', 'claude-opus-4-6', '--effort', 'low',
    '--permission-mode', 'acceptEdits', '--tools', 'Read,Edit',
    '--verbose', '--output-format', 'stream-json', '--include-partial-messages', '--print', $prompt
)
& $claude.Source @arguments
