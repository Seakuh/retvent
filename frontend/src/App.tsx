import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useSearchParams } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import LandingPage from './LandingPage';
import { AdminPage } from './components/AdminPage/AdminPage';
import { EventDetail } from './components/EventDetail/EventDetail';

const ArtistPage: React.FC = () => {
  const { artistid } = useParams<{ artistid: string }>();
  return (
    <div>
      <h1>Artist Page</h1>
      <p>Artist ID: {artistid}</p>
    </div>
  );
};

const LocationPage: React.FC = () => {
  const { locationid } = useParams<{ locationid: string }>();
  return (
    <div>
      <h1>Location Page</h1>
      <p>Location ID: {locationid}</p>
    </div>
  );
};

const EventPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  return (
    <div>
      <h1>Event Page</h1>
      <p>Event ID: {eventId}</p>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/artist/:artistid" element={<ArtistPage />} />
      <Route path="/location/:locationid" element={<LocationPage />} />
      <Route path="/event/:eventid" element={<EventDetail />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  </Router>
);

// App in den DOM einbinden
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
