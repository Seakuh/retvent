# ✅ Nächste Schritte - Priorisierte Checkliste

## 🚀 Phase 1: Quick Wins (Sofort umsetzbar)

### ✅ Bereits erledigt:
- [x] Event-Interface erweitert (`src/types/event.ts`)
- [x] EventStructuredData Komponente erstellt
- [x] robots.txt erstellt
- [x] Sitemap-Utils erstellt
- [x] Strategiedokumentation erstellt

### 🔥 Sofort umsetzbar (Frontend):

#### 1. EventStructuredData in EventDetail integrieren ✅
**Status:** Bereits integriert in `EventDetail.tsx`

**Testen:**
```bash
# 1. App starten
npm run dev

# 2. Event-Detailseite öffnen
# 3. Seitenquelltext anzeigen (Strg+U)
# 4. Nach "application/ld+json" suchen
# 5. JSON-LD sollte sichtbar sein
```

#### 2. Canonical-Tags verbessern
**Datei:** `src/components/EventDetail/HelmMeta.tsx`

**Aktion:**
```typescript
// Aktuell:
<link rel="canonical" href={`https://event-scanner.com/event/${eventId}`} />

// Verbessert (mit Slug, falls vorhanden):
<link 
  rel="canonical" 
  href={`https://event-scanner.com/event/${event.slug ? `${event.slug}-${eventId}` : eventId}`} 
/>
```

#### 3. Meta-Robots für Filter-Seiten
**Datei:** `src/LandingPage.tsx` oder neue Komponente

**Aktion:**
```typescript
// Prüfe ob genug Events vorhanden sind
const isIndexable = events.length >= 10;

<Helmet>
  {!isIndexable && (
    <meta name="robots" content="noindex, follow" />
  )}
</Helmet>
```

---

## 🔧 Phase 2: Backend-Integration (Wichtig!)

### 1. API erweitern - Neue Felder unterstützen

**Backend-Endpoints prüfen/anpassen:**

```typescript
// GET /api/events/:id
// Sollte jetzt auch neue Felder zurückgeben:
{
  id: "123",
  title: "Techno Party",
  slug: "techno-party-berlin-2024",  // NEU
  eventType: "club-night",           // NEU
  genre: ["techno"],                 // NEU
  // ... bestehende Felder
}

// POST /api/events (Event erstellen)
// Sollte neue Felder akzeptieren und speichern
```

**Checkliste:**
- [ ] Backend-Model erweitern (MongoDB Schema)
- [ ] API-Endpoints anpassen
- [ ] Validierung für neue Felder hinzufügen
- [ ] Migration für bestehende Events (optional)

### 2. Slug-Generierung implementieren

**Backend-Service erstellen:**

```typescript
// services/slug.service.ts
export function generateEventSlug(
  title: string, 
  city: string, 
  date: Date
): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const year = date.getFullYear();
  
  return `${titleSlug}-${citySlug}-${year}`;
}

// Beim Event-Erstellen:
const slug = generateEventSlug(event.title, event.city, event.startDate);
```

**Checkliste:**
- [ ] Slug-Generierung implementieren
- [ ] Eindeutigkeit prüfen (falls Slug bereits existiert, Nummer anhängen)
- [ ] Beim Event-Erstellen automatisch Slug generieren
- [ ] Migration: Slug für bestehende Events generieren

### 3. URL-Struktur anpassen (Frontend + Backend)

**Frontend:** `src/App.tsx`

```typescript
// Aktuell:
<Route path="/event/:eventId" element={<EventDetail />} />

// Neu (beide unterstützen für Migration):
<Route path="/event/:slug-:id" element={<EventDetail />} />
<Route path="/event/:eventId" element={<EventDetail />} /> // Fallback für alte URLs
```

**EventDetail.tsx anpassen:**

```typescript
const { slug, id, eventId } = useParams();
const finalEventId = id || eventId; // Unterstützt beide Formate

