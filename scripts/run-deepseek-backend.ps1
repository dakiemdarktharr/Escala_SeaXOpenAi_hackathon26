param(
    [ValidateSet('light', 'heavy')]
    [string]$Worker = 'heavy',
    [string]$BriefFile = 'docs\NEXT_BACKEND_TASK.md'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$claude = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claude) { throw 'Claude Code CLI is not installed or not on PATH.' }

if ([System.IO.Path]::IsPathRooted($BriefFile)) {
    $resolvedBrief = $BriefFile
} else {
    $resolvedBrief = Join-Path $repoRoot $BriefFile
}
if (-not (Test-Path -LiteralPath $resolvedBrief)) {
    throw "Missing task brief: $BriefFile"
}

$brief = Get-Content -LiteralPath $resolvedBrief -Raw
if ([string]::IsNullOrWhiteSpace($brief) -or $brief -match '(?im)^\s*(?:STATUS:\s*EMPTY|\[TODO\]|\{\{TODO\}\}|TODO:|TBD)') {
    throw 'The backend task brief is a template or empty. The orchestrator must write a scoped, ready-to-run brief first.'
}

. (Join-Path $PSScriptRoot 'configure-deepseek-claude.ps1') -Worker $Worker

$tierInstructions = if ($Worker -eq 'light') {
@'
You are light_worker using DeepSeek Flash at low effort. Take only bounded backend work that is mechanical, deterministic, localized, or low-risk and can be isolated by file. Prefer implementing the simple independent slice assigned here; do not design architecture, migrations, auth/security policy, or cross-cutting APIs. If the task is explicitly a review checkpoint, inspect only the listed frozen Heavy checkpoint files and the supplied contract/diff. Fix a clear, localized defect only when the orchestrator has assigned that path to you; otherwise report a concise finding for the orchestrator. Never rewrite Heavy's work wholesale.
'@
} else {
@'
You are heavy_worker using DeepSeek V4 Pro at high effort. Own the difficult backend reasoning, architectural choices, security-sensitive behavior, API invariants, persistence boundaries, and complex integration assigned here. Keep interfaces explicit and send a short frozen-file checkpoint when ready for light_worker review; do not edit checkpointed paths while they are under review. Leave low-risk mechanical follow-up work to light_worker when the orchestrator assigned it. Never commit or push.
'@
}

$prompt = @"
$tierInstructions

Shared workflow: read the concise task brief first, then only the named source files and relevant contract/docs. Do not rescan the whole repository or restate the plan. Work only in Owned Files. Do not read, print, or expose .env.local or credentials. Do not commit, push, deploy, send buyer messages, or mutate marketplace orders. Use the brief's checks only when tools are available. Report at most six bullets: changed paths, checks actually run, assumptions, unresolved blockers, and (for a review) exact file/line findings.

--- Scoped backend task brief ---
$brief
--- End task brief ---
"@

Set-Location -LiteralPath $EscalaRepoRoot
$arguments = @(
    '--bare', '--model', $EscalaWorkerModel, '--effort', $EscalaWorkerEffort,
    '--permission-mode', 'acceptEdits', '--tools', 'Read,Edit',
    '--verbose', '--output-format', 'stream-json', '--include-partial-messages', '--print', $prompt
)
& $claude.Source @arguments
