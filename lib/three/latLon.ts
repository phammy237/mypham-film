import { Vector3, Quaternion, Matrix4 } from "three";

type GeoPoint = { lat: number; lon: number };

/**
 * Standard equirectangular lat/lon → sphere position convention (matches the UV layout of the
 * bundled NASA-derived Earth textures: image left edge = -180° lon, top edge = north pole).
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** Inverse of `latLonToVector3` — recovers lat/lon from a point on (or near) the unit sphere. */
export function vector3ToLatLon(v: Vector3): GeoPoint {
  const n = v.clone().normalize();
  const phi = Math.acos(Math.min(1, Math.max(-1, n.y)));
  const lat = 90 - (phi * 180) / Math.PI;
  const sinPhi = Math.sin(phi) || 1e-6;
  const theta = Math.atan2(n.z / sinPhi, -n.x / sinPhi);
  const lon = (((theta * 180) / Math.PI - 180 + 540) % 360) - 180;
  return { lat, lon };
}

/**
 * Dateline-safe interpolation between two lat/lon points, `t` in [0, 1] — spherical (great-circle)
 * slerp of the two points' unit vectors, not a raw lerp of longitude. A raw longitude lerp between,
 * say, Hanoi (105.85°) and a U.S. point (-90.5°) would rotate the "wrong way" around (through
 * Europe/Africa) since the numeric gap the long way (196°) is smaller than going east across the
 * Pacific would suggest; slerp always takes the true shorter great-circle arc, and never jumps at
 * ±180°. Falls back to `from` when the two points coincide (undefined rotation axis).
 */
export function slerpLatLon(from: GeoPoint, to: GeoPoint, t: number): GeoPoint {
  const a = latLonToVector3(from.lat, from.lon, 1).normalize();
  const b = latLonToVector3(to.lat, to.lon, 1).normalize();
  const angle = a.angleTo(b);
  if (angle < 1e-6) return { lat: from.lat, lon: from.lon };
  const sinTotal = Math.sin(angle);
  const w1 = Math.sin((1 - t) * angle) / sinTotal;
  const w2 = Math.sin(t * angle) / sinTotal;
  const dir = new Vector3().addScaledVector(a, w1).addScaledVector(b, w2).normalize();
  return vector3ToLatLon(dir);
}

const WORLD_UP = new Vector3(0, 1, 0);
const NORTH_POLE_FALLBACK_EAST = new Vector3(1, 0, 0);

/**
 * Quaternion that rotates a group so the given lat/lon point faces the camera (+Z) with local
 * north kept pointing to screen-up (+Y). `setFromUnitVectors` alone (shortest arc to +Z) leaves
 * an unconstrained twist around the view axis, which rolls the map at an arbitrary, disorienting
 * angle — recognizable coastlines end up sideways even though the lat/lon math is correct. This
 * builds a proper look-at basis (east/north/target) instead, so the globe always reads north-up.
 */
export function quaternionFacingCamera(lat: number, lon: number): Quaternion {
  const target = latLonToVector3(lat, lon, 1).normalize();
  const east = new Vector3().crossVectors(WORLD_UP, target);
  if (east.lengthSq() < 1e-6) east.copy(NORTH_POLE_FALLBACK_EAST);
  east.normalize();
  const north = new Vector3().crossVectors(target, east).normalize();
  const basis = new Matrix4().makeBasis(east, north, target);
  return new Quaternion().setFromRotationMatrix(basis).invert();
}
