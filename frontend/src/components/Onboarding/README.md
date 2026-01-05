# Onboarding System

Elegantes, minimalistisches Onboarding für neue User, das nur beim ersten Mal gezeigt wird.

## Features

- **Automatisches First-Time Detection**: Zeigt sich nur beim ersten Besuch für eingeloggte User
- **LocalStorage Persistence**: Merkt sich, ob Onboarding abgeschlossen wurde
- **Backend Integration**: Sendet Präferenzen an `/events/onboarding` Endpoint
- **Skip Option**: User können Onboarding überspringen
- **Debug Tools**: Browser-Console-Helpers für Testing

## Struktur

```
src/components/Onboarding/
├── Onboarding.tsx          # Main onboarding component
├── OnboardingWrapper.tsx   # Wrapper that checks if onboarding is needed
├── Onboarding.css          # Minimal, elegant styles
├── index.ts                # Exports
└── README.md               # This file

src/services/
└── onboarding.service.ts   # API calls & localStorage logic

src/utils/
└── onboarding-helpers.ts   # Debug helpers for browser console
```

## Wie es funktioniert

1. **User loggt sich ein** oder registriert sich
2. **OnboardingWrapper prüft** ob `localStorage.getItem('onboarding_completed')` gesetzt ist
3. **Wenn NICHT gesetzt**: Onboarding wird angezeigt
4. **User füllt aus oder skippt**:
   - Präferenzen werden an Backend gesendet (`POST /events/onboarding`)
   - LocalStorage wird gesetzt
   - User wird zur App weitergeleitet
5. **Nächster Besuch**: Onboarding wird übersprungen

## Backend Integration

Das Frontend sendet diese Datenstruktur:

```typescript
{
  eventType: {
    selected: ["Electronic", "Live music"]
  },
  genreStyle: {
    selected: ["Techno", "House", "Ambient"]
  },
  context: {
    selected: ["Energetic", "Late-night"]
  }
}
```

Entspricht dem Backend DTO:
```typescript
OnboardingPreferencesDto {
  eventType?: { [key: string]: string[] }
  genreStyle?: { [key: string]: string[] }
  context?: { [key: string]: string[] }
  communityOffers?: { [key: string]: string[] }
  region?: string
}
```

## Testing & Debugging

### Browser Console Commands

Nach dem Laden der App stehen diese Funktionen zur Verfügung:

```javascript
// Status checken
checkOnboarding()
// Output:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 ONBOARDING STATUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 Completed: ✅ Yes
// 🔐 Logged in: ✅ Yes
// 👁️  Should show: ❌ No
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Onboarding resetten (für Testing)
resetOnboarding()
// Dann Seite neu laden

// Reset + Auto-Reload
forceOnboarding()

// Onboarding als completed markieren
completeOnboarding()
```

### Manuell testen

1. **Onboarding anzeigen**:
   ```javascript
   localStorage.removeItem('onboarding_completed')
   // Dann Seite neu laden
   ```

2. **Onboarding überspringen**:
   ```javascript
   localStorage.setItem('onboarding_completed', 'true')
   // Dann Seite neu laden
   ```

## Wo es erscheint

Das Onboarding wird aktuell nur auf der **Landing Page** (`/`) angezeigt.

In `App.tsx`:
```tsx
<Route
  path="/"
  element={
    <OnboardingWrapper>
      <LandingPage />
    </OnboardingWrapper>
  }
/>
```

## Weitere Pages wrappen

Um Onboarding auch auf anderen Pages zu zeigen:

```tsx
import { OnboardingWrapper } from "./components/Onboarding";

<Route
  path="/events"
  element={
    <OnboardingWrapper>
      <EventsPage />
    </OnboardingWrapper>
  }
/>
```

## Design

- **Light Theme**: Off-white Gradient, subtile Greys
- **Dark Theme**: Automatisch via `prefers-color-scheme`
- **Bubbles**: Rounded pills mit sanften Hover-States
- **Typografie**: System-Fonts, generous spacing
- **Mobile**: Fully responsive

## Demo Route

Besuche `/onboarding-demo` um das Onboarding zu sehen (muss in App.tsx aktiviert werden):

```tsx
import OnboardingDemo from "./pages/OnboardingDemo";

<Route path="/onboarding-demo" element={<OnboardingDemo />} />
```

## LocalStorage Keys

- `onboarding_completed`: `"true"` wenn abgeschlossen
- `access_token`: Prüft ob User eingeloggt ist

## Logs

Alle wichtigen Schritte werden geloggt:

```
🔍 Checking onboarding status:
  - Is logged in: true
  - Onboarding completed: false
👉 Showing onboarding

🎯 Sending onboarding preferences: {...}
✅ Received personalized events: {...}
✅ Onboarding marked as completed in localStorage
✅ Onboarding completed, proceeding to app
```

## Customization

### Andere Fragen hinzufügen

In `Onboarding.tsx`:

```tsx
const newOptions = ["Option 1", "Option 2"];

// Neuen State
const [newPreference, setNewPreference] = useState<string[]>([]);

// Neue Section im JSX
<section className="onboarding-section">
  <h2>New Question?</h2>
  <div className="bubble-grid">
    {newOptions.map((option) => (
      <button
        className={`bubble ${newPreference.includes(option) ? 'selected' : ''}`}
        onClick={() => toggleSelection('newPreference', option)}
      >
        {option}
      </button>
    ))}
  </div>
</section>
```

### Backend Endpoint ändern

In `onboarding.service.ts`:

```typescript
const response = await fetch(
  `${API_URL}your/new/endpoint`,
  // ...
);
```

## Troubleshooting

**Onboarding zeigt sich nicht:**
```javascript
checkOnboarding()
```
Checke ob `Logged in: ✅` und `Completed: ❌`

**Onboarding zeigt sich immer wieder:**
```javascript
// Check if localStorage works
localStorage.setItem('test', 'value')
localStorage.getItem('test') // should return 'value'
```

**Backend Error:**
Checke Browser DevTools → Network → `events/onboarding` Request
