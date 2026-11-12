/*
 * Site identity and external links.
 * Update this file to change destinations across the site.
 */
window.SITE_CONFIG = Object.freeze({
  brandName: "Marc Johnford",
  brandAccent: "Marc Johnford Cagatin",
  nickname: "Vile Tempest",
  projectName: "MOB EXTRA",
  linkedSiteName: "Vile Tempest Official",
  assets: {
    siteIcon: "https://mob-extra.github.io/Vile-Tempest-Official/assets/img/favicon.png",
    fallbackSiteIcon: "assets/images/favicon.png",
  },
  links: {
    website: "https://mob-extra.github.io/Vile-Tempest-Official/index.html",
    youtubeChannel: "https://www.youtube.com/channel/UCbDtYZS08VvB6luAcyn08bQ",
    youtubeVideos:
      "https://www.youtube.com/channel/UCbDtYZS08VvB6luAcyn08bQ/videos",
    youtubeCommunity:
      "https://www.youtube.com/channel/UCbDtYZS08VvB6luAcyn08bQ/community",
    slimeSpaceHub: "https://mob-extra.github.io/SlimeSpace/",
    emailAddress: "mob.extra.contact@gmail.com",
    emailComposeUrl:
      "mailto:mob.extra.contact@gmail.com?subject=Inquiry%20/%20Commission%20Request%20%E2%80%94%20Vile%20Tempest",
    facebook: "https://facebook.com/vile.tempest.extra",
    tiktok: "https://tiktok.com/@vile.tempest.extr",
    twitter: "https://x.com/VileTempestExtr",
  },
});

const siteAssetVersion = Date.now().toString();
window.getSiteAssetUrl = (assetPath) => {
  const assetUrl = new URL(assetPath, document.baseURI);
  if (assetUrl.origin !== window.location.origin) {
    assetUrl.searchParams.set("portfolio_refresh", siteAssetVersion);
  }
  return assetUrl.href;
};