// Wenn nur ID vorhanden, Event laden und zu Slug-URL redirecten
useEffect(() => {
  if (eventId && !slug && event?.slug) {
    navigate(`/event/${event.slug}-${event.id}`, { replace: true });
  }
}, [event, eventId, slug, navigate]);
```

**Checkliste:**
- [ ] Route für Slug-URLs hinzufügen
- [ ] Redirect-Logik für alte URLs
- [ ] Backend unterstützt beide URL-Formate

---

## 🤖 Phase 3: KI-Anreicherung (Optional, aber empfohlen)

### 1. KI-Service Setup (Backend)

**Option A: Externe KI-API (OpenAI, Claude, etc.)**

```typescript
// services/ai-enrichment.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function enrichEvent(event: Event): Promise<Partial<Event>> {
  const prompt = `Klassifiziere dieses Event:
Titel: ${event.title}
Beschreibung: ${event.description}
Stadt: ${event.city}

Antworte im JSON-Format:
{
  "eventType": "concert|festival|club-night|...",
  "genre": ["techno", "house"],
  "mood": ["energetic", "party"],
  "shortDescription": "Kurze SEO-optimierte Beschreibung (max 160 Zeichen)"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
```

**Option B: Lokale KI/LLM**

```typescript
// Für lokale Implementierung mit eigenen Modellen
// oder einfachere Regel-basierte Klassifikation
```

**Checkliste:**
- [ ] KI-Service erstellen
- [ ] API-Key konfigurieren (falls extern)
- [ ] Beim Event-Erstellen automatisch anreichern
- [ ] Batch-Job für bestehende Events (optional)

### 2. Event-Anreicherung triggern

**Backend: Event-Erstellen/Updaten**

```typescript
// POST /api/events
app.post('/api/events', async (req, res) => {
  const eventData = req.body;
  
  // Slug generieren
  const slug = generateEventSlug(eventData.title, eventData.city, eventData.startDate);
  
  // KI-Anreicherung (optional, kann auch async im Hintergrund laufen)
  const enrichedData = await enrichEvent(eventData);
  
  const event = await Event.create({
    ...eventData,
    slug,
    ...enrichedData,
  });
  
  res.json(event);
});
```

**Checkliste:**
- [ ] KI-Anreicherung beim Event-Erstellen
- [ ] Fehlerbehandlung (falls KI-Service ausfällt)
- [ ] Caching für ähnliche Events

---

## 📊 Phase 4: Sitemap-Generierung (Backend)

### 1. Sitemap-Endpoints erstellen

**Backend-Endpoints:**

```typescript
// GET /sitemap.xml (Sitemap-Index)
app.get('/sitemap.xml', async (req, res) => {
  const sitemaps = [
    { loc: 'https://event-scanner.com/sitemap-events.xml', lastmod: new Date().toISOString() },
    { loc: 'https://event-scanner.com/sitemap-cities.xml', lastmod: new Date().toISOString() },
    // ... weitere
  ];
  
  const sitemapIndexXml = generateSitemapIndex(sitemaps);
  res.set('Content-Type', 'application/xml');
  res.send(sitemapIndexXml);
});

// GET /sitemap-events.xml
app.get('/sitemap-events.xml', async (req, res) => {
  const events = await Event.find({ 
    status: 'published',
    startDate: { $gte: new Date() } // Nur kommende Events
  }).limit(50000);
  
  const urls = generateEventUrls(events);
  const sitemapXml = generateSitemap(urls);
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

// GET /sitemap-cities.xml
app.get('/sitemap-cities.xml', async (req, res) => {
  const cities = await Event.distinct('city');
  const urls = generateCityUrls(cities);
  const sitemapXml = generateSitemap(urls);
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemapXml);
});
```

**Checkliste:**
- [ ] Sitemap-Endpoints erstellen
- [ ] Sitemap-Index erstellen
- [ ] Event-Sitemap generieren
- [ ] Stadt-Sitemap generieren
- [ ] robots.txt auf Sitemaps verweisen (bereits erledigt ✅)

