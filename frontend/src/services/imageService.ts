import { imageCache } from "./imageCache";

export const imageService = {
  async getImage(url: string): Promise<string> {
    try {
      // Erst im Cache nachsehen
      const cachedImage = await imageCache.get(url);
      if (cachedImage) {
        console.log("Image loaded from cache:", url);
        return cachedImage;
      }

      // Wenn nicht im Cache, dann fetchen und cachen
      const response = await fetch(url);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Im Cache speichern
      await imageCache.set(url, base64);
      return base64;
    } catch (error) {
      console.error("Error loading image:", error);
      return url; // Fallback zur Original-URL
    }
  },

  // Optimierte Version mit verschiedenen Größen
  async getOptimizedImage(
    url: string,
    size: "thumbnail" | "preview" | "full" = "preview"
  ): Promise<string> {
    const sizes = {
      thumbnail: { width: 100, height: 100 },
      preview: { width: 400, height: 400 },
      full: {}, // Originalgröße
    };

    const cacheKey = `${url}-${size}`;
    try {
      const cachedImage = await imageCache.get(cacheKey);
      if (cachedImage) return cachedImage;

      // Hier können Sie die Bildgröße anpassen, bevor Sie es cachen
      const optimizedUrl = this.optimize(url, sizes[size]);
      const image = await this.getImage(optimizedUrl);
      await imageCache.set(cacheKey, image);
      return image;
    } catch (error) {
      console.error("Error loading optimized image:", error);
      return url;
    }
  },

  optimize(
    url: string,
    { width, height }: { width?: number; height?: number } = {}
  ) {
    // Hier können Sie Ihre CDN-Logik implementieren
    if (!width && !height) return url;

    // Beispiel mit einem imaginären CDN
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());

    return `${url}?${params.toString()}`;
  },
};
