
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://pari-project.vercel.app',
  generateRobotsTxt: true,
  // Use the built-in Next.js sitemap generation
  outDir: './public',
  // Additional configuration
  changefreq: 'daily',
  priority: 0.7,
}

