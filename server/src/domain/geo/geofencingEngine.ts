/**
 * QuickBite Polygon Geofencing & Serviceability Engine
 * Performs ray-casting point-in-polygon tests to determine if a customer delivery
 * address falls within a restaurant's licensed operating boundary or restricted zones.
 */

import { GeoCoordinate } from './metroGraph.js';

export interface PolygonBoundary {
  polygonId: string;
  zoneName: string;
  vertices: GeoCoordinate[];
  maxDeliveryRadiusKm: number;
  isServiceable: boolean;
}

export class GeofencingEngine {
  /**
   * Ray-casting algorithm to test if a point lies inside a 2D polygon
   */
  public static isPointInPolygon(point: GeoCoordinate, vertices: GeoCoordinate[]): boolean {
    if (vertices.length < 3) return false;

    let inside = false;
    const x = point.longitude;
    const y = point.latitude;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].longitude;
      const yi = vertices[i].latitude;
      const xj = vertices[j].longitude;
      const yj = vertices[j].latitude;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Check if customer coordinate is serviceable by restaurant delivery polygon
   */
  public static checkServiceability(
    customerLocation: GeoCoordinate,
    boundary: PolygonBoundary
  ): { isServiceable: boolean; reason?: string } {
    if (!boundary.isServiceable) {
      return { isServiceable: false, reason: `Zone ${boundary.zoneName} is temporarily non-serviceable.` };
    }

    const inside = this.isPointInPolygon(customerLocation, boundary.vertices);
    if (!inside) {
      return {
        isServiceable: false,
        reason: `Address is outside the delivery boundary for ${boundary.zoneName}.`,
      };
    }

    return { isServiceable: true };
  }
}
