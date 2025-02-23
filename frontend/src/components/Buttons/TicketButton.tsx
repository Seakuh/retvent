import React from 'react';
import styles from './TicketButton.module.css';

interface TicketButtonProps {
  href: string;
}

const TicketButton: React.FC<TicketButtonProps> = ({ href }) => {
  return (
    <div className={styles.buttonWrapper}>
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ticketButton}
      >
        BUY TICKETS NOW
      </a>
    </div>
  );
};

export default TicketButton; 