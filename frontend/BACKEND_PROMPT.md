# 🎯 Backend-Prompt: SEO & KI-Integration für Event-Plattform

## 📋 Kontext

Ich entwickle eine Event-Plattform (Node.js/Express + MongoDB) und muss die Backend-API erweitern, um:

1. **SEO-optimierte Event-Daten** zu unterstützen
2. **Slug-Generierung** für URL-freundliche Event-URLs
3. **KI-Anreicherung** für Events (optional)
4. **Sitemap-Generierung** für SEO
5. **Abwärtskompatibilität** sicherstellen (bestehende Events funktionieren weiterhin)

---

## 🎯 Aufgaben

### 1. Event-Model erweitern (MongoDB Schema)

**Aktuelles Schema erweitern um:**

```javascript
{
  // ========== BESTEHENDE FELDER (unverändert) ==========
  _id: ObjectId,
  id: String,
  title: String,
  description: String,
  city: String,
  // ... alle bestehenden Felder bleiben erhalten

  // ========== NEUE SEO-FELDER ==========
  slug: String,                    // URL-freundlich (z.B. "techno-party-berlin-2024")
  citySlug: String,                // URL-freundlich (z.B. "berlin")
  shortDescription: String,         // Meta-Description (max 160 Zeichen)
  region: String,                  // Bundesland/Region
  country: String,                 // Land (z.B. "Deutschland")
  timezone: String,                // Zeitzone (z.B. "Europe/Berlin")
  categorySlug: String,            // URL-freundlich
  subcategory: String,             // Unterkategorie

  // Strukturierte Adresse
  address: {
    street: String,
    houseNumber: String,
    postalCode: String,
    city: String,
    country: String
  },

  // Venue-Informationen
  venue: {
    name: String,
    venueId: String,
    venueSlug: String,
    capacity: Number,
    venueType: String  // "club" | "open-air" | "theater" | "stadium" | "other"
  },

  // ========== SEMANTISCHE FELDER FÜR KI ==========
  eventType: String,               // "concert" | "festival" | "club-night" | "theater" | "sports" | "workshop" | "networking" | "exhibition" | "conference" | "party" | "comedy" | "other"
  eventFormat: String,             // "live" | "hybrid" | "online" | "outdoor" | "indoor"
  genre: [String],                 // ["techno", "house", "hip-hop", ...]
  mood: [String],                  // ["energetic", "chill", "romantic", ...]
  
  vibe: {
    energy: Number,                // 0-100
    intimacy: Number,              // 0-100
    exclusivity: Number,           // 0-100
    social: Number                 // 0-100
  },

  audience: {
    ageRange: [Number, Number],   // [18, 35]
    targetAudience: [String],      // ["students", "professionals", ...]
    accessibility: {
      wheelchairAccessible: Boolean,
      hearingImpaired: Boolean,
      visualImpaired: Boolean
    }
  },

  recurrence: {
    pattern: String,               // "single" | "daily" | "weekly" | "monthly" | "yearly" | "custom"
    interval: Number,
    endDate: Date,
    occurrences: Number
  },

  eventSeriesId: String,
  eventSeries: {
    name: String,
    slug: String,
    totalEvents: Number
  },

  // Ähnliche Events (KI-generiert)
  similarEventIds: [String],
  clusterId: String,

  // ========== COMMUNITY-FELDER ==========
  likeCount: Number,               // Anzahl Likes (alternativ zu likeIds?.length)
  shareCount: Number,              // Anzahl Shares
  rsvpCount: Number,               // Anzahl RSVPs

  groupActivity: {
    activeGroups: Number,
    totalMessages: Number,
    lastActivity: Date
  },

  popularitySignals: {
    trendingScore: Number,
    hotnessScore: Number,
    qualityScore: Number,
    engagementRate: Number
  },

  // ========== ORGANISATOR ==========
  organizer: {
    name: String,
    organizerId: String,
    organizerSlug: String,
    verified: Boolean
  },

  // ========== COMMERZIELLE FELDER ==========
  priceDetails: {
    amount: Number,
    currency: String,
    priceRange: String,            // "free" | "low" | "medium" | "high" | "premium"
    ticketTypes: [{
      name: String,
      price: Number,
      currency: String,
      available: Number,
      soldOut: Boolean
    }]
  },

  // ========== TECHNISCHE FELDER ==========
  status: String,                  // "draft" | "published" | "cancelled" | "postponed"
  moderationStatus: String         // "pending" | "approved" | "rejected"
}
```

