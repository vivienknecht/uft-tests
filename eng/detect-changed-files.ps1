Write-Host "=== Detect changed files since last successful run ==="

# Required variables from Azure DevOps
$projectId     = $env:SYSTEM_TEAMPROJECTID
$definitionId  = $env:SYSTEM_DEFINITIONID
$branch        = $env:BUILD_SOURCEBRANCH
$workspace     = $env:PIPELINE_WORKSPACE
$currentCommit = $env:BUILD_SOURCEVERSION

$artifactName = "last-successful"
$artifactPath = Join-Path $workspace "last-successful"
$commitFile   = Join-Path $artifactPath "last_successful_commit.txt"

# Try to download last successful artifact
Write-Host "Attempting to download last successful commit artifact..."

$downloadCmd = @(
    "pipelines",
    "runs",
    "artifact",
    "download",
    "--project", $projectId,
    "--pipeline-id", $definitionId,
    "--branch", $branch,
    "--artifact-name", $artifactName,
    "--path", $artifactPath
)

$downloadResult = az @downloadCmd 2>$null

# Resolve baseline commit
if (Test-Path $commitFile) {
    $lastCommit = Get-Content $commitFile -Raw
    Write-Host "Found last successful commit: $lastCommit"
}
else {
    $lastCommit = "$currentCommit^"
    Write-Host "No previous successful run found. Using fallback: $lastCommit"
}

Write-Host "##vso[task.setvariable variable=LAST_SUCCESSFUL_COMMIT]$lastCommit"

# Ensure full git history
git fetch --all --prune

# Get changed files
Write-Host "Diffing $lastCommit -> HEAD"

$files = git diff --name-status -M -z $lastCommit HEAD | Out-String
if (-not $files) { $files = "" }

$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($files))

Write-Host "##vso[task.setvariable variable=MODIFIED_FILES]$encoded"

# Persist current commit for next run
$currentCommit | Out-File "last_successful_commit.txt" -Encoding ascii

Write-Host "Publishing last successful commit artifact"
