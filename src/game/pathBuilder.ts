import { hexNeighbors } from "./hex";
import { GridPos } from "./types";

function samePos(a: GridPos, b: GridPos): boolean {
  return a.r === b.r && a.c === b.c;
}

// Agrega `hit` al camino de selección manual (arrastre sobre el
// tablero) — mismo criterio que el pathBuilder de encastraloReact:
// - Si `hit` es la celda anteúltima del camino, es un retroceso: se acorta
//   el camino un paso (así el jugador puede corregir sin soltar el dedo).
// - Si `hit` ya está en el camino (y no es el retroceso de arriba), no
//   pasa nada — no se permite repetir una celda.
// - Si `hit` es vecina hexagonal de la última celda y todavía no está en
//   el camino, se agrega.
// - Cualquier otro caso (celda no adyacente), no pasa nada.
export function stepPath(path: GridPos[], hit: GridPos, rowPhase: number): GridPos[] {
  if (path.length === 0) return [hit];

  const last = path[path.length - 1];
  if (samePos(last, hit)) return path;

  if (path.length >= 2 && samePos(path[path.length - 2], hit)) {
    return path.slice(0, -1);
  }

  if (path.some((p) => samePos(p, hit))) return path;

  const isNeighbor = hexNeighbors(last.r, last.c, rowPhase).some((n) => samePos(n, hit));
  if (!isNeighbor) return path;

  return [...path, hit];
}