**Wichtig:**
- Alle neuen Felder sind **optional** (nicht required)
- Bestehende Events funktionieren weiterhin ohne neue Felder
- Index auf `slug` und `citySlug` für Performance

---

### 2. Slug-Generierung implementieren

**Service erstellen:** `services/slug.service.js`

```javascript
/**
 * Generiert einen URL-freundlichen Slug für Events
 * Format: {title-slug}-{city-slug}-{year}
 * Beispiel: "techno-party-berlin-2024"
 */
function generateEventSlug(title, city, date) {
  // Titel zu Slug konvertieren
  const titleSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Umlaute entfernen
    .replace(/[^a-z0-9]+/g, '-')     // Sonderzeichen zu Bindestrich
    .replace(/(^-|-$)/g, '');         // Führende/abschließende Bindestriche entfernen

  // Stadt zu Slug konvertieren
  const citySlug = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Jahr extrahieren
  const year = new Date(date).getFullYear();

  return `${titleSlug}-${citySlug}-${year}`;
}

/**
 * Prüft ob Slug bereits existiert und fügt Nummer hinzu falls nötig
 */
async function ensureUniqueSlug(baseSlug, EventModel, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await EventModel.findOne({ 
      slug,
      ...(excludeId && { _id: { $ne: excludeId } })
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

module.exports = {
  generateEventSlug,
  ensureUniqueSlug
};
```

**Integration beim Event-Erstellen:**

```javascript
// POST /api/events
app.post('/api/events', async (req, res) => {
  const eventData = req.body;
  
  // Slug generieren, falls nicht vorhanden
  if (!eventData.slug && eventData.title && eventData.city && eventData.startDate) {
    const baseSlug = generateEventSlug(
      eventData.title,
      eventData.city,
      eventData.startDate
    );
    eventData.slug = await ensureUniqueSlug(baseSlug, Event, null);
  }

  // citySlug generieren
  if (!eventData.citySlug && eventData.city) {
    eventData.citySlug = eventData.city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // categorySlug generieren
  if (!eventData.categorySlug && eventData.category) {
    eventData.categorySlug = eventData.category
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const event = await Event.create(eventData);
  res.json(event);
});
```

---

### 3. API-Endpoints erweitern

**GET /api/events/:id - Unterstützt beide URL-Formate:**

```javascript
// Unterstützt:
// - /api/events/abc123 (alte URL)
// - /api/events/techno-party-berlin-2024-abc123 (neue Slug-URL)

app.get('/api/events/:identifier', async (req, res) => {
  const { identifier } = req.params;
  
  let event;
  
  // Prüfe ob es eine Slug-URL ist (enthält Bindestriche und endet mit ID)
  const slugMatch = identifier.match(/^(.+)-([a-f0-9]{24})$/);
  
  if (slugMatch) {
    // Slug-Format: slug-id
    const [, slug, id] = slugMatch;
    event = await Event.findOne({ 
      $or: [
        { slug, _id: id },
        { slug, id: id }
      ]
    });
  } else {
    // Altes Format: nur ID
    event = await Event.findOne({ 
      $or: [
        { _id: identifier },
        { id: identifier }
      ]
    });
  }

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});
```

**GET /api/events - Filter unterstützen:**

