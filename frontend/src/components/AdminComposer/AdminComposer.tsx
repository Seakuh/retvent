import { FormEvent, useMemo, useState } from "react";
import {
  Event,
  EventInput,
  Member,
  NewsPostInput,
  PollInput,
} from "../../types/community.types";
import styles from "./AdminComposer.module.css";

type ComposerTab = "news" | "poll" | "event";

interface AdminComposerProps {
  communitySlug: string;
  currentUser: Member;
  events: Event[];
  initialTab?: ComposerTab;
  onCreateNews: (input: NewsPostInput) => Promise<void>;
  onCreatePoll: (input: PollInput) => Promise<void>;
  onCreateEvent: (input: EventInput) => Promise<void>;
  onClose?: () => void;
}

const defaultPollOptions = ["", ""];

export const AdminComposer = ({
  communitySlug,
  currentUser,
  events,
  initialTab = "news",
  onCreateNews,
  onCreatePoll,
  onCreateEvent,
  onClose,
}: AdminComposerProps) => {
  const [activeTab, setActiveTab] = useState<ComposerTab>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newsForm, setNewsForm] = useState({
    title: "",
    body: "",
    imageUrl: "",
    attachToEvent: "",
  });
  const [pollForm, setPollForm] = useState({
    question: "",
    options: defaultPollOptions,
    closesAt: "",
    visibility: "members" as PollInput["visibility"],
    attachToEvent: "",
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "vortrag" as EventInput["type"],
    location: "",
    startAt: "",
    endAt: "",
    capacity: "",
    imageUrl: "",
  });

  const resetForms = () => {
    setNewsForm({ title: "", body: "", imageUrl: "", attachToEvent: "" });
    setPollForm({
      question: "",
      options: defaultPollOptions,
      closesAt: "",
      visibility: "members",
      attachToEvent: "",
    });
    setEventForm({
      title: "",
      description: "",
      type: "vortrag",
      location: "",
      startAt: "",
      endAt: "",
      capacity: "",
      imageUrl: "",
    });
  };

  const isNewsValid = useMemo(
    () => newsForm.title.trim().length > 3 && newsForm.body.trim().length > 10,
    [newsForm.body, newsForm.title]
  );

  const cleanedPollOptions = useMemo(
    () => pollForm.options.map((option) => option.trim()).filter(Boolean),
    [pollForm.options]
  );

  const isPollValid = useMemo(
    () => pollForm.question.trim().length > 5 && cleanedPollOptions.length >= 2,
    [pollForm.question, cleanedPollOptions.length]
  );

  const isEventValid = useMemo(() => {
    if (
      !eventForm.title.trim() ||
      !eventForm.description.trim() ||
      !eventForm.location.trim() ||
      !eventForm.startAt ||
      !eventForm.endAt
    ) {
      return false;
    }
    return new Date(eventForm.endAt).getTime() > new Date(eventForm.startAt).getTime();
  }, [
    eventForm.title,
    eventForm.description,
    eventForm.location,
    eventForm.startAt,
    eventForm.endAt,
  ]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      if (activeTab === "news") {
        if (!isNewsValid) {
          throw new Error("Bitte gib Titel und Inhalt an (mind. 4 bzw. 10 Zeichen).");
        }
        const payload: NewsPostInput = {
          communitySlug,
          authorId: currentUser.id,
          title: newsForm.title,
          body: newsForm.body,
          imageUrl: newsForm.imageUrl || undefined,
        };
        await onCreateNews(payload);
        setStatusMessage("Beitrag wurde erstellt.");
      } else if (activeTab === "poll") {
        if (!isPollValid) {
          throw new Error("Bitte Frage und mindestens zwei Antwortoptionen angeben.");
        }
        const payload: PollInput = {
          communitySlug,
          authorId: currentUser.id,
          question: pollForm.question,
          options: cleanedPollOptions,
          closesAt: pollForm.closesAt || undefined,
          visibility: pollForm.visibility,
        };
        await onCreatePoll(payload);
        setStatusMessage("Abstimmung wurde erstellt.");
      } else if (activeTab === "event") {
        if (!isEventValid) {
          throw new Error("Bitte alle Pflichtfelder ausfüllen (Start- und Endzeit prüfen).");
        }
        const payload: EventInput = {
          communitySlug,
          authorId: currentUser.id,
          title: eventForm.title.trim(),
          description: eventForm.description.trim(),
          type: eventForm.type,
          location: eventForm.location.trim(),
          startAt: eventForm.startAt,
          endAt: eventForm.endAt,
          capacity: eventForm.capacity ? Number(eventForm.capacity) : undefined,
          imageUrl: eventForm.imageUrl || undefined,
        };
        await onCreateEvent(payload);
        setStatusMessage("Event wurde angelegt.");
      }
      resetForms();
      if (onClose) {
        onClose();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Aktion fehlgeschlagen. Bitte erneut versuchen.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAttachToEvent = () => {
    if (events.length === 0) {
      return null;
    }
    return (
      <div className={styles.field}>
        <label htmlFor={`${activeTab}-attach`} className={styles.label}>
          Optional: an Event anhängen
        </label>
        <select
          id={`${activeTab}-attach`}
          className={styles.select}
          value={activeTab === "news" ? newsForm.attachToEvent : pollForm.attachToEvent}
          onChange={(event) => {
            const { value } = event.target;
            if (activeTab === "news") {
              setNewsForm((prev) => ({ ...prev, attachToEvent: value }));
            } else {
              setPollForm((prev) => ({ ...prev, attachToEvent: value }));
            }
          }}
        >
          <option value="">Kein Event ausgewählt</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
        <p className={styles.helperText}>
          Hinweis: Event-Verknüpfungen werden aktuell nur angezeigt, nicht gespeichert.
        </p>
      </div>
    );
  };

  return (
    <section className={styles.wrapper} aria-label="Composer für neue Inhalte">
      <div className={styles.header}>
        <h2 className={styles.title}>Erstellen</h2>
        <div className={styles.tabs} role="tablist" aria-label="Composer Auswahl">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "news"}
            className={activeTab === "news" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("news")}
          >
            News
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "poll"}
            className={activeTab === "poll" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("poll")}
          >
            Abstimmung
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "event"}
            className={activeTab === "event" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("event")}
          >
            Event
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {activeTab === "news" ? (
          <>
            <div className={styles.field}>
              <label htmlFor="news-title" className={styles.label}>
                Titel
              </label>
              <input
                id="news-title"
                type="text"
                value={newsForm.title}
                onChange={(event) =>
                  setNewsForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className={styles.input}
                placeholder="Was gibt es Neues?"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="news-body" className={styles.label}>
                Inhalt
              </label>
              <textarea
                id="news-body"
                value={newsForm.body}
                onChange={(event) =>
                  setNewsForm((prev) => ({ ...prev, body: event.target.value }))
                }
                className={styles.textarea}
                rows={5}
                placeholder="Teile Updates, Links oder Ressourcen..."
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="news-image" className={styles.label}>
                Bild-URL (optional)
              </label>
              <input
                id="news-image"
                type="url"
                value={newsForm.imageUrl}
                onChange={(event) =>
                  setNewsForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                }
                className={styles.input}
                placeholder="https://"
                inputMode="url"
              />
              <p className={styles.helperText}>
                Bilder werden responsive angezeigt und sollten mindestens 1200px Breite haben.
              </p>
            </div>
            {renderAttachToEvent()}
          </>
        ) : null}

        {activeTab === "poll" ? (
          <>
            <div className={styles.field}>
              <label htmlFor="poll-question" className={styles.label}>
                Frage
              </label>
              <input
                id="poll-question"
                type="text"
                value={pollForm.question}
                onChange={(event) =>
                  setPollForm((prev) => ({ ...prev, question: event.target.value }))
                }
                className={styles.input}
                placeholder="Welche Frage möchtest du stellen?"
                required
              />
            </div>
            <div className={styles.fieldset}>
              <span className={styles.label}>Antwortoptionen</span>
              {pollForm.options.map((option, index) => (
                <div key={`option-${index}`} className={styles.optionRow}>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) =>
                      setPollForm((prev) => {
                        const next = [...prev.options];
                        next[index] = event.target.value;
                        return { ...prev, options: next };
                      })
                    }
                    className={styles.input}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {pollForm.options.length > 2 ? (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() =>
                        setPollForm((prev) => ({
                          ...prev,
                          options: prev.options.filter((_, i) => i !== index),
                        }))
                      }
                      aria-label={`Option ${index + 1} entfernen`}
                    >
                      Entfernen
                    </button>
                  ) : null}
                </div>
              ))}
              {pollForm.options.length < 6 ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() =>
                    setPollForm((prev) => ({
                      ...prev,
                      options: [...prev.options, ""],
                    }))
                  }
                >
                  Option hinzufügen
                </button>
              ) : null}
            </div>
            <div className={styles.groupRow}>
              <div className={styles.field}>
                <label htmlFor="poll-closesAt" className={styles.label}>
                  Laufzeit (optional)
                </label>
                <input
                  id="poll-closesAt"
                  type="datetime-local"
                  value={pollForm.closesAt}
                  onChange={(event) =>
                    setPollForm((prev) => ({ ...prev, closesAt: event.target.value }))
                  }
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="poll-visibility" className={styles.label}>
                  Sichtbarkeit
                </label>
                <select
                  id="poll-visibility"
                  value={pollForm.visibility}
                  onChange={(event) =>
                    setPollForm((prev) => ({
                      ...prev,
                      visibility: event.target.value as PollInput["visibility"],
                    }))
                  }
                  className={styles.select}
                >
                  <option value="members">Nur Mitglieder</option>
                  <option value="public">Öffentlich</option>
                </select>
              </div>
            </div>
            {renderAttachToEvent()}
          </>
        ) : null}

        {activeTab === "event" ? (
          <>
            <div className={styles.field}>
              <label htmlFor="event-title" className={styles.label}>
                Titel
              </label>
              <input
                id="event-title"
                type="text"
                value={eventForm.title}
                onChange={(event) =>
                  setEventForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className={styles.input}
                placeholder="Wie heißt das Event?"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="event-description" className={styles.label}>
                Beschreibung
              </label>
              <textarea
                id="event-description"
                value={eventForm.description}
                onChange={(event) =>
                  setEventForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className={styles.textarea}
                rows={5}
                placeholder="Beschreibe Inhalt, Zielgruppe und Mehrwert."
                required
              />
            </div>
            <div className={styles.groupRow}>
              <div className={styles.field}>
                <label htmlFor="event-type" className={styles.label}>
                  Typ
                </label>
                <select
                  id="event-type"
                  value={eventForm.type}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, type: event.target.value as EventInput["type"] }))
                  }
                  className={styles.select}
                >
                  <option value="vortrag">Vortrag</option>
                  <option value="workshop">Workshop</option>
                  <option value="community">Community</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="event-location" className={styles.label}>
                  Ort
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={eventForm.location}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  className={styles.input}
                  placeholder="z.B. RetVent HQ, Berlin oder Online"
                  required
                />
              </div>
            </div>
            <div className={styles.groupRow}>
              <div className={styles.field}>
                <label htmlFor="event-start" className={styles.label}>
                  Start
                </label>
                <input
                  id="event-start"
                  type="datetime-local"
                  value={eventForm.startAt}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, startAt: event.target.value }))
                  }
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="event-end" className={styles.label}>
                  Ende
                </label>
                <input
                  id="event-end"
                  type="datetime-local"
                  value={eventForm.endAt}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, endAt: event.target.value }))
                  }
                  className={styles.input}
                  required
                />
              </div>
            </div>
            <div className={styles.groupRow}>
              <div className={styles.field}>
                <label htmlFor="event-capacity" className={styles.label}>
                  Kapazität (optional)
                </label>
                <input
                  id="event-capacity"
                  type="number"
                  min={1}
                  value={eventForm.capacity}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, capacity: event.target.value }))
                  }
                  className={styles.input}
                  placeholder="z.B. 50"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="event-image" className={styles.label}>
                  Header-Bild (optional)
                </label>
                <input
                  id="event-image"
                  type="url"
                  value={eventForm.imageUrl}
                  onChange={(event) =>
                    setEventForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  className={styles.input}
                  placeholder="https://"
                />
              </div>
            </div>
          </>
        ) : null}

        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
        {statusMessage ? <p className={styles.success}>{statusMessage}</p> : null}

        <div className={styles.footer}>
          {onClose ? (
            <button type="button" className={styles.secondaryButton} onClick={onClose}>
              Abbrechen
            </button>
          ) : null}
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSubmitting || (!isNewsValid && activeTab === "news") || (!isPollValid && activeTab === "poll") || (!isEventValid && activeTab === "event")}
          >
            {isSubmitting ? "Speichern..." : "Veröffentlichen"}
          </button>
        </div>
      </form>
    </section>
  );
};

