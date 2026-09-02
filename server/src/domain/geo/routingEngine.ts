/**
 * QuickBite Spatial Routing Engine
 * Implements Dijkstra & A* shortest path search over urban topological road networks
 * with dynamic congestion weights, traffic slowdowns, and turn-by-turn guidance.
 */

import {
  BENGALURU_METRO_NODES,
  BENGALURU_ROAD_SEGMENTS,
  GeoCoordinate,
  RoadNode,
  RoadSegment,
  TurnByTurnInstruction,
} from './metroGraph.js';
import { calculateHaversineDistanceKm } from '../../utils/geo.utils.js';

export interface RouteResult {
  origin: GeoCoordinate;
  destination: GeoCoordinate;
  totalDistanceMeters: number;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  estimatedDurationSeconds: number;
  averageSpeedKmh: number;
  trafficCongestionFactor: number;
  waypoints: GeoCoordinate[];
  instructions: TurnByTurnInstruction[];
  passedNodes: RoadNode[];
}

export class RoutingEngine {
  private static nodeMap: Map<string, RoadNode> = new Map(
    BENGALURU_METRO_NODES.map((n) => [n.id, n])
  );

  private static adjacencyList: Map<string, Array<{ segment: RoadSegment; targetNodeId: string }>> =
    new Map();

  static {
    // Build bidirectional adjacency graph
    for (const node of BENGALURU_METRO_NODES) {
      this.adjacencyList.set(node.id, []);
    }

    for (const seg of BENGALURU_ROAD_SEGMENTS) {
      const fromList = this.adjacencyList.get(seg.fromNodeId) || [];
      fromList.push({ segment: seg, targetNodeId: seg.toNodeId });
      this.adjacencyList.set(seg.fromNodeId, fromList);

      if (!seg.isOneWay) {
        const toList = this.adjacencyList.get(seg.toNodeId) || [];
        toList.push({ segment: seg, targetNodeId: seg.fromNodeId });
        this.adjacencyList.set(seg.toNodeId, toList);
      }
    }
  }

  /**
   * Find nearest topological graph node to an arbitrary lat/lng
   */
  public static snapToNearestNode(coord: GeoCoordinate): RoadNode {
    let nearestNode = BENGALURU_METRO_NODES[0];
    let minDistance = Infinity;

    for (const node of BENGALURU_METRO_NODES) {
      const dist = calculateHaversineDistanceKm(
        coord.latitude,
        coord.longitude,
        node.location.latitude,
        node.location.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestNode = node;
      }
    }

    return nearestNode;
  }

