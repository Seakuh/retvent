export interface MapEventDto {
  id: string;
  title: string;
  imageUrl: string;
  location: {
    type: string;
    coordinates: number[];
    city?: string;
  };
  startDate: Date;
}
