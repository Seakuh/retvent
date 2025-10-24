import { Member, Event, RSVPStatus } from "../../types/community.types";
import { canRSVP } from "../../utils/permissions";
import { EventCard } from "./EventCard";
import styles from "./EventList.module.css";

interface EventListProps {
  events: Event[];
  members: Record<string, Member>;
  currentUser?: Member | null;
  isLoading?: boolean;
  pendingRSVP?: Record<string, boolean>;
  onRSVP: (eventId: string, status: RSVPStatus) => Promise<void>;
}

export const EventList = ({
  events,
  members,
  currentUser,
  isLoading,
  pendingRSVP = {},
  onRSVP,
}: EventListProps) => {
  if (isLoading) {
    return (
      <section className={styles.wrapper} aria-busy="true">
        <h3 className={styles.title}>Bevorstehende Events</h3>
        <p className={styles.placeholder}>Events werden geladen …</p>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className={styles.wrapper}>
        <h3 className={styles.title}>Bevorstehende Events</h3>
        <p className={styles.placeholder}>Es stehen momentan keine Events an.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.title}>Bevorstehende Events</h3>
      <ul className={styles.list}>
        {events.map((event) => (
          <li key={event.id}>
            <EventCard
              event={event}
              host={members[event.hostId]}
              members={members}
              currentUser={currentUser}
              canRespond={canRSVP(currentUser)}
              isSubmitting={pendingRSVP[event.id] ?? false}
              onRSVP={(status) => onRSVP(event.id, status)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