  /**
   * Calculate A* / Dijkstra shortest path between origin and destination coordinates
   */
  public static calculateRoute(
    origin: GeoCoordinate,
    destination: GeoCoordinate,
    trafficMultiplier = 1.0,
    weatherMultiplier = 1.0
  ): RouteResult {
    const startNode = this.snapToNearestNode(origin);
    const endNode = this.snapToNearestNode(destination);

    // If both snap to the same node, generate direct interpolated path
    if (startNode.id === endNode.id) {
      const directDistKm = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      const directDistMeters = Math.max(100, Math.round(directDistKm * 1000));
      const speedKmh = 25 / (trafficMultiplier * weatherMultiplier);
      const durationSec = Math.round((directDistKm / speedKmh) * 3600);

      const waypoints = this.interpolateCoordinates(origin, destination, 15);

      return {
        origin,
        destination,
        totalDistanceMeters: directDistMeters,
        totalDistanceKm: Number((directDistMeters / 1000).toFixed(2)),
        estimatedDurationMinutes: Math.max(2, Math.ceil(durationSec / 60)),
        estimatedDurationSeconds: durationSec,
        averageSpeedKmh: Number(speedKmh.toFixed(1)),
        trafficCongestionFactor: trafficMultiplier,
        waypoints,
        instructions: [
          {
            stepNumber: 1,
            roadName: 'Local Access Road',
            action: 'START',
            distanceMeters: directDistMeters,
            estimatedDurationSeconds: durationSec,
            startLocation: origin,
            endLocation: destination,
            instructionText: `Head directly to destination on local access street`,
          },
          {
            stepNumber: 2,
            roadName: 'Destination Doorstep',
            action: 'ARRIVE',
            distanceMeters: 0,
            estimatedDurationSeconds: 0,
            startLocation: destination,
            endLocation: destination,
            instructionText: 'You have arrived at the customer doorstep.',
          },
        ],
        passedNodes: [startNode],
      };
    }

    // Dijkstra / A* Search Algorithm
    const distances: Map<string, number> = new Map();
    const previous: Map<string, { nodeId: string; segment: RoadSegment } | null> = new Map();
    const visited: Set<string> = new Set();
    const queue: Array<{ nodeId: string; cost: number }> = [];

    for (const node of BENGALURU_METRO_NODES) {
      distances.set(node.id, Infinity);
      previous.set(node.id, null);
    }

    distances.set(startNode.id, 0);
    queue.push({ nodeId: startNode.id, cost: 0 });

    while (queue.length > 0) {
      // Extract node with minimum estimated cost
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift()!;

      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      if (current.nodeId === endNode.id) break;

      const neighbors = this.adjacencyList.get(current.nodeId) || [];
      for (const edge of neighbors) {
        if (visited.has(edge.targetNodeId)) continue;

        // Cost = Distance * Congestion factor * Weather
        const edgeCost =
          edge.segment.distanceMeters *
          edge.segment.baseCongestionFactor *
          trafficMultiplier *
          weatherMultiplier;

        const altDistance = (distances.get(current.nodeId) || 0) + edgeCost;

        if (altDistance < (distances.get(edge.targetNodeId) || Infinity)) {
          distances.set(edge.targetNodeId, altDistance);
          previous.set(edge.targetNodeId, { nodeId: current.nodeId, segment: edge.segment });

          // A* heuristic: straight-line distance to goal
          const targetNode = this.nodeMap.get(edge.targetNodeId)!;
          const heuristicDist =
            calculateHaversineDistanceKm(
              targetNode.location.latitude,
              targetNode.location.longitude,
              endNode.location.latitude,
              endNode.location.longitude
            ) * 1000;

          queue.push({ nodeId: edge.targetNodeId, cost: altDistance + heuristicDist });
        }
      }
    }

    // Reconstruct Path
    const pathNodes: RoadNode[] = [];
    const pathSegments: RoadSegment[] = [];
    let currId: string | null = endNode.id;

    while (currId) {
      const node = this.nodeMap.get(currId);
      if (node) pathNodes.unshift(node);

      const prev = previous.get(currId);
      if (prev) {
        pathSegments.unshift(prev.segment);
        currId = prev.nodeId;
      } else {
        currId = null;
      }
    }

    // If no topological connection found, fallback to direct path
    if (pathNodes.length === 0 || pathNodes[0].id !== startNode.id) {
      return this.calculateRoute(origin, destination, trafficMultiplier, weatherMultiplier);
    }

    // Build Waypoints & Instructions
    const waypoints: GeoCoordinate[] = [origin];
    const instructions: TurnByTurnInstruction[] = [];
    let totalDistMeters = 0;
    let totalDurationSec = 0;

    // Segment 0: Origin to Start Node
    const initialLegKm = calculateHaversineDistanceKm(
      origin.latitude,
      origin.longitude,
      startNode.location.latitude,
      startNode.location.longitude
    );
    const initialLegMeters = Math.round(initialLegKm * 1000);
    if (initialLegMeters > 50) {
      const legWaypoints = this.interpolateCoordinates(origin, startNode.location, 5);
      waypoints.push(...legWaypoints);
      totalDistMeters += initialLegMeters;
      const initDuration = Math.round((initialLegKm / 25) * 3600);
      totalDurationSec += initDuration;

      instructions.push({
        stepNumber: instructions.length + 1,
        roadName: 'Restaurant Alley / Accessway',
        action: 'START',
        distanceMeters: initialLegMeters,
        estimatedDurationSeconds: initDuration,
        startLocation: origin,
        endLocation: startNode.location,
        instructionText: `Head from ${startNode.zone} towards ${startNode.name}`,
      });
    }

    // Segment 1..N: Along Road Segments
    for (let i = 0; i < pathSegments.length; i++) {
      const seg = pathSegments[i];
      const fromN = pathNodes[i];
      const toN = pathNodes[i + 1];

      const segmentWaypoints = this.interpolateCoordinates(fromN.location, toN.location, 6);
      waypoints.push(...segmentWaypoints);

      const effectiveSpeed = (seg.speedLimitKmh / (seg.baseCongestionFactor * trafficMultiplier)) * 0.9;
      const legDuration = Math.round(((seg.distanceMeters / 1000) / Math.max(15, effectiveSpeed)) * 3600);

      totalDistMeters += seg.distanceMeters;
      totalDurationSec += legDuration;

      instructions.push({
        stepNumber: instructions.length + 1,
        roadName: seg.roadName,
        action: i === 0 ? 'START' : 'CONTINUE',
        distanceMeters: seg.distanceMeters,
        estimatedDurationSeconds: legDuration,
        startLocation: fromN.location,
        endLocation: toN.location,
        instructionText: `Continue onto ${seg.roadName} for ${seg.distanceMeters}m towards ${toN.name}`,
      });
    }

    // Segment Final: End Node to Destination
    const finalLegKm = calculateHaversineDistanceKm(
      endNode.location.latitude,
      endNode.location.longitude,
      destination.latitude,
      destination.longitude
    );
    const finalLegMeters = Math.round(finalLegKm * 1000);
    if (finalLegMeters > 50) {
      const finalWaypoints = this.interpolateCoordinates(endNode.location, destination, 5);
      waypoints.push(...finalWaypoints);
      totalDistMeters += finalLegMeters;
      const finalDuration = Math.round((finalLegKm / 25) * 3600);
      totalDurationSec += finalDuration;

      instructions.push({
        stepNumber: instructions.length + 1,
        roadName: 'Destination Approach',
        action: 'CONTINUE',
        distanceMeters: finalLegMeters,
        estimatedDurationSeconds: finalDuration,
        startLocation: endNode.location,
        endLocation: destination,
        instructionText: `Turn onto destination approach towards recipient address`,
      });
    }

    instructions.push({
      stepNumber: instructions.length + 1,
      roadName: 'Customer Doorstep',
      action: 'ARRIVE',
      distanceMeters: 0,
      estimatedDurationSeconds: 0,
      startLocation: destination,
      endLocation: destination,
      instructionText: `Arrive at customer delivery doorstep. Hand over food package.`,
    });

    waypoints.push(destination);

    const totalDistanceKm = Number((totalDistMeters / 1000).toFixed(2));
    const estimatedMinutes = Math.max(3, Math.ceil(totalDurationSec / 60));
    const averageSpeed = Number(((totalDistanceKm / (totalDurationSec / 3600))).toFixed(1));

    return {
      origin,
      destination,
      totalDistanceMeters: totalDistMeters,
      totalDistanceKm,
      estimatedDurationMinutes: estimatedMinutes,
      estimatedDurationSeconds: totalDurationSec,
      averageSpeedKmh: isNaN(averageSpeed) ? 28 : averageSpeed,
      trafficCongestionFactor: trafficMultiplier,
      waypoints,
      instructions,
      passedNodes: pathNodes,
    };
  }

  /**
   * Helper to interpolate N GPS coordinates along a straight line between two points
   */
  private static interpolateCoordinates(
    start: GeoCoordinate,
    end: GeoCoordinate,
    steps: number
  ): GeoCoordinate[] {
    const coords: GeoCoordinate[] = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      coords.push({
        latitude: Number((start.latitude + (end.latitude - start.latitude) * ratio).toFixed(6)),
        longitude: Number((start.longitude + (end.longitude - start.longitude) * ratio).toFixed(6)),
      });
    }
    return coords;
  }
}
