# Community Module

Diese Komponenten implementieren die neue Community Experience inklusive Header, Admin Composer, Feed, Events, Partner und Mitgliederbereiche. Die UI ist mobil-first gestaltet und nutzt CSS-Module für ein konsistentes Styling.

**Kerndateien**
- `../pages/CommunityPage.tsx` – orchestriert Datenfluss und verbindet Service-API mit UI.
- `../components/*` – modulare Komponenten für Header, Feed, Events, Partner, Mitglieder und Kommentare.
- `../services/community.service.ts` – Mock-Service mit Promise-basierten Datenoperationen und Optimistic Updates.
- `../utils/permissions.ts` – Berechtigungshelfer für Rollenlogik.

**Hinweise**
- Alle Create-/Update-Aktionen laufen optimistisch und werden bei Fehlern mit Toasts rückgängig gemacht.
- Suchfeld filtert Feed-Items und Mitglieder simultan.
- Kommentare unterstützen Antworten (eine Ebene) sowie Soft-Delete per Admin/Autor.
- Mock-Daten enthalten Beispiel-Mitglieder (Admin: `68ef99730e5996fb697c1bb2`), Events, News, Polls und Kommentare.

Die Komponenten sind eigenständig und können in eine bestehende Router-Struktur eingebunden werden. Die optionalen Service-Funktionen `followUser`, `unfollowUser` und `getProfile` greifen auf das externe API-Backend zu (siehe `community.service.ts`).

