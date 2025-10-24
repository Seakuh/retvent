import { Member, Event, RSVPStatus } from "../../types/community.types";
import styles from "./EventCard.module.css";

interface EventCardProps {
  event: Event;
  host?: Member;
  members: Record<string, Member>;
  currentUser?: Member | null;
  canRespond: boolean;
  isSubmitting: boolean;
  onRSVP: (status: RSVPStatus) => Promise<void> | void;
}

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const statusLabel: Record<RSVPStatus, string> = {
  [RSVPStatus.GOING]: "Dabei",
  [RSVPStatus.MAYBE]: "Vielleicht",
  [RSVPStatus.NOT_GOING]: "Absagen",
};

export const EventCard = ({
  event,
  host,
  members,
  currentUser,
  canRespond,
  isSubmitting,
  onRSVP,
}: EventCardProps) => {
  const going = event.attendees.filter((attendee) => attendee.status === RSVPStatus.GOING);
  const maybe = event.attendees.filter((attendee) => attendee.status === RSVPStatus.MAYBE);
  const userStatus =
    currentUser &&
    event.attendees.find((attendee) => attendee.userId === currentUser.id)?.status;

  const capacityInfo =
    event.capacity && going.length
      ? `${going.length}/${event.capacity} Plätze bestätigt`
      : event.capacity
      ? `${event.capacity} Plätze`
      : `${going.length} Zusagen`;

  const displayAttendees = going.slice(0, 4).map((attendee) => members[attendee.userId]);
  const remaining = going.length - displayAttendees.length;

  const renderButton = (status: RSVPStatus, variant: "primary" | "secondary") => (
    <button
      type="button"
      className={
        userStatus === status
          ? styles.buttonActive
          : variant === "primary"
          ? styles.buttonPrimary
          : styles.buttonSecondary
      }
      onClick={() => onRSVP(status)}
      disabled={!canRespond || isSubmitting}
      aria-pressed={userStatus === status}
    >
      {isSubmitting && userStatus === status ? "Speichern…" : statusLabel[status]}
    </button>
  );

  return (
    <article className={styles.card}>
      {event.imageUrl ? (
        <figure className={styles.media}>
          <img src={event.imageUrl} alt="" />
        </figure>
      ) : null}
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.type}>{event.type}</span>
          <h4 className={styles.title}>{event.title}</h4>
          <p className={styles.time}>
            {formatDateTime(event.startAt)} – {formatDateTime(event.endAt)}
          </p>
          <p className={styles.location}>{event.location}</p>
        </div>
        <p className={styles.description}>{event.description}</p>
        <div className={styles.metaRow}>
          {host ? (
            <div className={styles.host}>
              {host.avatarUrl ? (
                <img src={host.avatarUrl} alt={`${host.name} Avatar`} />
              ) : (
                <span>{host.name.slice(0, 1)}</span>
              )}
              <span>
                Gastgeber: <strong>{host.name}</strong>
              </span>
            </div>
          ) : null}
          <span className={styles.capacity}>{capacityInfo}</span>
        </div>
        <div className={styles.attendees}>
          <div className={styles.avatars} aria-label={`${going.length} Zusagen`}>
            {displayAttendees.map(
              (member) =>
                member && (
                  <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} />
                )
            )}
            {remaining > 0 ? <span className={styles.more}>+{remaining}</span> : null}
          </div>
          {maybe.length > 0 ? (
            <span className={styles.maybe}>{maybe.length} auf Vielleicht</span>
          ) : null}
        </div>
        <div className={styles.actions}>
          {renderButton(RSVPStatus.GOING, "primary")}
          {renderButton(RSVPStatus.MAYBE, "secondary")}
          {renderButton(RSVPStatus.NOT_GOING, "secondary")}
        </div>
      </div>
    </article>
  );
};

