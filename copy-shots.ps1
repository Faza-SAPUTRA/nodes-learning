$brainDir = "C:\Users\erlan\.gemini\antigravity-ide\brain\67debfea-1da3-418c-8154-20a6908efe39"
$dstDir = "d:\Kuliah\IMK\UXFlow\Mockup\nodes-ads\public\screenshots"

$files = @{
    "dashboard_expanded_1792328269982.png" = "dashboard.png"
    "modules_page_1792328279689.png" = "modules.png"
    "canvas_page_1792328288536.png" = "canvas.png"
    "collab_page_1792328297727.png" = "collab.png"
    "profile_page_1792328308052.png" = "profile.png"
}

foreach ($src in $files.Keys) {
    $srcPath = Join-Path $brainDir $src
    $dstPath = Join-Path $dstDir $files[$src]
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $dstPath -Force
        Write-Host "OK: $($files[$src])"
    } else {
        Write-Host "NOT FOUND: $src"
    }
}
