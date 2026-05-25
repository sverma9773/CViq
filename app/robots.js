export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/editor/", "/cover-letter/editor/"], // Keep interactive dashboard & editors private from crawlers
    },
    sitemap: "https://cviqly.com/sitemap.xml",
  };
}
