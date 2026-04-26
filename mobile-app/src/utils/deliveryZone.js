// Chichawatni city center coordinates
const CHICHAWATNI_LAT = 30.5392;
const CHICHAWATNI_LNG = 72.6897;
const MAX_RADIUS_MILES = 25;
const MAX_RADIUS_KM = MAX_RADIUS_MILES * 1.60934; // 40.23 km

// Haversine formula — distance between two coordinates in km
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinDeliveryZone(lat, lng) {
  const dist = getDistanceKm(lat, lng, CHICHAWATNI_LAT, CHICHAWATNI_LNG);
  return { allowed: dist <= MAX_RADIUS_KM, distanceKm: dist.toFixed(1) };
}

export { MAX_RADIUS_MILES, CHICHAWATNI_LAT, CHICHAWATNI_LNG };
