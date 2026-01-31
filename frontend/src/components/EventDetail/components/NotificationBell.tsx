import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Check, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import './NotificationBell.css';

interface NotificationBellProps {
  eventId: string;
  eventTitle: string;
  startDate: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ eventId, eventTitle, startDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customUnit, setCustomUnit] = useState<'m' | 'h' | 'd'>('m');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '2 hours before', value: 120 },
    { label: '4 hours before', value: 240 },
    { label: '1 day before', value: 1440 },
    { label: '2 days before', value: 2880 },
    { label: '3 days before', value: 4320 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check if already subscribed for this event
    const subscriptions = JSON.parse(localStorage.getItem('event_subscriptions') || '{}');
    if (subscriptions[eventId]) {
      setIsSubscribed(true);
      setSelectedOption(subscriptions[eventId].minutesBefore);
    }
  }, [eventId]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications.');
      return false;
    }
    
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.warning('Please enable notifications to receive reminders.');
    }
    return permission === 'granted';
  };

  const scheduleNotification = async (minutesBefore: number) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    const eventDate = new Date(startDate);
    const notificationDate = new Date(eventDate.getTime() - minutesBefore * 60000);
    const now = new Date();

    if (notificationDate <= now) {
      toast.error('This time is right now!');
      return;
    }

    // Store subscription
    const subscriptions = JSON.parse(localStorage.getItem('event_subscriptions') || '{}');
    subscriptions[eventId] = {
      eventTitle,
      startDate,
      minutesBefore,
      scheduledAt: notificationDate.toISOString()
    };
    localStorage.setItem('event_subscriptions', JSON.stringify(subscriptions));

    setIsSubscribed(true);
    setSelectedOption(minutesBefore);
    setIsOpen(false);

    // Auto-like the event when setting a reminder
    const { addFavorite, isFavorite } = (window as any).userContext || {};
    if (addFavorite && isFavorite && !isFavorite(eventId)) {
      addFavorite(eventId);
    }

    // In a real app, you'd send this to a backend or use a Service Worker with Push API.
    const delay = notificationDate.getTime() - now.getTime();
    
    if (delay < 2147483647) { // Max setTimeout delay
      setTimeout(() => {
        new Notification('Event Reminder', {
          body: `"${eventTitle}" is starting soon!`,
          icon: '/logo.png'
        });
      }, delay);
    }

    toast.success(`Reminder set for ${notificationDate.toLocaleString()}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let minutes = parseInt(customValue);
    if (isNaN(minutes)) return;

    if (customUnit === 'h') minutes *= 60;
    if (customUnit === 'd') minutes *= 1440;

    scheduleNotification(minutes);
  };

  const unsubscribe = () => {
    const subscriptions = JSON.parse(localStorage.getItem('event_subscriptions') || '{}');
    delete subscriptions[eventId];
    localStorage.setItem('event_subscriptions', JSON.stringify(subscriptions));
    setIsSubscribed(false);
    setSelectedOption(null);
    setIsOpen(false);
    toast.info('Reminder deactivated');
  };

  return (
    <div  className="notification-bell-container" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button 
        className={`notification-bell-button ${isSubscribed ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault(); 
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Set reminder"
      >
        {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <Bell className="h-4 w-4" />
            Remind me...
          </div>
          
          <div className="dropdown-options">
            {options.map((opt) => (
              <button
                key={opt.value}
                className={`dropdown-item ${selectedOption === opt.value ? 'selected' : ''}`}
                onClick={() => scheduleNotification(opt.value)}
              >
                {opt.label}
                {selectedOption === opt.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>

          <button 
            className="dropdown-item custom-trigger"
            onClick={() => setShowCustom(!showCustom)}
          >
            <span>Custom...</span>
            <ChevronRight className={`h-4 w-4 transition-transform ${showCustom ? 'rotate-90' : ''}`} />
          </button>

          {showCustom && (
            <form onSubmit={handleCustomSubmit} className="custom-input-container">
              <input
                type="number"
                className="custom-input"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Value"
                min="1"
                required
              />
              <select 
                className="custom-select"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value as any)}
              >
                <option value="m">Min</option>
                <option value="h">Hrs</option>
                <option value="d">Days</option>
              </select>
              <button type="submit" className="custom-submit">
                <Check className="h-4 w-4" />
              </button>
            </form>
          )}

          {isSubscribed && (
            <button 
              className="dropdown-item" 
              style={{ color: '#ff4d4d', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
              onClick={unsubscribe}
            >
              Deactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
};