```javascript
app.get('/api/events', async (req, res) => {
  const {
    city,
    citySlug,        // NEU: Filter nach citySlug
    category,
    categorySlug,    // NEU: Filter nach categorySlug
    eventType,       // NEU: Filter nach eventType
    genre,           // NEU: Filter nach Genre
    date,
    status = 'published' // NEU: Standard-Filter
  } = req.query;

  const query = { status };

  // Stadt-Filter
  if (citySlug) {
    query.citySlug = citySlug;
  } else if (city) {
    query.city = city;
  }

  // Kategorie-Filter
  if (categorySlug) {
    query.categorySlug = categorySlug;
  } else if (category) {
    query.category = category;
  }

  // Event-Typ-Filter
  if (eventType) {
    query.eventType = eventType;
  }

  // Genre-Filter
  if (genre) {
    query.genre = { $in: [genre] };
  }

  // Datum-Filter
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.startDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const events = await Event.find(query)
    .sort({ startDate: 1 })
    .limit(100);

  res.json(events);
});
```

---

### 4. KI-Anreicherung (Optional)

**Service erstellen:** `services/ai-enrichment.service.js`

**Option A: Mit OpenAI (empfohlen):**

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function enrichEvent(event) {
  const prompt = `Analysiere dieses Event und klassifiziere es:

Titel: ${event.title}
Beschreibung: ${event.description || 'Keine Beschreibung'}
Stadt: ${event.city}
Kategorie: ${event.category || 'Nicht angegeben'}

Antworte NUR im JSON-Format (kein zusätzlicher Text):
{
  "eventType": "concert|festival|club-night|theater|sports|workshop|networking|exhibition|conference|party|comedy|other",
  "genre": ["techno", "house"],
  "mood": ["energetic", "party"],
  "shortDescription": "Kurze SEO-optimierte Beschreibung (max 160 Zeichen)",
  "vibe": {
    "energy": 85,
    "intimacy": 40,
    "exclusivity": 30,
    "social": 90
  },
  "audience": {
    "ageRange": [18, 35],
    "targetAudience": ["students", "professionals"]
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const enriched = JSON.parse(response.choices[0].message.content);
    return enriched;
  } catch (error) {
    console.error('KI-Anreicherung fehlgeschlagen:', error);
    return {}; // Leeres Objekt zurückgeben, Event wird trotzdem gespeichert
  }
}

module.exports = { enrichEvent };
```

**Option B: Regel-basiert (einfacher, keine API-Kosten):**

```javascript
function enrichEventRuleBased(event) {
  const enriched = {};

  // Event-Typ aus Kategorie ableiten
  const categoryToType = {
    'konzert': 'concert',
    'festival': 'festival',
    'club': 'club-night',
    'theater': 'theater',
    'sport': 'sports',
    'workshop': 'workshop',
    'networking': 'networking',
    'ausstellung': 'exhibition',
    'konferenz': 'conference',
    'party': 'party',
    'comedy': 'comedy'
  };

  if (event.category) {
    enriched.eventType = categoryToType[event.category.toLowerCase()] || 'other';
  }

  // Genre aus Beschreibung/Titel extrahieren
  const text = `${event.title} ${event.description || ''}`.toLowerCase();
  const genres = [];
  
  if (text.includes('techno')) genres.push('techno');
  if (text.includes('house')) genres.push('house');
  if (text.includes('hip-hop') || text.includes('hiphop')) genres.push('hip-hop');
  if (text.includes('rock')) genres.push('rock');
  if (text.includes('pop')) genres.push('pop');
  if (text.includes('jazz')) genres.push('jazz');
  if (text.includes('electronic')) genres.push('electronic');
  
  if (genres.length > 0) {
    enriched.genre = genres;
  }

  // Short Description generieren
  if (event.description) {
    enriched.shortDescription = event.description
      .substring(0, 157)
      .trim()
      .replace(/\s+$/, '') + '...';
  }

  return enriched;
}

module.exports = { enrichEvent: enrichEventRuleBased };
```

**Integration beim Event-Erstellen:**

```javascript
const { enrichEvent } = require('./services/ai-enrichment.service');

app.post('/api/events', async (req, res) => {
  const eventData = req.body;
  
  // Slug generieren
  // ... (siehe oben)

  // KI-Anreicherung (optional, kann auch async im Hintergrund laufen)
  try {
    const enriched = await enrichEvent(eventData);
    Object.assign(eventData, enriched);
  } catch (error) {
    console.error('KI-Anreicherung fehlgeschlagen:', error);
    // Event wird trotzdem gespeichert
  }

  const event = await Event.create(eventData);
  res.json(event);
});
```

---

### 5. Sitemap-Generierung

**Endpoints erstellen:**

```javascript
const { generateSitemap, generateSitemapIndex, generateEventUrls, generateCityUrls } = require('../utils/sitemap');

// Sitemap-Index
app.get('/sitemap.xml', async (req, res) => {
  const sitemaps = [
    {
      loc: `${req.protocol}://${req.get('host')}/sitemap-events.xml`,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: `${req.protocol}://${req.get('host')}/sitemap-cities.xml`,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: `${req.protocol}://${req.get('host')}/sitemap-venues.xml`,
      lastmod: new Date().toISOString().split('T')[0]
    }
  ];

  const sitemapIndexXml = generateSitemapIndex(sitemaps);
  res.set('Content-Type', 'application/xml');
  res.send(sitemapIndexXml);
});

