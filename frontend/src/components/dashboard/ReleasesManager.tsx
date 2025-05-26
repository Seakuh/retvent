import React, { useState } from 'react';
import { Music, PlusCircle, Calendar, AlignJustify as Spotify, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import styles from './ReleasesManager.module.css';
import { Release } from '../../types';

interface ReleasesManagerProps {
  releases: Release[];
}

const ReleasesManager: React.FC<ReleasesManagerProps> = ({ releases: initialReleases }) => {
  const [releases, setReleases] = useState<Release[]>(initialReleases);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [soundCloudLink, setSoundCloudLink] = useState('');
  const [applePodcastsLink, setApplePodcastsLink] = useState('');
  const [beatportLink, setBeatportLink] = useState('');
  const [bandcampLink, setBandcampLink] = useState('');

  // Genre options
  const genreOptions = [
    { value: 'Deep House', label: 'Deep House' },
    { value: 'Techno', label: 'Techno' },
    { value: 'Podcast', label: 'Podcast' },
    { value: 'Indie', label: 'Indie' },
    { value: 'Hip-Hop', label: 'Hip-Hop' },
    { value: 'Jazz', label: 'Jazz' },
    { value: 'Rock', label: 'Rock' },
    { value: 'Classical', label: 'Classical' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new release
    const newRelease: Release = {
      id: Date.now().toString(),
      title,
      artist,
      description,
      coverImage: coverImage || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
      genre,
      releaseDate,
      platforms: {
        spotify: spotifyLink,
        soundCloud: soundCloudLink,
        applePodcasts: applePodcastsLink,
        beatport: beatportLink,
        bandcamp: bandcampLink,
      },
    };
    
    // Add to releases
    setReleases([...releases, newRelease]);
    
    // Reset form
    setTitle('');
    setArtist('');
    setDescription('');
    setCoverImage('');
    setGenre('');
    setReleaseDate('');
    setSpotifyLink('');
    setSoundCloudLink('');
    setApplePodcastsLink('');
    setBeatportLink('');
    setBandcampLink('');
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Releases</h2>
        <Button
          leftIcon={PlusCircle}
          onClick={() => setShowForm(!showForm)}
        >
          New Release
        </Button>
      </div>
      
      {showForm && (
        <form className={styles.formContainer} onSubmit={handleFormSubmit}>
          <h3 className={styles.formTitle}>Create New Release</h3>
          <div className={styles.formGrid}>
            <Input
              id="title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter release title"
              required
            />
            <Input
              id="artist"
              label="Artist Name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
              required
            />
            <Input
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description"
              required
            />
            <Input
              id="coverImage"
              label="Cover Image URL"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Enter cover image URL"
            />
            <Select
              id="genre"
              label="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              options={genreOptions}
              required
            />
            <Input
              id="releaseDate"
              label="Release Date"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
            />
            <Input
              id="spotifyLink"
              label="Spotify Link"
              value={spotifyLink}
              onChange={(e) => setSpotifyLink(e.target.value)}
              placeholder="Enter Spotify URL"
            />
            <Input
              id="soundCloudLink"
              label="SoundCloud Link"
              value={soundCloudLink}
              onChange={(e) => setSoundCloudLink(e.target.value)}
              placeholder="Enter SoundCloud URL"
            />
            <Input
              id="applePodcastsLink"
              label="Apple Podcasts Link"
              value={applePodcastsLink}
              onChange={(e) => setApplePodcastsLink(e.target.value)}
              placeholder="Enter Apple Podcasts URL"
            />
            <Input
              id="beatportLink"
              label="Beatport Link"
              value={beatportLink}
              onChange={(e) => setBeatportLink(e.target.value)}
              placeholder="Enter Beatport URL"
            />
            <Input
              id="bandcampLink"
              label="Bandcamp Link"
              value={bandcampLink}
              onChange={(e) => setBandcampLink(e.target.value)}
              placeholder="Enter Bandcamp URL"
            />
            
            <div className={styles.formActions}>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Release</Button>
            </div>
          </div>
        </form>
      )}
      
      <div className={styles.releasesList}>
        {releases.map((release) => {
          const formattedDate = new Date(release.releaseDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          
          return (
            <div key={release.id} className={styles.releaseCard}>
              <img 
                src={release.coverImage} 
                alt={`${release.title} by ${release.artist}`} 
                className={styles.coverImage}
              />
              <div className={styles.releaseContent}>
                <h3 className={styles.releaseTitle}>{release.title}</h3>
                <p className={styles.releaseArtist}>{release.artist}</p>
                <span className={styles.releaseGenre}>{release.genre}</span>
                <div className={styles.releaseDate}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Released on {formattedDate}
                </div>
                <p style={{ fontSize: '0.875rem' }}>{release.description}</p>
                <div className={styles.platformLinks}>
                  {release.platforms.spotify && (
                    <a href={release.platforms.spotify} target="_blank" rel="noopener noreferrer" className={styles.platformLink}>
                      <Spotify size={18} />
                    </a>
                  )}
                  {(release.platforms.soundCloud || release.platforms.applePodcasts || release.platforms.beatport || release.platforms.bandcamp) && (
                    <a href={release.platforms.soundCloud || release.platforms.applePodcasts || release.platforms.beatport || release.platforms.bandcamp} target="_blank" rel="noopener noreferrer" className={styles.platformLink}>
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReleasesManager;