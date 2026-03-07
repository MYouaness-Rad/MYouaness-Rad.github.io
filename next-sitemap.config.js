/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Your website's URL
  siteUrl: 'https://MYouaness-Rad.github.io',

  // Automatically generate robots.txt
  generateRobotsTxt: true,

  // Exclude any pages you don't want indexed
  exclude: ['/404', '/secret-page'],

  // Number of URLs per sitemap file (default is 50,000)
  sitemapSize: 5000,

  // Optional: custom transformations for each sitemap entry
  transform: async (config, path) => {
    return {
      loc: path, // The URL
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    };
  }
};
