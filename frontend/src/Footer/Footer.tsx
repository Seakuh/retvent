import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <p className="footer-ai-hint">
        The AI could make mistakes, please check important information
      </p>
      <br />
      <div className={styles.legal}>
        <Link to="/terms">Terms of Service</Link>
        <span className={styles.separator}>•</span>
        <Link to="/privacy">Privacy Policy</Link>
        <span className={styles.separator}>•</span>
        <Link to="/imprint">Legal Notice</Link>
      </div>
    </footer>
  );
};

export default Footer;
