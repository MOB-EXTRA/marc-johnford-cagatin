const fs = require("node:fs");
const path = require("node:path");

const siteRoot = path.resolve(__dirname, "..");
const templateFile = path.join(siteRoot, "src", "index.template.html");
const outputFile = path.join(siteRoot, "index.html");
const componentPattern = /<div\s+data-component="([^"]+)"\s*><\/div>/g;

function loadComponentTree(markup, loadedFiles = []) {
  return markup.replace(componentPattern, (placeholder, componentPath) => {
    const resolvedPath = path.resolve(siteRoot, componentPath);
    if (!resolvedPath.startsWith(`${siteRoot}${path.sep}`)) {
      throw new Error(`Component path must stay inside the site: ${componentPath}`);
    }
    if (loadedFiles.includes(resolvedPath)) {
      throw new Error(`A component includes itself: ${componentPath}`);
    }

    const component = fs.readFileSync(resolvedPath, "utf8");
    return loadComponentTree(component, [...loadedFiles, resolvedPath]);
  });
}

function buildSearchFiles(markup) {
  const settingsPath = path.join(siteRoot, "site-settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8").replace(/^\uFEFF/, ""));
  const publicUrl = (settings.publicUrl || "").trim().replace(/\/$/, "");
  const robots = ["User-agent: *", "Allow: /"];

  if (!publicUrl) {
    fs.writeFileSync(path.join(siteRoot, "robots.txt"), `${robots.join("\n")}\n`);
    return markup;
  }

  if (!/^https:\/\//i.test(publicUrl)) {
    throw new Error("site-settings.json publicUrl must be a full HTTPS URL.");
  }

  const canonical = `${publicUrl}/`;
  markup = markup.replace(
    "</head>",
    `  <link rel="canonical" href="${canonical}">\n  <meta property="og:url" content="${canonical}">\n</head>`,
  );

  const legalPagePath = path.join(siteRoot, "legal", "index.html");
  if (fs.existsSync(legalPagePath)) {
    const legalCanonical = `${publicUrl}/legal/index.html`;
    const legalSource = fs
      .readFileSync(legalPagePath, "utf8")
      .replace(/\s*<link rel="canonical" href="[^"]*">/g, "");
    const legalPage = legalSource.replace(
      "</head>",
      `  <link rel="canonical" href="${legalCanonical}">\n</head>`,
    );
    fs.writeFileSync(legalPagePath, legalPage);
  }

  const pages = ["", "legal/index.html"];
  const entries = pages
    .map((page) => `  <url>\n    <loc>${publicUrl}/${page}</loc>\n  </url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  fs.writeFileSync(path.join(siteRoot, "sitemap.xml"), sitemap);
  robots.push(`Sitemap: ${publicUrl}/sitemap.xml`);
  fs.writeFileSync(path.join(siteRoot, "robots.txt"), `${robots.join("\n")}\n`);
  return markup;
}

let markup = fs.readFileSync(templateFile, "utf8");
markup = loadComponentTree(markup);

const loaderTag = '<script src="assets/js/component-loader.js"></script>';
if (!markup.includes(loaderTag)) {
  throw new Error("The source template must include the component loader script tag.");
}
markup = markup.replace(
  loaderTag,
  '<script>document.documentElement.dataset.componentsReady = "true";</script>',
);
markup = buildSearchFiles(markup);

fs.writeFileSync(outputFile, markup);
console.log("Built static index.html from src and components.");
