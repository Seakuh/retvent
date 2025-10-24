import { FormEvent } from "react";
import { Community, Member } from "../../types/community.types";
import {
  canCreateEvent,
  canCreatePoll,
  canPostNews,
} from "../../utils/permissions";
import styles from "./CommunityHeader.module.css";

type ComposeAction = "news" | "poll" | "event";

interface CommunityHeaderProps {
  community: Community;
  currentUser?: Member | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: ComposeAction) => void;
}

export const CommunityHeader = ({
  community,
  currentUser,
  searchTerm,
  onSearchChange,
  onAction,
}: CommunityHeaderProps) => {
  const { stats } = community;
  const showComposeActions =
    canPostNews(currentUser) || canCreatePoll(currentUser) || canCreateEvent(currentUser);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.hero}>
        {community.logoUrl ? (
          <img
            src={community.logoUrl}
            alt={`${community.name} Logo`}
            className={styles.logo}
          />
        ) : null}
        <div className={styles.meta}>
          <p className={styles.badge}>Community</p>
          <h1 className={styles.title}>{community.name}</h1>
          <p className={styles.description}>{community.description}</p>
          <ul className={styles.stats}>
            <li>
              <span className={styles.statLabel}>Mitglieder</span>
              <span className={styles.statValue}>{stats.members}</span>
            </li>
            <li>
              <span className={styles.statLabel}>Events</span>
              <span className={styles.statValue}>{stats.upcomingEvents}</span>
            </li>
            <li>
              <span className={styles.statLabel}>Posts (30 Tage)</span>
              <span className={styles.statValue}>{stats.postsLast30Days}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.toolbar}>
        <form className={styles.searchForm} role="search" onSubmit={handleSubmit}>
          <label htmlFor="community-search" className={styles.searchLabel}>
            Suche Mitglieder oder Beiträge
          </label>
          <input
            id="community-search"
            name="community-search"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Suchen..."
            className={styles.searchInput}
          />
        </form>
        {showComposeActions ? (
          <div className={styles.actions}>
            {canPostNews(currentUser) ? (
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => onAction("news")}
              >
                Neuer Beitrag
              </button>
            ) : null}
            {canCreatePoll(currentUser) ? (
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => onAction("poll")}
              >
                Neue Abstimmung
              </button>
            ) : null}
            {canCreateEvent(currentUser) ? (
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => onAction("event")}
              >
                Neues Event
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};

