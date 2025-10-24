import { Partner } from "../../types/community.types";
import styles from "./PartnerStrip.module.css";

interface PartnerStripProps {
  partners: Partner[];
}

export const PartnerStrip = ({ partners }: PartnerStripProps) => {
  if (partners.length === 0) {
    return null;
  }
  return (
    <section className={styles.wrapper} aria-label="Partner & Sponsoren">
      <h3 className={styles.title}>Unsere Partner</h3>
      <div className={styles.scroller}>
        {partners.map((partner) => (
          <a
            key={partner.id}
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.partner}
            title={partner.name}
          >
            <img src={partner.logoUrl} alt={`${partner.name} Logo`} />
          </a>
        ))}
      </div>
    </section>
  );
};

