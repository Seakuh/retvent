import { useEffect, useRef } from "react";
import { vectorProfileService, VectorProfileResult } from "../services/api";

/**
 * Custom Hook für das Hintergrund-Loading von Vector Profile Results.
 * 
 * Lädt die personalisierten Event-Empfehlungen im Hintergrund, wenn:
 * - onboarding_completed im localStorage auf "true" gesetzt ist
 * - Der User authentifiziert ist (access_token vorhanden)
 * 
 * Verwendet moderne React-Architektur mit:
 * - AbortController für Cleanup bei Unmount
 * - Error Handling ohne UI-Interruption
 * - Logging für Debugging
 * 
 * @param enabled - Ob der Hook aktiv sein soll (Standard: true)
 * @param offset - Anzahl der Events, die übersprungen werden sollen (Standard: 0)
 * @param limit - Anzahl der Events pro Seite (Standard: 20)
 */
export const useVectorProfileResults = (
  enabled: boolean = true,
  offset: number = 0,
  limit: number = 20
) => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prüfe ob Hook aktiviert ist
    if (!enabled) {
      return;
    }

    // Prüfe ob onboarding_completed true ist
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (onboardingCompleted !== "true") {
      console.log(
        "🚫 Vector Profile Results: Onboarding nicht abgeschlossen, überspringe Loading"
      );
      return;
    }

    // Prüfe ob User authentifiziert ist
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.log(
        "🚫 Vector Profile Results: User nicht authentifiziert, überspringe Loading"
      );
      return;
    }

    // Verhindere mehrfaches Laden
    if (hasLoadedRef.current) {
      return;
    }

    // Erstelle AbortController für Cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Lade Daten im Hintergrund
    const loadVectorProfileResults = async () => {
      try {
        console.log(
          "🔄 Vector Profile Results: Starte Hintergrund-Loading...",
          { offset, limit }
        );

        const results = await vectorProfileService.getVectorProfileResults(
          offset,
          limit
        );

        // Prüfe ob Request abgebrochen wurde
        if (signal.aborted) {
          console.log("🚫 Vector Profile Results: Request wurde abgebrochen");
          return;
        }

        // Logge Ergebnisse
        console.log("✅ Vector Profile Results: Erfolgreich geladen", {
          count: results.length,
          results: results.map((result) => ({
            eventId: result.event.id,
            eventTitle: result.event.title,
            similarityScore: result.similarityScore,
          })),
        });

        hasLoadedRef.current = true;
      } catch (error) {
        // Prüfe ob Request abgebrochen wurde
        if (signal.aborted) {
          console.log("🚫 Vector Profile Results: Request wurde abgebrochen");
          return;
        }

        // Logge Fehler ohne UI-Interruption
        console.error("❌ Vector Profile Results: Fehler beim Laden", error);
      }
    };

    // Starte Loading
    void loadVectorProfileResults();

    // Cleanup-Funktion
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [enabled, offset, limit]);

  // Reset-Funktion für erneutes Laden (falls benötigt)
  const reset = () => {
    hasLoadedRef.current = false;
  };

  return { reset };
};

