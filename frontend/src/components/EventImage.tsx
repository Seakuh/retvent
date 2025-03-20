import { useEffect, useState } from "react";
import { imageService } from "../services/imageService";

interface EventImageProps {
  url: string;
  size?: "thumbnail" | "preview" | "full";
  alt?: string;
}

export const EventImage = ({ url, size = "preview", alt }: EventImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        const src = await imageService.getOptimizedImage(url, size);
        if (mounted) {
          setImageSrc(src);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        if (mounted) {
          setImageSrc(url); // Fallback zur Original-URL
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [url, size]);

  if (loading) {
    return <div className="image-placeholder animate-pulse" />;
  }

  return (
    <img
      src={imageSrc || url}
      alt={alt || ""}
      className="event-image"
      loading="lazy"
    />
  );
};
