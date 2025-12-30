# Event Embed Documentation

## Overview
The `/events/embed` route provides an iframe-embeddable event gallery with horizontal scrolling, designed in a modern card-based layout. The embed can be customized through URL parameters for seamless integration into any website.

## Security Headers
The embed route is configured with proper CSP (Content-Security-Policy) headers:
- **Embed Route**: `Content-Security-Policy: frame-ancestors *` - Allows embedding from any domain
- **Other Routes**: `Content-Security-Policy: frame-ancestors 'self'` - Prevents embedding for security

## URL Parameters

### Display Options
- `limit` (number, default: 10) - Maximum number of events to display
- `mainColor` (hex color, default: #000000) - Background color of the embed
- `secondaryColor` (hex color, default: #1a1a1a) - Card background color

### Event Filters
All filter parameters are optional. Events are fetched and then filtered based on provided parameters.

**Required Fields** (always displayed if available):
- `title` (string) - Event title (partial match, case-insensitive)
- `startDate` (YYYY-MM-DD) - Event start date

**Optional Fields**:
- `description` (string) - Event description (partial match, case-insensitive)
- `imageUrl` (string) - Exact image URL match
- `startTime` (HH:MM) - Event start time
- `endDate` (YYYY-MM-DD) - Event end date
- `endTime` (HH:MM) - Event end time
- `organizerId` (string) - Host/organizer ID
- `locationId` (string) - Location ID
- `artistIds` (comma-separated) - Filter by artist names in lineup
- `tags` (comma-separated) - Filter by event tags

## Example Usage

### Basic Embed
```html
<iframe
  src="https://yourdomain.com/events/embed?limit=5"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### Custom Colors (Dark Theme)
```html
<iframe
  src="https://yourdomain.com/events/embed?limit=8&mainColor=%231a1a2e&secondaryColor=%23252541"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### Filter by Title
```html
<iframe
  src="https://yourdomain.com/events/embed?title=concert&limit=10"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### Filter by Date Range
```html
<iframe
  src="https://yourdomain.com/events/embed?startDate=2025-01-01&limit=15"
  width="100%"
  height="800"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### Filter by Tags
```html
<iframe
  src="https://yourdomain.com/events/embed?tags=music,festival&limit=12&mainColor=%236366f1"
  width="100%"
  height="700"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### Partner Integration Example
For embedding on partner sites like retromountainphangan.com:
```html
<iframe
  src="https://yourdomain.com/events/embed?tags=phangan,beach&limit=20&mainColor=%23000000&secondaryColor=%231a1a1a"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  allowfullscreen>
</iframe>
```

### Advanced Filtering
```html
<iframe
  src="https://yourdomain.com/events/embed?organizerId=123&tags=concert,live&startDate=2025-02-01&limit=10"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen>
</iframe>
```

## Implementation Notes

### Development
The Vite dev server is configured with a custom plugin that sets the appropriate CSP headers for the embed route.

### Production
For production deployments:
- **Netlify/Cloudflare**: The `public/_headers` file will automatically apply the correct headers
- **Nginx**: Add the following to your nginx config:
  ```nginx
  location /events/embed {
    add_header Content-Security-Policy "frame-ancestors *";
  }

  location / {
    add_header Content-Security-Policy "frame-ancestors 'self'";
    add_header X-Frame-Options "SAMEORIGIN";
  }
  ```
- **Apache**: Add to `.htaccess`:
  ```apache
  <LocationMatch "^/events/embed">
    Header set Content-Security-Policy "frame-ancestors *"
  </LocationMatch>
  ```

### Responsive Design
The embed features a horizontal scrolling layout that adapts to all screen sizes:
- **Desktop**: Horizontal scroll with mouse wheel support (320px cards)
- **Tablet**: Touch-friendly horizontal scrolling (320px cards)
- **Mobile**: Optimized horizontal scrolling (280px cards)

### Interaction Features
- **Desktop**: Use mouse wheel to scroll horizontally through events
- **Mobile/Touch**: Swipe to scroll through events
- **Hover Effects**: Cards lift and scale on hover (desktop)
- **Click**: Opens event detail page in new tab

### Click Behavior
Clicking on an event card opens the event detail page in a new tab on the main site.

## Security Considerations

1. **CSP Headers**: Only the `/events/embed` route allows iframe embedding
2. **XSS Prevention**: All user inputs are sanitized
3. **CORS**: The embed route respects CORS policies
4. **Rate Limiting**: Consider implementing rate limiting on the API level

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Support
For issues or questions, contact the development team or refer to the main documentation.
