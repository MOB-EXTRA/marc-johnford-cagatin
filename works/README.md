# Work projects

Each finished project gets one folder containing its project metadata and a `thumbnails/` folder for showcase images. The site build checks the image path in `project.json`, then the conventional `thumbnails/1.png`, `thumbnails/main.png`, and `thumbnails/thumbnail.png` names. It writes only existing thumbnail files into `thumbnail-manifest.json`; the browser never requests a missing thumbnail. If none exists, the portfolio logo is used as the background. Run `npm run build` after adding or removing a thumbnail so the manifest stays current.

For projects without a `siteUrl`, the work-card arrow opens a screenshot gallery. Add `thumbnails/2.png`, `3.png`, and later numbered files; the build discovers existing numeric image files from 2 onward and writes them to `gallery-manifest.json`. The gallery is shared by all projects without an external site URL. Projects with `siteUrl` keep their arrow as a link to that site.

For a work with its own external site, set `siteUrl` and `siteIcon` in its `project.json`. `siteIcon` can be an absolute URL or a path relative to that project folder. If omitted, the portfolio tries `favicon.ico` beside the linked page, then falls back to the portfolio logo. Project names, links, and logos are loaded from each project's metadata; the portfolio header and browser favicon keep the portfolio's own branding.

`manifest.json` lists the project metadata files loaded by the portfolio. Add a project folder and metadata JSON, then add its metadata path to that manifest.

Thumbnail names can repeat between projects because each image lives in that project's own folder. Use `1.png` for the first thumbnail, `2.png` for a second, and so on. To change the default filename for a project, set its `thumbnail` field to a path relative to the project folder, such as `thumbnails/2.png`.
