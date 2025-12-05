# WhatsApp Share Feature - Testing Guide

## What Was Implemented

### 1. Enhanced WhatsApp Share Message
The WhatsApp share button now sends a formatted message with:
- **Bold title** using WhatsApp markdown
- Story description/strap
- Full article URL

### 2. Open Graph Meta Tags (Server-Side)
Created `src/app/article/[slug]/layout.tsx` that generates dynamic metadata for each article:
- `og:title` - Story title
- `og:description` - Story description  
- `og:image` - Story cover image (or PARI logo as fallback)
- `og:url` - Article URL
- `og:type` - "article"
- `og:site_name` - "PARI - People's Archive of Rural India"
- Twitter Card tags for better Twitter sharing

### 3. Client-Side Meta Tag Updates
Added dynamic meta tag updates in `StoryDetail.tsx` for client-side navigation.

## How to Test

### Testing the Share Message Format

1. Open any article page (e.g., http://localhost:3001/article/your-article-slug)
2. Click the Share button (share icon in the action buttons)
3. Click the WhatsApp button in the share modal
4. Verify the message format shows:
   ```
   *Article Title*

   Article description text here

   https://pari-project.vercel.app/article/your-article-slug
   ```

### Testing Open Graph Tags (WhatsApp Preview)

#### Option 1: Using Facebook Sharing Debugger (Recommended)
1. Go to https://developers.facebook.com/tools/debug/
2. Enter your article URL (e.g., `https://pari-project.vercel.app/article/your-article-slug`)
3. Click "Debug"
4. Verify the preview shows:
   - Correct title
   - Correct description
   - Story cover image (or PARI logo if no cover image)

#### Option 2: Using LinkedIn Post Inspector
1. Go to https://www.linkedin.com/post-inspector/
2. Enter your article URL
3. Click "Inspect"
4. Verify the preview

#### Option 3: Using Twitter Card Validator
1. Go to https://cards-dev.twitter.com/validator
2. Enter your article URL
3. Click "Preview card"
4. Verify the preview

#### Option 4: Testing in WhatsApp (Production Only)
**Note**: This only works for deployed URLs, not localhost.

1. Deploy your changes to production (Vercel)
2. Share the article URL in WhatsApp
3. WhatsApp will automatically generate a preview with:
   - Story image
   - PARI logo (if visible in the image or as fallback)
   - Title and description

### Important Notes

1. **Cache Issues**: WhatsApp caches Open Graph data. If you've shared a URL before:
   - Wait 24-48 hours for cache to expire, OR
   - Use the Facebook Sharing Debugger to scrape and refresh the cache

2. **Localhost Testing**: Open Graph previews don't work with localhost URLs. You must:
   - Deploy to a public URL (Vercel, Netlify, etc.)
   - Use the debugging tools mentioned above

3. **Image Requirements**: For best WhatsApp previews:
   - Image should be at least 1200x630 pixels
   - Less than 8MB in size
   - JPG, PNG, or WebP format

## Verifying the Implementation

### Check Server-Side Metadata
1. View page source of any article (Right-click → View Page Source)
2. Look for meta tags in the `<head>` section:
   ```html
   <meta property="og:title" content="Your Article Title - PARI">
   <meta property="og:description" content="Your article description">
   <meta property="og:image" content="https://...">
   <meta property="og:url" content="https://...">
   <meta property="og:type" content="article">
   <meta name="twitter:card" content="summary_large_image">
   ```

### Check Client-Side Updates
1. Open browser DevTools (F12)
2. Go to Elements/Inspector tab
3. Navigate to an article
4. Check the `<head>` section updates with correct meta tags

## Troubleshooting

### Preview Not Showing in WhatsApp
- Ensure the URL is publicly accessible (not localhost)
- Clear WhatsApp cache using Facebook Sharing Debugger
- Verify meta tags are present in page source
- Check image URL is accessible

### Image Not Loading
- Verify the image URL is publicly accessible
- Check image size (should be < 8MB)
- Ensure image format is supported (JPG, PNG, WebP)
- Check CORS headers allow external access

### Wrong Preview Data
- Clear cache using Facebook Sharing Debugger
- Verify the correct article data is being fetched
- Check the API response in browser DevTools Network tab

## Files Modified

1. `src/components/story/StoryDetail.tsx`
   - Enhanced `shareToWhatsApp` function
   - Added client-side meta tag updates

2. `src/app/article/[slug]/layout.tsx` (NEW)
   - Server-side metadata generation
   - Open Graph and Twitter Card tags

## Next Steps

1. Deploy to production (Vercel)
2. Test with real WhatsApp sharing
3. Monitor analytics to see share engagement
4. Consider adding more social sharing platforms if needed