---

## 🧪 Phase 5: Testing & Validierung

### 1. SEO-Testing

**Google Rich Results Test:**
- [ ] https://search.google.com/test/rich-results
- [ ] Event-URL eingeben
- [ ] Schema validieren

**Schema.org Validator:**
- [ ] https://validator.schema.org/
- [ ] JSON-LD Code validieren

**robots.txt Testen:**
- [ ] https://event-scanner.com/robots.txt aufrufen
- [ ] Struktur prüfen

### 2. Frontend-Testing

**Lighthouse SEO-Score:**
- [ ] Chrome DevTools → Lighthouse
- [ ] SEO-Score sollte > 90 sein
- [ ] Strukturierte Daten sollten erkannt werden

**Manuelle Tests:**
- [ ] Event-Detailseite öffnen
- [ ] Seitenquelltext prüfen (JSON-LD sichtbar?)
- [ ] Meta-Tags prüfen (Title, Description, OG-Tags)

### 3. Backend-Testing

**API-Tests:**
- [ ] Event mit neuen Feldern erstellen
- [ ] Event mit Slug abrufen
- [ ] Slug-Generierung testen
- [ ] KI-Anreicherung testen (falls implementiert)

---

## 📈 Phase 6: Monitoring & Optimierung

### 1. Google Search Console einrichten

**Checkliste:**
- [ ] Website in Search Console hinzufügen
- [ ] Sitemap einreichen (`/sitemap.xml`)
- [ ] Indexierungs-Status überwachen
- [ ] Coverage-Report prüfen

### 2. Analytics einrichten

**Checkliste:**
- [ ] Event-Tracking für strukturierte Daten
- [ ] Rich Results-Klicks messen
- [ ] Conversion-Tracking (Ticket-Links)

---

## 🎯 Prioritäten-Empfehlung

### 🔥 Sofort (diese Woche):
1. ✅ EventStructuredData testen (bereits integriert)
2. Canonical-Tags verbessern
3. Backend-Model erweitern (neue Felder unterstützen)
4. Slug-Generierung implementieren

### 📅 Kurzfristig (diese Woche):
5. URL-Struktur anpassen (Slug-URLs)
6. Sitemap-Endpoints erstellen
7. SEO-Testing durchführen

### 🚀 Mittelfristig (nächste 2 Wochen):
8. KI-Anreicherung implementieren
9. Google Search Console einrichten
10. Monitoring & Analytics

### 💡 Langfristig (optional):
11. Batch-Job für bestehende Events (Slug-Generierung)
12. KI-Anreicherung für bestehende Events
13. Performance-Optimierung

---

## 🆘 Hilfe & Ressourcen

**Dokumentation:**
- `SEO_KI_STRATEGIE.md` - Vollständige Strategie
- `IMPLEMENTIERUNG_SEO_KI.md` - Detaillierte Implementierung
- `src/utils/sitemap.ts` - Sitemap-Utils
- `src/components/EventDetail/EventStructuredData.tsx` - JSON-LD Komponente

**Externe Ressourcen:**
- [Schema.org Event](https://schema.org/Event)
- [Google Rich Results](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google Search Console](https://search.google.com/search-console)

---

## ✅ Quick Check: Was funktioniert bereits?

```bash
# 1. Frontend starten
npm run dev

# 2. Event-Detailseite öffnen
# 3. Browser DevTools → Elements → Nach "application/ld+json" suchen
# 4. JSON-LD sollte vorhanden sein ✅

# 5. robots.txt prüfen
curl http://localhost:5173/robots.txt
# Sollte robots.txt anzeigen ✅
```

---

**Nächster Schritt:** Beginne mit **Phase 1, Schritt 2** (Canonical-Tags verbessern) - das ist schnell umsetzbar und bringt sofort SEO-Mehrwert!
