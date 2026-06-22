#requires -Version 5.1
<#
.SYNOPSIS  Codex review bridge for Oscar's build -> review loop.
.DESCRIPTION
  Feeds the current git diff to the OpenAI Codex CLI and returns a JSON verdict.
  If Codex isn't installed, prints CODEX_NOT_INSTALLED + the diff so the reviewer
  agent can fall back to reviewing it directly.
#>
param(
  [string]$BaseRef = "",
  [string]$Context = "Review this Oscar change (Next.js + Drizzle/Aurora + Bedrock). Review adversarially. The CARDINAL rule: NON-CLINICAL — the app must never diagnose, grade, stage, or prescribe; clinical scores come from lib/domain (deterministic), never the LLM; every model output must pass assertNonClinical(); red flags route to the vet. Also check: correctness, Drizzle/timezone bugs, scale-licensing (no reproducing gated forms), schema.ts vs db/schema.sql drift, missing tests."
)
$ErrorActionPreference = "Stop"

function Get-Diff([string]$Ref) {
  if ($Ref) { $d = git diff $Ref -- . 2>$null } else { $d = git diff HEAD -- . 2>$null }
  if ([string]::IsNullOrWhiteSpace($d)) { $d = git diff --staged -- . 2>$null }
  return $d
}

$diff = Get-Diff $BaseRef
if ([string]::IsNullOrWhiteSpace($diff)) {
  Write-Output '{"approved": true, "blocking": [], "nits": [], "summary": "No changes to review."}'
  exit 0
}

$prompt = @"
$Context

Return ONLY JSON: { "approved": <bool>, "blocking": [ {"file":"","issue":"","fix":""} ], "nits": [], "summary":"" }
'approved' is true only if 'blocking' is empty.

=== GIT DIFF ===
$diff
"@

$codex = Get-Command codex -ErrorAction SilentlyContinue
if ($null -ne $codex) {
  try { $prompt | & codex exec --skip-git-repo-check }
  catch { Write-Output "CODEX_ERROR: $($_.Exception.Message)"; Write-Output "=== DIFF ==="; Write-Output $diff }
} else {
  Write-Warning "Codex CLI not found. Install: npm install -g @openai/codex ; then 'codex login'."
  Write-Output "CODEX_NOT_INSTALLED"
  Write-Output "=== DIFF FOR MANUAL/AGENT REVIEW ==="
  Write-Output $diff
}
