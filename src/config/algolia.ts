// Algolia configuration
export const ALGOLIA_CONFIG = {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'YOUR_ALGOLIA_APP_ID',
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || 'YOUR_ALGOLIA_SEARCH_API_KEY',
  indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles'
}