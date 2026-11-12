$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $siteRoot "src\index.template.html"
$outputPath = Join-Path $siteRoot "index.html"
$componentPattern = '<div\s+data-component="([^"]+)"\s*></div>'
$loaderTag = '<script src="assets/js/component-loader.js"></script>'

function Expand-PageComponents {
  param(
    [Parameter(Mandatory = $true)][string]$Markup,
    [Parameter(Mandatory = $true)][string]$Root,
    [string[]]$LoadedFiles = @()
  )

  $componentRegex = [regex]::new('<div\s+data-component="([^"]+)"\s*></div>')
  $evaluator = [System.Text.RegularExpressions.MatchEvaluator] {
    param($Match)

    $relativePath = $Match.Groups[1].Value.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $componentPath = [System.IO.Path]::GetFullPath((Join-Path $Root $relativePath))
    $rootPrefix = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar

    if (-not $componentPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Component path must stay inside the site: $relativePath"
    }
    if ($LoadedFiles -contains $componentPath) {
      throw "A component includes itself: $relativePath"
    }
    if (-not (Test-Path -LiteralPath $componentPath -PathType Leaf)) {
      throw "Component file was not found: $relativePath"
    }

    $componentMarkup = [System.IO.File]::ReadAllText($componentPath)
    return Expand-PageComponents -Markup $componentMarkup -Root $Root -LoadedFiles ($LoadedFiles + $componentPath)
  }

  return $componentRegex.Replace($Markup, $evaluator)
}

if (-not (Test-Path -LiteralPath $templatePath -PathType Leaf)) {
  throw "Homepage template was not found: $templatePath"
}

$markup = [System.IO.File]::ReadAllText($templatePath)
$markup = Expand-PageComponents -Markup $markup -Root $siteRoot

if (-not $markup.Contains($loaderTag)) {
  throw "The homepage template must include the component-loader script tag."
}
$markup = $markup.Replace(
  $loaderTag,
  '<script>document.documentElement.dataset.componentsReady = "true";</script>'
)

$settingsPath = Join-Path $siteRoot "site-settings.json"
$settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
$publicUrl = ([string]$settings.publicUrl).Trim().TrimEnd('/')
$robotsLines = @("User-agent: *", "Allow: /")

if ($publicUrl) {
  if ($publicUrl -notmatch '^https://') {
    throw "Set publicUrl in site-settings.json to a full HTTPS URL."
  }

  $canonicalUrl = "$publicUrl/"
  $canonicalTags = "  <link rel=`"canonical`" href=`"$canonicalUrl`">`n  <meta property=`"og:url`" content=`"$canonicalUrl`">`n</head>"
  $markup = $markup.Replace("</head>", $canonicalTags)

  $legalPath = Join-Path $siteRoot "legal\index.html"
  if (Test-Path -LiteralPath $legalPath -PathType Leaf) {
    $legalMarkup = [System.IO.File]::ReadAllText($legalPath)
    $legalMarkup = [regex]::Replace($legalMarkup, '\s*<link rel="canonical" href="[^"]*">', '')
    $legalCanonical = "$publicUrl/legal/index.html"
    $legalTags = "  <link rel=`"canonical`" href=`"$legalCanonical`">`n</head>"
    $legalMarkup = $legalMarkup.Replace("</head>", $legalTags)
    [System.IO.File]::WriteAllText($legalPath, $legalMarkup, [System.Text.UTF8Encoding]::new($false))
  }

  $sitemapContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>$publicUrl/</loc></url>
  <url><loc>$publicUrl/legal/index.html</loc></url>
</urlset>
"@
  $sitemapPath = Join-Path $siteRoot "sitemap.xml"
  [System.IO.File]::WriteAllText($sitemapPath, $sitemapContent, [System.Text.UTF8Encoding]::new($false))
  $robotsLines += "Sitemap: $publicUrl/sitemap.xml"
}

$robotsPath = Join-Path $siteRoot "robots.txt"
[System.IO.File]::WriteAllText($robotsPath, (($robotsLines -join "`n") + "`n"), [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($outputPath, $markup, [System.Text.UTF8Encoding]::new($false))

Write-Host "Built index.html from src and components."
