/**
 * QuickBite 2D Spatial Grid & Geohashing Index
 * High-performance O(1) in-memory spatial grid partitioner for ultra-fast
 * nearest-neighbor courier dispatch queries and geo-fenced delivery bounds.
 */

import { GeoCoordinate } from './metroGraph.js';
import { calculateHaversineDistanceKm } from '../../utils/geo.utils.js';

export interface SpatialItem<T> {
  id: string;
  coordinate: GeoCoordinate;
  data: T;
}

export class SpatialGridIndex<T> {
  // Grid resolution in degrees (~1.1 km per cell at equator)
  private cellSizeDegrees: number;
  private grid: Map<string, Array<SpatialItem<T>>> = new Map();
  private itemsMap: Map<string, SpatialItem<T>> = new Map();

  constructor(cellSizeDegrees = 0.01) {
    this.cellSizeDegrees = cellSizeDegrees;
  }

  private getCellKey(lat: number, lng: number): string {
    const latIndex = Math.floor(lat / this.cellSizeDegrees);
    const lngIndex = Math.floor(lng / this.cellSizeDegrees);
    return `${latIndex}:${lngIndex}`;
  }

  /**
   * Insert or update an entity in the spatial index
   */
  public insert(id: string, coordinate: GeoCoordinate, data: T): void {
    this.remove(id);

    const item: SpatialItem<T> = { id, coordinate, data };
    const cellKey = this.getCellKey(coordinate.latitude, coordinate.longitude);

    const bucket = this.grid.get(cellKey) || [];
    bucket.push(item);
    this.grid.set(cellKey, bucket);
    this.itemsMap.set(id, item);
  }

  /**
   * Remove an entity from the spatial index
   */
  public remove(id: string): boolean {
    const existing = this.itemsMap.get(id);
    if (!existing) return false;

    const cellKey = this.getCellKey(existing.coordinate.latitude, existing.coordinate.longitude);
    const bucket = this.grid.get(cellKey);
    if (bucket) {
      const filtered = bucket.filter((item) => item.id !== id);
      if (filtered.length === 0) {
        this.grid.delete(cellKey);
      } else {
        this.grid.set(cellKey, filtered);
      }
    }

    this.itemsMap.delete(id);
    return true;
  }

  /**
   * Query all items within radiusKm of center coordinate, sorted by distance
   */
  public queryRadius(
    center: GeoCoordinate,
    radiusKm: number,
    limit = 20
  ): Array<{ item: SpatialItem<T>; distanceKm: number }> {
    const radiusDegrees = radiusKm / 111.0;
    const minLat = center.latitude - radiusDegrees;
    const maxLat = center.latitude + radiusDegrees;
    const minLng = center.longitude - radiusDegrees;
    const maxLng = center.longitude + radiusDegrees;

    const minLatIdx = Math.floor(minLat / this.cellSizeDegrees);
    const maxLatIdx = Math.floor(maxLat / this.cellSizeDegrees);
    const minLngIdx = Math.floor(minLng / this.cellSizeDegrees);
    const maxLngIdx = Math.floor(maxLng / this.cellSizeDegrees);

    const candidates: Array<{ item: SpatialItem<T>; distanceKm: number }> = [];

    for (let latIdx = minLatIdx; latIdx <= maxLatIdx; latIdx++) {
      for (let lngIdx = minLngIdx; lngIdx <= maxLngIdx; lngIdx++) {
        const cellKey = `${latIdx}:${lngIdx}`;
        const bucket = this.grid.get(cellKey);
        if (!bucket) continue;

        for (const item of bucket) {
          const distKm = calculateHaversineDistanceKm(
            center.latitude,
            center.longitude,
            item.coordinate.latitude,
            item.coordinate.longitude
          );

          if (distKm <= radiusKm) {
            candidates.push({ item, distanceKm: Number(distKm.toFixed(2)) });
          }
        }
      }
    }

    candidates.sort((a, b) => a.distanceKm - b.distanceKm);
    return candidates.slice(0, limit);
  }

  /**
   * Count total tracked entities
   */
  public size(): number {
    return this.itemsMap.size;
  }

  /**
   * Clear all items
   */
  public clear(): void {
    this.grid.clear();
    this.itemsMap.clear();
  }
}
