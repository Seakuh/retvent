// const calculateBoundsDistance = (bounds: LatLngBounds): number => {
//   const center = bounds.getCenter();
//   const northEast = bounds.getNorthEast();

//   // Berechne die Distanz vom Zentrum zur Ecke in Kilometern
//   const R = 6371; // Erdradius in km
//   const lat1 = (center.lat * Math.PI) / 180;
//   const lat2 = (northEast.lat * Math.PI) / 180;
//   const lon1 = (center.lng * Math.PI) / 180;
//   const lon2 = (northEast.lng * Math.PI) / 180;

//   const dLat = lat2 - lat1;
//   const dLon = lon2 - lon1;

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c;

//   // Runde auf die nächste ganze Zahl und füge einen kleinen Puffer hinzu
//   return Math.ceil(distance) + 1;
// };

// interface MapState {
//   center: [number, number];
//   zoom: number;
//   distance: number;
// }

// Funktion zum Vergleich von zwei MapState-Objekten
// const hasSignificantChange = (prev: MapState, current: MapState): boolean => {
//   // Mindestabstand in km, der eine neue Abfrage auslöst
//   const MIN_DISTANCE_CHANGE = 0.5;

//   // Berechne die Entfernung zwischen altem und neuem Zentrum
//   const R = 6371; // Erdradius in km
//   const lat1 = (prev.center[0] * Math.PI) / 180;
//   const lat2 = (current.center[0] * Math.PI) / 180;
//   const lon1 = (prev.center[1] * Math.PI) / 180;
//   const lon2 = (current.center[1] * Math.PI) / 180;

//   const dLat = lat2 - lat1;
//   const dLon = lon2 - lon1;

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const centerDistance = R * c;

//   // Wenn sich das Zoom-Level geändert hat
//   if (prev.zoom !== current.zoom) return true;

//   // Wenn sich das Zentrum mehr als MIN_DISTANCE_CHANGE verschoben hat
//   if (centerDistance > MIN_DISTANCE_CHANGE) return true;

//   // Wenn sich der sichtbare Radius signifikant geändert hat (>20%)
//   if (Math.abs(current.distance - prev.distance) / prev.distance > 0.2)
//     return true;

//   return false;
// };

// const MapController: React.FC<{
//   onViewportChange: (center: [number, number]) => void;
// }> = ({ onViewportChange }) => {
//   const map = useMap();
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleViewportChange = () => {
//       const center = map.getCenter();
//       onViewportChange([center.lat, center.lng]);
//     };

//     const debouncedUpdate = () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//       timerRef.current = setTimeout(handleViewportChange, 300);
//     };

//     map.on("moveend", debouncedUpdate);

//     return () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//       map.off("moveend", debouncedUpdate);
//     };
//   }, [map, onViewportChange]);

//   return null;
// };
