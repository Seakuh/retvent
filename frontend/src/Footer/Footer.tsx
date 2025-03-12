import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.legal}>
        <Link to="/privacy">Privacy Policy</Link>
        <span className={styles.separator}>•</span>
        <Link to="/imprint">Legal Notice</Link>
      </div>
    </footer>
  );
};

export default Footer; 