import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from '@mantine/core';
import { IconMapPin, IconCalendarEvent } from '@tabler/icons-react';
import { EntityForm } from '../components/forms/EntityForm';
import './AddScreen.css';

export default function AddScreen() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get('tab') || 'location'
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'event' || tab === 'location') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLocationSubmit = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      if (key === 'image') {
        formData.append('image', values.image);
      } else if (key === 'socialMediaLinks') {
        formData.append(key, JSON.stringify(values[key]));
      } else {
        formData.append(key, values[key]);
      }
    });

    const response = await fetch('http://localhost:3145/locations', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to create location');
    }
  };

  const handleEventSubmit = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      if (key === 'image') {
        formData.append('image', values.image);
      } else {
        formData.append(key, values[key]);
      }
    });

    const response = await fetch('http://localhost:3145/events', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }
  };

  return (
    <div className="add-screen glass-effect">
      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        variant="outline"
        classNames={{
          root: 'tabs-root',
          list: 'tabs-list glass-effect',
          tab: 'tab',
          panel: 'tab-panel',
        }}
      >
        <Tabs.List grow>
          <Tabs.Tab
            value="location"
            icon={<span style={{ fontSize: '1.5rem' }}>🏢</span>}
          >
            Location
          </Tabs.Tab>
          <Tabs.Tab
            value="event"
            icon={<span style={{ fontSize: '1.5rem' }}>🎪</span>}
          >
            Event
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="location" pt="xl">
          <EntityForm type="location" onSubmit={handleLocationSubmit} />
        </Tabs.Panel>

        <Tabs.Panel value="event" pt="xl">
          <EntityForm type="event" onSubmit={handleEventSubmit} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

// Upload Flyer Component
export const UploadFlyer: React.FC = () => {
  return (
    <div className="upload-flyer">
      <h2>Upload Flyer</h2>
      <input type="file" accept="image/*" className="file-input" />
      <button className="upload-button">Upload</button>
    </div>
  );
};

// Create Event Component
export const CreateEvent: React.FC = () => {
  return (
    <div className="create-event">
      <h2>Create Event</h2>
      <button className="create-button">Create</button>
    </div>
  );
};

// Add Location Component
export const AddLocation: React.FC = () => {
  return (
    <div className="add-location">
      <h2>Add Location</h2>
      <button className="location-button">Add</button>
    </div>
  );
};
