# Performance-Optimierungen für Event-Filter

## Implementierte Optimierungen

### 1. Datenbank-Indizes
- **Zusammengesetzter Index**: `{ status: 1, scheduledReleaseDate: 1 }`
  - Ermöglicht effiziente Filterung von veröffentlichten Events
  - MongoDB kann beide Bedingungen in einem Index-Scan verarbeiten
  - Reduziert Full-Collection-Scans erheblich

### 2. Filter-Optimierung
- **Vereinfachte Filter-Struktur**: Minimiert verschachtelte `$or`/`$and` Operationen
- **Index-Nutzung**: Filter ist so strukturiert, dass MongoDB den Index optimal nutzen kann
- **Frühe Filterung**: Filter wird bereits auf Datenbank-Ebene angewendet, nicht im Application-Layer

### 3. Bestehende Indizes werden genutzt
- `{ status: 1, startDate: 1 }` - für Sitemap-Queries
- `{ 'location.coordinates': '2dsphere' }` - für Geo-Queries
- `{ citySlug: 1 }`, `{ categorySlug: 1 }` - für URL-basierte Suchen

## Performance-Analyse

### Vorher (ohne Optimierung)
- **Problem**: Kein Index auf `scheduledReleaseDate`
- **Auswirkung**: MongoDB muss jedes Dokument scannen und prüfen
- **Komplexität**: O(n) für n Events in der Collection

### Nachher (mit Optimierung)
- **Vorteil**: Index-basierte Suche
- **Auswirkung**: MongoDB nutzt Index-Scan statt Collection-Scan
- **Komplexität**: O(log n) für Index-Lookup + O(k) für k passende Dokumente

## Weitere Optimierungsmöglichkeiten

### 1. Partial Index (Optional)
Für noch bessere Performance könnte ein Partial Index erstellt werden:
```javascript
EventSchema.index(
  { status: 1, scheduledReleaseDate: 1 },
  { 
    partialFilterExpression: { 
      status: { $in: ['published', null] },
      scheduledReleaseDate: { $lte: new Date() }
    }
  }
);
```

### 2. Caching (Zukünftig)
Für häufig abgerufene Queries könnte ein Redis-Cache implementiert werden:
- Cache-Key: `published_events:{query_hash}`
- TTL: 5-10 Minuten
- Invalidierung bei Event-Updates

### 3. Query-Optimierung
- Verwendung von `.select()` um nur benötigte Felder zu laden
- Pagination mit `.limit()` und `.skip()` für große Result-Sets
- Aggregation-Pipeline für komplexe Queries

## Monitoring

Empfohlene Metriken zur Überwachung:
- Query-Execution-Time (sollte < 100ms sein)
- Index-Usage-Rate (sollte > 90% sein)
- Collection-Scan-Rate (sollte < 10% sein)

## Migration

Der neue Index wird automatisch erstellt beim nächsten Start der Anwendung.
Für bestehende Collections kann der Index manuell erstellt werden:

```javascript
db.events.createIndex({ status: 1, scheduledReleaseDate: 1 });
```
