import { FRUIT_EMOJI, GRID_SIZE, MIN_FRUIT_GROUP } from "../constants";
import { hexNeighbors } from "../hex";
import { Grid, GridPos, PopResult, ShooterVariantEngine } from "../types";

export function randFruit(): string {
  return FRUIT_EMOJI[Math.floor(Math.random() * FRUIT_EMOJI.length)];
}

function scoreForGroup(size: number): number {
  return size * 10 + (size - MIN_FRUIT_GROUP) * 5;
}

// Flood-fill desde `landedAt` sobre vecinos hexagonales (6, no 8) del
// MISMO valor — a diferencia de encastraloReact (que escanea toda la
// grilla buscando SI existe algún grupo en cualquier lado), acá solo
// importa el grupo que toca la burbuja recién pegada, así que un solo
// seed alcanza. `rowPhase` ver hex.ts — necesario para que la adyacencia
// coincida con la paridad visual real después de que bajó el techo.
function regionFrom(grid: Grid, landedAt: GridPos, rowPhase: number): GridPos[] {
  const value = grid[landedAt.r][landedAt.c];
  if (value === null) return [];

  const rows = grid.length;
  const key = (r: number, c: number) => r * GRID_SIZE + c;
  const visited = new Set<number>([key(landedAt.r, landedAt.c)]);
  const stack: GridPos[] = [landedAt];
  const region: GridPos[] = [];

  while (stack.length > 0) {
    const cell = stack.pop()!;
    region.push(cell);
    for (const { r: nr, c: nc } of hexNeighbors(cell.r, cell.c, rowPhase)) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= GRID_SIZE) continue;
      const k = key(nr, nc);
      if (visited.has(k) || grid[nr][nc] !== value) continue;
      visited.add(k);
      stack.push({ r: nr, c: nc });
    }
  }
  return region;
}

export const fruitsEngine: ShooterVariantEngine = {
  id: "fruits",
  cellLabel: (value) => String(value),
  randomValue: randFruit,
  resolveLanding(grid, landedAt, rowPhase): PopResult {
    const region = regionFrom(grid, landedAt, rowPhase);
    if (region.length < MIN_FRUIT_GROUP) return { popped: [], points: 0 };
    return { popped: region, points: scoreForGroup(region.length) };
  },
};