// Event-Sitemap
app.get('/sitemap-events.xml', async (req, res) => {
  const now = new Date();
  
  // Nur kommende Events (oder Events der letzten 7 Tage)
  const events = await Event.find({
    status: 'published',
    startDate: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
  })
    .select('id _id slug startDate updatedAt')
    .limit(50000)
    .lean();

  const urls = generateEventUrls(events);
  const sitemapXml = generateSitemap(urls);
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

// Stadt-Sitemap
app.get('/sitemap-cities.xml', async (req, res) => {
  const cities = await Event.distinct('citySlug', {
    citySlug: { $exists: true, $ne: null }
  });

  const urls = generateCityUrls(cities);
  const sitemapXml = generateSitemap(urls);
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemapXml);
});
```

**Sitemap-Utils:** `utils/sitemap.js`

```javascript
function generateSitemap(urls) {
  const urlElements = urls
    .map(url => {
      const lastmod = url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : '';
      const changefreq = url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>\n` : '';
      const priority = url.priority !== undefined ? `    <priority>${url.priority}</priority>\n` : '';

      return `  <url>\n    <loc>${url.loc}</loc>\n${lastmod}${changefreq}${priority}  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function generateSitemapIndex(sitemaps) {
  const sitemapElements = sitemaps
    .map(sitemap => {
      const lastmod = sitemap.lastmod ? `    <lastmod>${sitemap.lastmod}</lastmod>\n` : '';
      return `  <sitemap>\n    <loc>${sitemap.loc}</loc>\n${lastmod}  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

function generateEventUrls(events) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return events.map(event => {
    const eventDate = event.startDate ? new Date(event.startDate) : null;

    let priority = 0.5;
    let changefreq = 'monthly';

    if (eventDate) {
      if (eventDate > now) {
        priority = 1.0;
        changefreq = 'daily';
      } else if (eventDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        priority = 0.8;
        changefreq = 'weekly';
      } else if (eventDate > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)) {
        priority = 0.5;
        changefreq = 'monthly';
      } else {
        priority = 0.3;
        changefreq = 'never';
      }
    }

    const lastmod = event.updatedAt
      ? new Date(event.updatedAt).toISOString().split('T')[0]
      : today;

    const slug = event.slug || event._id || event.id;
    const id = event._id || event.id;

    return {
      loc: `https://event-scanner.com/event/${slug ? `${slug}-${id}` : id}`,
      lastmod,
      changefreq,
      priority
    };
  });
}

function generateCityUrls(cities) {
  const today = new Date().toISOString().split('T')[0];

  return cities.map(city => ({
    loc: `https://event-scanner.com/events/${city}`,
    lastmod: today,
    changefreq: 'daily',
    priority: 0.8
  }));
}

module.exports = {
  generateSitemap,
  generateSitemapIndex,
  generateEventUrls,
  generateCityUrls
};
```

---

### 6. Migration für bestehende Events (Optional)

**Batch-Job zum Generieren von Slugs für bestehende Events:**

```javascript
// scripts/migrate-slugs.js
const mongoose = require('mongoose');
const { generateEventSlug, ensureUniqueSlug } = require('../services/slug.service');
const Event = require('../models/Event');

async function migrateSlugs() {
  await mongoose.connect(process.env.MONGODB_URI);

  const events = await Event.find({ 
    slug: { $exists: false },
    title: { $exists: true },
    city: { $exists: true },
    startDate: { $exists: true }
  });

  console.log(`Gefunden: ${events.length} Events ohne Slug`);

  for (const event of events) {
    try {
      const baseSlug = generateEventSlug(
        event.title,
        event.city,
        event.startDate
      );
      
      const slug = await ensureUniqueSlug(baseSlug, Event, event._id);
      
      // citySlug generieren
      const citySlug = event.city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await Event.updateOne(
        { _id: event._id },
        { 
          $set: { 
            slug,
            citySlug: citySlug || event.citySlug
          } 
        }
      );

      console.log(`✓ Slug generiert für: ${event.title} -> ${slug}`);
    } catch (error) {
      console.error(`✗ Fehler bei Event ${event._id}:`, error);
    }
  }

  await mongoose.disconnect();
  console.log('Migration abgeschlossen!');
}

migrateSlugs();
```

**Ausführen:**
```bash
node scripts/migrate-slugs.js
```

---

### 7. Indexes für Performance

**MongoDB Indexes hinzufügen:**

```javascript
// In Event-Model oder Migration
Event.createIndex({ slug: 1 });
Event.createIndex({ citySlug: 1 });
Event.createIndex({ categorySlug: 1 });
Event.createIndex({ eventType: 1 });
Event.createIndex({ genre: 1 });
Event.createIndex({ status: 1, startDate: 1 }); // Für Sitemap-Query
Event.createIndex({ clusterId: 1 });
Event.createIndex({ eventSeriesId: 1 });
```

---

## ✅ Checkliste

- [ ] Event-Model erweitert (alle neuen Felder optional)
- [ ] Slug-Generierung implementiert
- [ ] Eindeutigkeit von Slugs sichergestellt
- [ ] API-Endpoints erweitert (GET/POST Events)
- [ ] URL-Format unterstützt (sowohl `/event/:id` als auch `/event/:slug-:id`)
- [ ] KI-Anreicherung implementiert (optional)
- [ ] Sitemap-Endpoints erstellt
- [ ] Indexes für Performance hinzugefügt
- [ ] Migration für bestehende Events (optional)
- [ ] Tests geschrieben

---

## 🧪 Testing

**Test-Endpoints:**

```bash
# Event mit Slug erstellen
POST /api/events
{
  "title": "Techno Party Berlin",
  "city": "Berlin",
  "startDate": "2024-12-31",
  "description": "Die beste Party des Jahres"
}
# Erwartet: slug wird automatisch generiert

# Event per Slug abrufen
GET /api/events/techno-party-berlin-2024-abc123
# Erwartet: Event wird gefunden

# Event per ID abrufen (abwärtskompatibel)
GET /api/events/abc123
# Erwartet: Event wird gefunden

# Sitemap abrufen
GET /sitemap.xml
# Erwartet: Sitemap-Index XML

GET /sitemap-events.xml
# Erwartet: Event-Sitemap XML
```

---

## 📝 Wichtige Hinweise

1. **Abwärtskompatibilität:** Alle neuen Felder sind optional. Bestehende Events funktionieren weiterhin.

2. **Slug-Eindeutigkeit:** Slugs müssen eindeutig sein. Bei Duplikaten wird eine Nummer angehängt.

3. **Performance:** Indexes auf häufig gefilterte Felder (slug, citySlug, eventType, genre).

4. **KI-Anreicherung:** Falls KI-Service ausfällt, Event trotzdem speichern (graceful degradation).

5. **Sitemap-Caching:** Sitemaps können gecacht werden (z.B. Redis), da sie sich nicht häufig ändern.

---

**Bei Fragen:** Siehe `SEO_KI_STRATEGIE.md` und `IMPLEMENTIERUNG_SEO_KI.md` für detaillierte Erklärungen.
