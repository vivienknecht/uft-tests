Write-Host "=== Detect changed files since last successful run ==="

$workspace     = $env:PIPELINE_WORKSPACE
$currentCommit = $env:BUILD_SOURCEVERSION.Trim()  # Trim whitespace

$artifactPath = Join-Path $workspace "last-successful"
$commitFile   = Join-Path $artifactPath "last_successful_commit.txt"

# Resolve baseline commit
if (Test-Path $commitFile) {
    $lastCommit = (Get-Content $commitFile -Raw).Trim()  # Trim whitespace/newlines
    Write-Host "Found last successful commit: $lastCommit"
}
else {
    $lastCommit = "$currentCommit^"
    Write-Host "No previous successful run found. Using fallback commit: $lastCommit"
}

Write-Host "##vso[task.setvariable variable=LAST_SUCCESSFUL_COMMIT]$lastCommit"

# Ensure full git history
git fetch --all --prune

Write-Host "Diffing $lastCommit -> HEAD"

# $files = git diff --name-status -M -z $lastCommit HEAD | Out-String
# if (-not $files) { $files = "" }

# $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($files))

# Write-Host "##vso[task.setvariable variable=MODIFIED_FILES]$encoded"
$files = git diff --name-status -M -z $lastCommit HEAD

$path = "$env:PIPELINE_WORKSPACE/modified_files.bin"
[System.IO.File]::WriteAllBytes($path, [Text.Encoding]::UTF8.GetBytes($files))

Write-Host "Modified files written to $path"

# Persist current commit for next run
$currentCommit | Out-File "last_successful_commit.txt" -Encoding ascii
