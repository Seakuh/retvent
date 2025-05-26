import React, { useState } from 'react';
import { QrCode, DollarSign, Link, Share2, Download, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import styles from './ToolsBox.module.css';

const ToolsBox: React.FC = () => {
  const [eventUrl, setEventUrl] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [estimatedAttendees, setEstimatedAttendees] = useState('');

  // Calculate estimated revenue
  const calculateRevenue = () => {
    const price = parseFloat(ticketPrice) || 0;
    const attendees = parseInt(estimatedAttendees) || 0;
    return (price * attendees).toFixed(2);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Organizer Tools</h2>
      <div className={styles.grid}>
        {/* QR Code Generator */}
        <div className={styles.toolCard}>
          <div className={styles.toolHeader}>
            <div className={styles.toolIcon}>
              <QrCode size={20} />
            </div>
            <div className={styles.toolTitle}>QR Code Generator</div>
          </div>
          <div className={styles.toolDescription}>
            Generate QR codes for your event pages, tickets, or promotional materials.
          </div>
          <Input
            id="eventUrl"
            label="Event URL"
            value={eventUrl}
            onChange={(e) => setEventUrl(e.target.value)}
            placeholder="https://yourevent.com"
          />
          {eventUrl && (
            <div className={styles.qrPreview}>
              <div className={styles.qrPlaceholder}>
                QR Code Preview<br />
                (Will generate for: {eventUrl})
              </div>
            </div>
          )}
          <Button leftIcon={Download} disabled={!eventUrl}>
            Generate QR Code
          </Button>
        </div>
        
        {/* Revenue Estimator */}
        <div className={styles.toolCard}>
          <div className={styles.toolHeader}>
            <div className={styles.toolIcon}>
              <DollarSign size={20} />
            </div>
            <div className={styles.toolTitle}>Revenue Estimator</div>
          </div>
          <div className={styles.toolDescription}>
            Estimate potential revenue based on ticket price and estimated attendance.
          </div>
          <Input
            id="ticketPrice"
            label="Ticket Price ($)"
            type="number"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            placeholder="0.00"
          />
          <Input
            id="estimatedAttendees"
            label="Estimated Attendees"
            type="number"
            value={estimatedAttendees}
            onChange={(e) => setEstimatedAttendees(e.target.value)}
            placeholder="0"
          />
          <div style={{ 
            marginTop: 'var(--space-3)', 
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-neutral-50)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>Estimated Revenue</div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: 'var(--color-primary-600)'
            }}>
              ${calculateRevenue()}
            </div>
          </div>
        </div>
        
        {/* Link Helper */}
        <div className={styles.toolCard}>
          <div className={styles.toolHeader}>
            <div className={styles.toolIcon}>
              <Link size={20} />
            </div>
            <div className={styles.toolTitle}>Link Helper</div>
          </div>
          <div className={styles.toolDescription}>
            Create and manage shortened links for your events and promotional materials.
          </div>
          <Button leftIcon={ChevronRight} style={{ marginTop: 'var(--space-3)' }}>
            Manage Links
          </Button>
        </div>
        
        {/* Share Helper */}
        <div className={styles.toolCard}>
          <div className={styles.toolHeader}>
            <div className={styles.toolIcon}>
              <Share2 size={20} />
            </div>
            <div className={styles.toolTitle}>Share Helper</div>
          </div>
          <div className={styles.toolDescription}>
            Generate share links for all major platforms with pre-populated content.
          </div>
          <Button leftIcon={ChevronRight} style={{ marginTop: 'var(--space-3)' }}>
            Create Share Links
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolsBox;