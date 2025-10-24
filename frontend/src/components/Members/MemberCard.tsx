import { Member } from "../../types/community.types";
import { canConnect } from "../../utils/permissions";
import styles from "./MemberCard.module.css";

interface MemberCardProps {
  member: Member;
  currentUser?: Member | null;
  status: "idle" | "pending" | "requested";
  onConnect: () => Promise<void> | void;
}

const roleLabel: Record<Member["role"], string> = {
  ADMIN: "Admin",
  HOST: "Host",
  MEMBER: "Mitglied",
  GUEST: "Gast",
};

export const MemberCard = ({ member, currentUser, status, onConnect }: MemberCardProps) => {
  const canConnectUser = canConnect(currentUser) && currentUser?.id !== member.id;

  return (
    <article className={styles.card}>
      <a href={`/profile/${member.id}`} className={styles.profileLink}>
        <div className={styles.avatar}>
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={`${member.name} Avatar`} />
          ) : (
            <span>{member.name.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className={styles.meta}>
          <h4 className={styles.name}>{member.name}</h4>
          <span className={styles.role}>{roleLabel[member.role]}</span>
          {member.title ? <p className={styles.title}>{member.title}</p> : null}
        </div>
      </a>
      {canConnectUser ? (
        <button
          type="button"
          className={styles.connectButton}
          onClick={onConnect}
          disabled={status !== "idle"}
        >
          {status === "pending" ? "Senden…" : status === "requested" ? "Angefragt" : "Connect"}
        </button>
      ) : null}
    </article>
  );
};

