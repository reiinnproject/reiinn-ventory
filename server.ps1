# Simple static file server for REIINN-ventory (PowerShell, no Node/Python required)
$Port = 8080
$Root = $PSScriptRoot
$Prefix = "http://localhost:$Port/"

$MimeTypes = @{
    '.html' = 'text/html'
    '.htm'  = 'text/html'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.json' = 'application/json'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.ico'  = 'image/x-icon'
    '.svg'  = 'image/svg+xml'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($Prefix)
$listener.Start()

Write-Host "REIINN-ventory local server" -ForegroundColor Cyan
Write-Host "Serving: $Root" -ForegroundColor Gray
Write-Host "Open in browser: $Prefix" -ForegroundColor Green
Write-Host "  Main app:  ${Prefix}mylogin.html" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Gray

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/mylogin.html' }
        $filePath = Join-Path $Root ($path.TrimStart('/') -replace '/', [IO.Path]::DirectorySeparatorChar)

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [IO.Path]::GetExtension($filePath)
            $contentType = $MimeTypes[$ext]
            if (-not $contentType) { $contentType = 'application/octet-stream' }
            $response.ContentType = $contentType

            $bytes = [IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes("Not Found: $path")
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
