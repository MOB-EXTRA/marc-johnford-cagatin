/* Fills project cards from the editable works manifest and project metadata. */
async function initializeWorkProjects() {
  try {
    const manifestResponse = await fetch("works/manifest.json");
    if (!manifestResponse.ok) throw new Error("Could not load the work manifest.");
    const manifest = await manifestResponse.json();

    await Promise.all(
      manifest.projects.map(async (metadataPath) => {
        const response = await fetch(metadataPath);
        if (!response.ok) throw new Error(`Could not load ${metadataPath}.`);
        const project = await response.json();
        const card = document.querySelector(`[data-project-id="${project.id}"]`);
        if (!card) return;

        card.querySelectorAll("[data-project-field]").forEach((field) => {
          const value = project[field.dataset.projectField];
          if (value) field.textContent = value;
        });

        const siteUrl = window.SITE_CONFIG?.links?.[project.linkKey];
        if (siteUrl) {
          card.querySelectorAll("[data-site-link]").forEach((link) => {
            link.href = siteUrl;
          });
        }

        const backgroundIcon = card.querySelector("[data-project-background-icon]");
        const siteIcon = window.SITE_CONFIG?.assets?.siteIcon;
        const fallbackIcon = window.SITE_CONFIG?.assets?.fallbackSiteIcon;
        if (backgroundIcon && siteIcon) {
          backgroundIcon.addEventListener(
            "error",
            () => {
              if (fallbackIcon) backgroundIcon.src = fallbackIcon;
            },
            { once: true },
          );
          backgroundIcon.src = window.getSiteAssetUrl?.(siteIcon) || siteIcon;
        }

        const thumbnail = card.querySelector("[data-project-thumbnail]");
        if (thumbnail && project.thumbnail) {
          thumbnail.src = new URL(project.thumbnail, new URL(".", new URL(metadataPath, document.baseURI)));
          thumbnail.alt = project.thumbnailAlt || `${project.title} thumbnail`;
          thumbnail.hidden = false;
          thumbnail.addEventListener("error", () => {
            thumbnail.hidden = true;
          }, { once: true });
        }
      }),
    );
  } catch (error) {
    console.error("Work project details could not be loaded:", error);
  }
}

if (document.documentElement.dataset.componentsReady === "true") {
  initializeWorkProjects();
} else {
  document.addEventListener("site:components-ready", initializeWorkProjects, { once: true });
}
