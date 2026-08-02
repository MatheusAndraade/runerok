import { Position } from '../types/game';

export class Pathfinder {
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;
  private obstacleGrid: boolean[][];

  constructor(mapWidth: number, mapHeight: number, cellSize: number = 20) {
    this.cellSize = cellSize;
    this.gridWidth = Math.ceil(mapWidth / cellSize);
    this.gridHeight = Math.ceil(mapHeight / cellSize);

    this.obstacleGrid = Array(this.gridWidth)
      .fill(false)
      .map(() => Array(this.gridHeight).fill(false));
  }

  public setObstacles(obstacles: Array<{ x: number; y: number; w: number; h: number }>) {
    // Reset grid
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (this.obstacleGrid[x]) {
          this.obstacleGrid[x][y] = false;
        }
      }
    }

    // Mark obstacles
    obstacles.forEach(obs => {
      const startX = Math.max(0, Math.floor(obs.x / this.cellSize));
      const startY = Math.max(0, Math.floor(obs.y / this.cellSize));
      const endX = Math.min(this.gridWidth - 1, Math.floor((obs.x + obs.w) / this.cellSize));
      const endY = Math.min(this.gridHeight - 1, Math.floor((obs.y + obs.h) / this.cellSize));

      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          if (this.obstacleGrid[x]) {
            this.obstacleGrid[x][y] = true;
          }
        }
      }
    });
  }

  public updateBounds(mapWidth: number, mapHeight: number, obstacles: Array<{ x: number; y: number; w: number; h: number }>) {
    this.gridWidth = Math.ceil(mapWidth / this.cellSize);
    this.gridHeight = Math.ceil(mapHeight / this.cellSize);
    this.obstacleGrid = Array(this.gridWidth)
      .fill(false)
      .map(() => Array(this.gridHeight).fill(false));
    this.setObstacles(obstacles);
  }

  public isObstacle(worldX: number, worldY: number): boolean {
    const gx = Math.floor(worldX / this.cellSize);
    const gy = Math.floor(worldY / this.cellSize);
    if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) return true;
    return this.obstacleGrid[gx][gy];
  }

  public findPath(start: Position, goal: Position): Position[] {
    const startGx = Math.max(0, Math.min(this.gridWidth - 1, Math.floor(start.x / this.cellSize)));
    const startGy = Math.max(0, Math.min(this.gridHeight - 1, Math.floor(start.y / this.cellSize)));
    let goalGx = Math.max(0, Math.min(this.gridWidth - 1, Math.floor(goal.x / this.cellSize)));
    let goalGy = Math.max(0, Math.min(this.gridHeight - 1, Math.floor(goal.y / this.cellSize)));

    // If goal is inside obstacle, find nearest free cell
    if (this.obstacleGrid[goalGx][goalGy]) {
      let foundFree = false;
      for (let radius = 1; radius <= 3; radius++) {
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            const nx = goalGx + dx;
            const ny = goalGy + dy;
            if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight && !this.obstacleGrid[nx][ny]) {
              goalGx = nx;
              goalGy = ny;
              foundFree = true;
              break;
            }
          }
          if (foundFree) break;
        }
        if (foundFree) break;
      }
    }

    if (startGx === goalGx && startGy === goalGy) {
      return [goal];
    }

    interface Node {
      gx: number;
      gy: number;
      g: number;
      h: number;
      f: number;
      parent: Node | null;
    }

    const openList: Node[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: Node = {
      gx: startGx,
      gy: startGy,
      g: 0,
      h: Math.abs(startGx - goalGx) + Math.abs(startGy - goalGy),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);

    const key = (x: number, y: number) => `${x},${y}`;

    let iterations = 0;
    const maxIterations = 500;

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;
      // Sort openList by f cost
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.gx === goalGx && current.gy === goalGy) {
        // Path found! Reconstruct
        const path: Position[] = [];
        let curr: Node | null = current;
        while (curr) {
          path.unshift({
            x: curr.gx * this.cellSize + this.cellSize / 2,
            y: curr.gy * this.cellSize + this.cellSize / 2
          });
          curr = curr.parent;
        }
        // Replace last point with exact target
        if (path.length > 0) path[path.length - 1] = goal;
        return path;
      }

      closedSet.add(key(current.gx, current.gy));

      const neighbors = [
        { x: current.gx + 1, y: current.gy },
        { x: current.gx - 1, y: current.gy },
        { x: current.gx, y: current.gy + 1 },
        { x: current.gx, y: current.gy - 1 },
        { x: current.gx + 1, y: current.gy + 1 },
        { x: current.gx - 1, y: current.gy - 1 },
        { x: current.gx + 1, y: current.gy - 1 },
        { x: current.gx - 1, y: current.gy + 1 }
      ];

      for (const n of neighbors) {
        if (n.x < 0 || n.x >= this.gridWidth || n.y < 0 || n.y >= this.gridHeight) continue;
        if (this.obstacleGrid[n.x][n.y]) continue;
        if (closedSet.has(key(n.x, n.y))) continue;

        const isDiagonal = n.x !== current.gx && n.y !== current.gy;
        const gCost = current.g + (isDiagonal ? 1.414 : 1.0);
        const hCost = Math.abs(n.x - goalGx) + Math.abs(n.y - goalGy);

        const existing = openList.find(o => o.gx === n.x && o.gy === n.y);
        if (!existing) {
          openList.push({
            gx: n.x,
            gy: n.y,
            g: gCost,
            h: hCost,
            f: gCost + hCost,
            parent: current
          });
        } else if (gCost < existing.g) {
          existing.g = gCost;
          existing.f = gCost + existing.h;
          existing.parent = current;
        }
      }
    }

    // Direct line fallback if pathfinding times out
    return [goal];
  }
}
