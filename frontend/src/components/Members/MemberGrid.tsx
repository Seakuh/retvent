import { useMemo } from "react";
import { Member } from "../../types/community.types";
import { MemberCard } from "./MemberCard";
import styles from "./MemberGrid.module.css";

interface MemberGridProps {
  members: Member[];
  currentUser?: Member | null;
  searchTerm: string;
  connectionState?: Record<string, "idle" | "pending" | "requested">;
  onConnect: (memberId: string) => Promise<void>;
}

export const MemberGrid = ({
  members,
  currentUser,
  searchTerm,
  connectionState = {},
  onConnect,
}: MemberGridProps) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMembers = useMemo(() => {
    if (!normalizedSearch) {
      return members;
    }
    return members.filter((member) => {
      const haystack = `${member.name} ${member.title ?? ""} ${member.role}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [members, normalizedSearch]);

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Mitglieder</h3>
        <span className={styles.count}>{filteredMembers.length} Personen</span>
      </div>
      {filteredMembers.length === 0 ? (
        <p className={styles.placeholder}>Keine Mitglieder gefunden.</p>
      ) : (
        <ul className={styles.grid}>
          {filteredMembers.map((member) => (
            <li key={member.id}>
              <MemberCard
                member={member}
                currentUser={currentUser}
                status={connectionState[member.id] ?? "idle"}
                onConnect={() => onConnect(member.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

