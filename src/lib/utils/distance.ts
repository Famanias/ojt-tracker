/**
 * Haversine formula to calculate distance (in meters) between two GPS coordinates.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if coordinates are within the allowed radius from the site.
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  siteLat: number,
  siteLon: number,
  radiusMeters: number
): { allowed: boolean; distance: number } {
  const distance = calculateDistance(userLat, userLon, siteLat, siteLon);
  return { allowed: distance <= radiusMeters, distance };
}
