# Marc Johnford portfolio

## Site structure

- `src/index.template.html` is the HTML shell used to build the static homepage.
- `components/` contains the header, footer, main wrapper, and individual homepage sections.
- `assets/css/style.css` imports focused files from `assets/css/modules/`.
- `assets/js/site-config.js` stores brand text, external links, and shared image paths.
- `assets/js/` contains one script per site behavior.
- `works/manifest.json` lists portfolio work. Each project folder contains its metadata and a `thumbnails/` folder.
- `legal/index.html` contains the site’s consolidated legal and policy page.

## Build and preview

After editing the template or component files, run this in the VS Code PowerShell terminal from the project folder:

```powershell
npm.cmd run build
```

In PowerShell, `npm` may resolve to `npm.ps1`, which can be blocked by the script execution policy. `npm.cmd` calls the Windows command launcher and avoids changing that policy. Node.js must be installed. The build combines the HTML components into the root `index.html`, so browsers and search crawlers receive the page content in the initial HTML. Preview the site through a local web server such as VS Code Live Server. GitHub integration in VS Code is not required to edit or build the site locally.

## Search setup

Set `publicUrl` in `site-settings.json` to the portfolio’s deployed HTTPS origin, then rebuild. The build adds the canonical URL and creates `robots.txt` and `sitemap.xml`. Submit the sitemap in the search engine webmaster tools after deployment. Search engines decide whether and when to index a site.

## Add a finished project

Create `works/<project-slug>/project.json` and a `thumbnails/` folder, then add the metadata path to `works/manifest.json`. Add a matching card in `components/sections/selected-work.html`. Set that project’s `thumbnail` field to a path such as `thumbnails/homepage.webp` when an image is ready, then run the build command.
