# 🚀 Implementierungsanleitung: SEO & KI-Strategie

Diese Anleitung erklärt, wie die SEO- und KI-Strategie schrittweise implementiert wird.

## 📋 Übersicht

Die Strategie umfasst:
1. ✅ **EventStructuredData** - JSON-LD Schema für Events (bereits integriert)
2. ✅ **robots.txt** - Crawler-Anweisungen (bereits erstellt)
3. ✅ **Sitemap-Utils** - Sitemap-Generierung (bereits erstellt)
4. ⏳ **Event-Interface erweitern** - SEO-Felder hinzufügen
5. ⏳ **URL-Struktur optimieren** - Slug-basierte URLs
6. ⏳ **KI-Anreicherung** - Backend-Integration

---

## ✅ Bereits implementiert

### 1. EventStructuredData Komponente

Die Komponente `EventStructuredData` wurde erstellt und in `EventDetail.tsx` integriert.

**Verwendung:**
```tsx
import { EventStructuredData } from "./EventStructuredData";

// In EventDetail.tsx bereits integriert
<EventStructuredData event={event} eventId={eventId || ""} />
```

**Was wird generiert:**
- Event Schema (Schema.org)
- InteractionCounter Schema (Community-Signale)
- BreadcrumbList Schema (Navigation)

### 2. robots.txt

Die Datei wurde in `/public/robots.txt` erstellt.

**Nächste Schritte:**
- Backend muss Sitemaps unter `/sitemap.xml` bereitstellen
- Sitemaps sollten dynamisch generiert werden

### 3. Sitemap-Utils

Die Datei `src/utils/sitemap.ts` enthält Hilfsfunktionen für Sitemap-Generierung.

**Verwendung:**
```typescript
import { generateEventUrls, generateSitemap } from "../utils/sitemap";

const events = await fetchEvents();
const urls = generateEventUrls(events);
const sitemapXml = generateSitemap(urls);
```

---

## ⏳ Nächste Schritte

### Schritt 1: Event-Interface erweitern

**Datei:** `src/utils.ts` oder Backend-API

**Erforderliche Felder hinzufügen:**
```typescript
interface Event {
  // ... bestehende Felder ...
  
  // NEU: SEO-Felder
  slug?: string;
  citySlug?: string;
  shortDescription?: string;
  timezone?: string;
  
  // NEU: Semantische Felder
  eventType?: EventType;
  genre?: Genre[];
  mood?: Mood[];
  
  // NEU: Community-Felder
  likeCount?: number;
  shareCount?: number;
  rsvpCount?: number;
}
```

**Backend-Integration:**
- Slug-Generierung beim Event-Erstellen
- KI-Anreicherung beim Event-Speichern
- Metadaten-Felder in Datenbank hinzufügen

### Schritt 2: URL-Struktur optimieren

**Aktuell:**
```
/event/:eventId
```

**Ziel:**
```
/event/:slug-:id
```

**Implementierung:**
```typescript
// In App.tsx
<Route path="/event/:slug-:id" element={<EventDetail />} />

// Slug aus URL extrahieren
const { slug, id } = useParams();
const eventId = id; // Verwende ID für API-Call
```

**Redirect-Logik:**
```typescript
// Alte URLs zu neuen URLs weiterleiten
if (eventId && !slug) {
  // Event laden und zu slug-basierter URL redirecten
  const event = await fetchEvent(eventId);
  navigate(`/event/${event.slug}-${event.id}`, { replace: true });
}
```

### Schritt 3: Canonical-Tags hinzufügen

**Datei:** `src/components/EventDetail/HelmMeta.tsx`

**Erweitern:**
```typescript
<link
  rel="canonical"
  href={`https://event-scanner.com/event/${event.slug || eventId}-${eventId}`}
/>
```

### Schritt 4: Filter-Seiten SEO-optimieren

**Datei:** `src/LandingPage.tsx` oder neue Komponente

**Implementierung:**
```typescript
// Meta-Robots für Filter-Seiten
const isIndexable = events.length >= 10; // Mind. 10 Events

<Helmet>
  {!isIndexable && (
    <meta name="robots" content="noindex, follow" />
  )}
