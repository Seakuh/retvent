import { Helmet } from "react-helmet-async";

export const HelmetMeta = () => {
  return (
    <Helmet>
      <title>EventScanner</title>
      <meta name="description" content="EventScanner" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

      <title>EventScanner - Discover Events everywhere</title>
      <meta
        name="description"
        content="Find the best events in your city with EventScanner! Get real-time updates, interactive maps, and personalized recommendations for concerts, festivals, and more."
      />
      <meta
        name="keywords"
        content="events, live events, concerts, parties, city events, festivals, open air, event finder, local events, entertainment"
      />
      <meta name="author" content="EventScanner Team" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href="https://event-scanner.com/" />

      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="EventScanner" />

      <meta property="og:site_name" content="EventScanner" />
      <meta
        property="og:title"
        content="EventScanner - Discover Amazing Events Near You"
      />
      <meta
        property="og:description"
        content="Find the best events in your city! Get real-time updates, interactive maps, and personalized recommendations for an unforgettable experience."
      />
      <meta
        property="og:image"
        content="https://event-scanner.com/social-share.png"
      />
      <meta property="og:url" content="https://event-scanner.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="EventScanner App Preview" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@eventscanner" />
      <meta
        name="twitter:title"
        content="EventScanner - Your Ultimate Event Discovery Platform"
      />
      <meta
        name="twitter:description"
        content="Find the best events in your city! Get real-time updates, interactive maps, and personalized recommendations for an unforgettable experience."
      />
      <meta
        name="twitter:image"
        content="https://event-scanner.com/social-share.png"
      />
    </Helmet>
  );
};
