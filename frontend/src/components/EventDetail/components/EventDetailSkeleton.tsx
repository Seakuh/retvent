export const EventDetailSkeleton: React.FC = () => (
  <div className="event-detail-skeleton">
    {/* Hero Image Skeleton */}
    <div className="skeleton-hero" />

    {/* Basic Info Skeleton */}
    <div className="skeleton-content">
      <div className="skeleton-basic-info">
        <div className="skeleton-info-item" />
        <div className="skeleton-info-item" />
      </div>

      {/* Title and Description Skeleton */}
      <div className="skeleton-description">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
      </div>

      {/* Lineup Skeleton */}
      <div className="skeleton-lineup">
        <div className="skeleton-subtitle" />
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
