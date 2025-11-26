# Assessment System Migration

## Übersicht

Das Assessment-System wurde von einem **4-dimensionalen Vector-basierten System** zu einem **2-dimensionalen einfachen System** migriert.

## Änderungen

### Alte Version (4D + Vektoren)
- **4 Dimensionen**: `loose` (1-10), `tight` (1-10), `aggressive` (1-10), `passive` (1-10)
- **Speicherung**: Selbsteinschätzungen als Vector-Embeddings in Qdrant
- **Matching**: Vector-Similarity-Suche über ChatGPT Embeddings
- **Technologie**: Qdrant + ChatGPT + MongoDB

### Neue Version (2D + einfach)
- **2 Dimensionen**:
  - `passiveAggressive`: 0-10 (0 = passiv, 10 = aggressiv) → **X-Achse**
  - `tightLoose`: 0-10 (0 = tight, 10 = loose) → **Y-Achse**
- **Speicherung**: Alle Assessments direkt in MongoDB
- **Matching**: Euklidische Distanz-Berechnung
- **Technologie**: Nur MongoDB (kein Qdrant, kein ChatGPT)

## Matrix-Visualisierung

```
      Loose (10)
          ↑
          │
          │
Tight ────┼──── Y-Achse
(0)       │
          │
          └────────→ X-Achse
        Passiv (0)  Aggressiv (10)
```

- **Grüner Punkt**: Eigene Position
- **Rote Punkte**: Andere Spieler

## API-Endpoints (unverändert)

### Selbsteinschätzung erstellen/updaten
```http
POST /assessment/self
Authorization: Bearer <token>

{
  "passiveAggressive": 7,  // 0-10
  "tightLoose": 6,         // 0-10
  "playStyle": "Loose-Aggressive (LAG)",
  "submittedAt": "2024-01-15T10:00:00Z"
}
```

### Peer-Bewertung erstellen
```http
POST /assessment/peer
Authorization: Bearer <token>

{
  "assessedUserId": "user123",
  "groupId": "group456",
  "passiveAggressive": 8,
  "tightLoose": 5,
  "playStyle": "Tight-Aggressive (TAG)",
  "submittedAt": "2024-01-15T10:00:00Z"
}
```

### Assessment-Matrix abrufen
```http
GET /assessment/matrix
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "user123",
  "selfAssessment": {
    "passiveAggressive": 7,
    "tightLoose": 6,
    "playStyle": "Loose-Aggressive (LAG)"
  },
  "peerAssessments": [
    {
      "assessorId": "user456",
      "passiveAggressive": 8,
      "tightLoose": 5,
      "playStyle": "Tight-Aggressive (TAG)",
      "submittedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "averagePeerAssessment": {
    "passiveAggressive": 7.5,
    "tightLoose": 5.5,
    "playStyle": "Loose-Aggressive (LAG)"
  }
}
```

### Matches finden
```http
GET /assessment/find-matches?limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "hasAssessment": true,
  "myAssessment": {
    "passiveAggressive": 7,
    "tightLoose": 6,
    "playStyle": "Loose-Aggressive (LAG)"
  },
  "myMatrix": {
    "selfAssessment": { ... },
    "averagePeerAssessment": { ... },
    "peerAssessments": [ ... ],
    "coordinates": {
      "x": 7,  // passiveAggressive
      "y": 6   // tightLoose
    }
  },
  "matches": [
    {
      "userId": "user789",
      "matchScore": 95,
      "similarity": 0.95,
      "assessment": {
        "passiveAggressive": 7.5,
        "tightLoose": 6.5,
        "playStyle": "Loose-Aggressive (LAG)"
      },
      "coordinates": {
        "x": 7.5,
        "y": 6.5
      },
      "profile": {
        "id": "profile123",
        "username": "player789",
        "profileImageUrl": "https://..."
      }
    }
  ],
  "totalMatches": 10
}
```

## Matching-Algorithmus

**Euklidische Distanz:**
```typescript
distance = √((x₁ - x₂)² + (y₁ - y₂)²)
```

**Similarity Score (0-100):**
```typescript
maxDistance = √(10² + 10²) ≈ 14.14
similarity = (1 - distance / maxDistance) × 100
```

Je höher der Score, desto ähnlicher sind die Spieler.

## Datenbank-Schemas

### SelfAssessment Collection
```typescript
{
  userId: string;            // unique
  passiveAggressive: number; // 0-10
  tightLoose: number;        // 0-10
  playStyle: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### PeerAssessment Collection
```typescript
{
  assessorUserId: string;
  assessedUserId: string;
  groupId: string;
  passiveAggressive: number; // 0-10
  tightLoose: number;        // 0-10
  playStyle: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Index: { assessorUserId: 1, assessedUserId: 1 } unique
// Index: { assessedUserId: 1 }
// Index: { groupId: 1 }
```

## Migration bestehender Daten

Falls alte Daten existieren, führe aus:

```bash
cd /home/dizzle/dev/EVENTS/backend/retvent/backend
npx ts-node src/scripts/migrate-assessments.ts
```

Die Migration:
1. Konvertiert alte 4D-Werte zu 2D-Werten
2. Updated PeerAssessments in MongoDB
3. **Wichtig**: Qdrant-Daten (SelfAssessments) müssen manuell nach MongoDB migriert werden

## Nächste Schritte für Frontend

Das Frontend muss angepasst werden für:

1. **Assessment-Formular**: Nur noch 2 Slider statt 4
2. **Matrix-Darstellung**:
   - X-Achse: 0 (passiv) → 10 (aggressiv)
   - Y-Achse: 0 (tight) → 10 (loose)
   - Eigener Punkt: grün
   - Andere Spieler: rot

## Vorteile der neuen Lösung

✅ **Einfacher**: Nur 2 Dimensionen statt 4
✅ **Schneller**: Keine Vector-Berechnungen
✅ **Günstiger**: Kein ChatGPT/Qdrant benötigt
✅ **Klarer**: Direkte 2D-Koordinaten
✅ **Wartbarer**: Alles in MongoDB