</Helmet>
```

### Schritt 5: Sitemap-Generierung (Backend)

**Backend-Endpoint erstellen:**
```typescript
// GET /api/sitemap/events.xml
app.get('/api/sitemap/events.xml', async (req, res) => {
  const events = await Event.find({ 
    status: 'published',
    startDate: { $gte: new Date() } // Nur kommende Events
  });
  
  const urls = generateEventUrls(events);
  const sitemapXml = generateSitemap(urls);
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemapXml);
});
```

**Sitemap-Index:**
```typescript
// GET /api/sitemap.xml
app.get('/api/sitemap.xml', async (req, res) => {
  const sitemaps = [
    { loc: 'https://event-scanner.com/sitemap-events.xml', lastmod: new Date().toISOString() },
    { loc: 'https://event-scanner.com/sitemap-cities.xml', lastmod: new Date().toISOString() },
    // ... weitere Sitemaps
  ];
  
  const sitemapIndexXml = generateSitemapIndex(sitemaps);
  res.set('Content-Type', 'application/xml');
  res.send(sitemapIndexXml);
});
```

### Schritt 6: KI-Anreicherung (Backend)

**KI-Service erstellen:**
```typescript
// services/ai-enrichment.service.ts
export class AIEnrichmentService {
  async enrichEvent(event: Event): Promise<EnrichedEvent> {
    // 1. Text-Bereinigung
    const cleanedDescription = this.cleanText(event.description);
    
    // 2. Semantische Extraktion
    const eventType = await this.extractEventType(cleanedDescription);
    const genre = await this.extractGenre(cleanedDescription);
    const mood = await this.extractMood(cleanedDescription);
    
    // 3. Tag-Generierung
    const tags = await this.generateTags(event);
    
    // 4. Beschreibungs-Optimierung
    const shortDescription = await this.generateShortDescription(event);
    
    // 5. Slug-Generierung
    const slug = this.generateSlug(event.title, event.city, event.startDate);
    
    return {
      ...event,
      eventType,
      genre,
      mood,
      tags,
      shortDescription,
      slug,
    };
  }
  
  private generateSlug(title: string, city: string, date: Date): string {
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const year = date.getFullYear();
    
    return `${titleSlug}-${citySlug}-${year}`;
  }
}
```

**Integration beim Event-Speichern:**
```typescript
// Beim Event-Erstellen/Updaten
const enrichedEvent = await aiEnrichmentService.enrichEvent(eventData);
await Event.create(enrichedEvent);
```

### Schritt 7: Community-SEO

**Kommentare SEO-optimieren:**
```typescript
// src/components/Comment/CommentSection.tsx

// Erste 50 Kommentare im HTML rendern (für SEO)
const seoComments = comments.slice(0, 50);

// Weitere Kommentare lazy-loaden
const [showMore, setShowMore] = useState(false);
```

**Schema.org Comment-Markup:**
```typescript
// In EventStructuredData.tsx erweitern
const commentSchema = {
  "@context": "https://schema.org",
  "@type": "Comment",
  "author": {
    "@type": "Person",
    "name": comment.author.name
  },
  "text": comment.text,
  "dateCreated": comment.createdAt
};
```

---

## 🧪 Testing

### SEO-Testing

1. **Google Rich Results Test:**
   - https://search.google.com/test/rich-results
   - Event-URL eingeben und Schema validieren

2. **Schema.org Validator:**
   - https://validator.schema.org/
   - JSON-LD Code validieren

3. **robots.txt Testen:**
   - https://event-scanner.com/robots.txt
   - Crawler-Zugriff simulieren

4. **Sitemap Testen:**
   - https://event-scanner.com/sitemap.xml
   - XML-Struktur validieren

### Performance-Testing

1. **Lighthouse SEO-Score:**
   - Lighthouse in Chrome DevTools
   - SEO-Score sollte > 90 sein

2. **Core Web Vitals:**
   - LCP, FID, CLS messen
   - Strukturierte Daten sollten Performance nicht beeinträchtigen

---

## 📊 Monitoring

### Google Search Console

1. **Sitemap einreichen:**
   - Sitemap-URL in Search Console hinzufügen
   - Indexierungs-Status überwachen

2. **Coverage-Report:**
   - Indexierungs-Fehler überwachen
   - 404-Fehler bei alten URLs beheben

3. **Performance-Report:**
   - Klickrate für Event-Seiten überwachen
   - Durchschnittliche Position tracken

### Analytics

1. **Event-Tracking:**
   - Strukturierte Daten-Impressionen tracken
   - Rich Results-Klicks messen

2. **Conversion-Tracking:**
   - Ticket-Link-Klicks
   - Event-Detail-Seiten-Views

---

## 🔄 Wartung

### Regelmäßige Aufgaben

1. **Wöchentlich:**
   - Sitemap aktualisieren
   - Abgelaufene Events archivieren
   - Community-Content moderieren

2. **Monatlich:**
   - SEO-Performance analysieren
   - Keyword-Rankings überprüfen
   - Schema.org Updates prüfen

3. **Quartal:**
   - SEO-Strategie überarbeiten
   - KI-Modelle optimieren
   - Content-Qualität bewerten

---

## 🆘 Troubleshooting

### Problem: Strukturierte Daten werden nicht erkannt

**Lösung:**
- JSON-LD Syntax überprüfen
- Schema.org Validator verwenden
- Helmet-Komponente korrekt einbinden

### Problem: Sitemap wird nicht gecrawlt

**Lösung:**
- robots.txt prüfen
- Sitemap in Search Console einreichen
- XML-Syntax validieren

### Problem: Duplicate Content

**Lösung:**
- Canonical-Tags setzen
- Meta-Robots für Filter-Seiten
- Redirect-Logik für alte URLs

---

## 📚 Weitere Ressourcen

- [Schema.org Event](https://schema.org/Event)
- [Google Rich Results](https://developers.google.com/search/docs/appearance/structured-data/event)
- [SEO Best Practices](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

**Bei Fragen oder Problemen:** Siehe `SEO_KI_STRATEGIE.md` für detaillierte Erklärungen.
