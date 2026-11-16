import { RefObject, useCallback, useRef, useState } from "react";
import { stepPath } from "../game/pathBuilder";
import { CELL_SIZE, cellCenter, nearestCell } from "../game/hex";
import { VISIBLE_ROWS, GRID_SIZE } from "../game/constants";
import { CellValue, Grid, GridPos } from "../game/types";

export interface PathBadgeState {
  x: number;
  y: number;
  label: string;
  valid: boolean;
}

// Qué significa el camino recorrido hasta ahora, en la variante que sea
// (la palabra que forma / si vale; la suma que da / si cae en la ventana
// de metas habilitada) — ver evaluate en letras (isValidWord) y en
// números (ventana {piso, piso+1}).
export type PathEvaluator = (values: CellValue[]) => { label: string; valid: boolean };

interface UsePathSelectionArgs {
  boardRef: RefObject<HTMLElement>;
  grid: Grid;
  rowPhase: number;
  evaluate: PathEvaluator;
  onResolved: (path: GridPos[], valid: boolean, label: string) => void;
}

// Selección manual por arrastre, igual que el resto del hub (Encastralo,
// Letris): se apoya el dedo en una burbuja y se recorren vecinas
// (hexagonal acá, no 8 direcciones) sin soltar; al soltar, `evaluate`
// decide si lo recorrido es válido. Genérico a propósito — letras y
// números comparten todo este arrastre, solo cambia qué significa
// "válido" para cada una.
export function usePathSelection({ boardRef, grid, rowPhase, evaluate, onResolved }: UsePathSelectionArgs) {
  const [path, setPath] = useState<GridPos[] | null>(null);
  const [badge, setBadge] = useState<PathBadgeState | null>(null);

  // Espejos síncronos para los listeners de `window` y para `evaluate`
  // (que cambia de identidad entre renders a medida que avanza el juego,
  // ej. la ventana de metas de números) — no deben depender de un closure
  // de un render particular (mismo criterio que usePathSelection de
  // encastraloReact).
  const pathRef = useRef<GridPos[] | null>(null);
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const rowPhaseRef = useRef(rowPhase);
  rowPhaseRef.current = rowPhase;
  const evaluateRef = useRef(evaluate);
  evaluateRef.current = evaluate;
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  const cellAtPoint = useCallback(
    (clientX: number, clientY: number): GridPos | null => {
      const el = boardRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const candidate = nearestCell(x, y, rowPhaseRef.current);
      if (candidate.r < 0 || candidate.r >= VISIBLE_ROWS || candidate.c < 0 || candidate.c >= GRID_SIZE) return null;

      // Zona estricta: solo cuenta si el toque está razonablemente cerca
      // del centro real de esa celda — sin esto, un roce cerca del borde
      // durante un arrastre rápido podría agarrar la celda vecina.
      const { x: cx, y: cy } = cellCenter(candidate.r, candidate.c, rowPhaseRef.current);
      if (Math.hypot(x - cx, y - cy) > CELL_SIZE * 0.6) return null;

      if (gridRef.current[candidate.r][candidate.c] === null) return null;
      return candidate;
    },
    [boardRef],
  );

  function updateBadge(currentPath: GridPos[]) {
    if (currentPath.length === 0) {
      setBadge(null);
      return;
    }
    const values = currentPath.map(({ r, c }) => gridRef.current[r][c] as CellValue);
    const { label, valid } = evaluateRef.current(values);
    const last = currentPath[currentPath.length - 1];
    const { x, y } = cellCenter(last.r, last.c, rowPhaseRef.current);
    setBadge({ x, y: y - 30, label, valid });
  }

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const currentPath = pathRef.current;
      if (!currentPath) return;
      const hit = cellAtPoint(e.clientX, e.clientY);
      if (!hit) return;
      const next = stepPath(currentPath, hit, rowPhaseRef.current);
      if (next === currentPath) return;
      pathRef.current = next;
      setPath(next);
      updateBadge(next);
    },
    [cellAtPoint],
  );

  const handlePointerUp = useCallback(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    const finalPath = pathRef.current;
    pathRef.current = null;
    setPath(null);
    setBadge(null);
    if (!finalPath || finalPath.length === 0) return;

    const values = finalPath.map(({ r, c }) => gridRef.current[r][c] as CellValue);
    const { label, valid } = evaluateRef.current(values);
    onResolvedRef.current(finalPath, valid, label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePointerMove]);

  function handlePointerDown(e: React.PointerEvent) {
    const hit = cellAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    e.preventDefault();
    pathRef.current = [hit];
    setPath([hit]);
    updateBadge([hit]);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return { path, badge, handlePointerDown };
}
