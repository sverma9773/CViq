export default async function sitemap() {
  const baseUrl = "https://cviqly.com";
  
  // Define main pages
  const staticRoutes = [
    "",
    "/login",
    "/register",
    "/pricing",
  ];

  const routes = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  return routes;
}
