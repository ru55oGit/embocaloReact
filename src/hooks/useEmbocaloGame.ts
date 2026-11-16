import { useCallback, useEffect, useRef, useState } from "react";
import { FLOATING_DROP_BONUS, GRID_SIZE, INITIAL_ROWS, MIN_TARGET_SUM, NUMBER_GOAL_BONUS_PER_SUM, ROW_DROP_INTERVAL_MS, VISIBLE_ROWS } from "../game/constants";
import { dropFloatingCells, dropOneRow, initialGrid } from "../game/grid";
import { hexNeighbors, isRowInBounds, isValidCell } from "../game/hex";
import { fruitsEngine } from "../game/variants/fruits";
import { randDigit, sumScore } from "../game/variants/numbers";
import { randConsonant, randVowel, scoreForWord } from "../game/variants/words/words";
import { CellValue, Grid, GridPos, Variant } from "../game/types";
import { SupportedLanguage } from "../i18n/translations";
import { playErrorSound, playSuccessSound } from "../utils/sound";

export interface PopFeedback {
  cells: GridPos[];
  points: number;
  label?: string;
}

// Proporción inicial de vocales al armar la grilla de letras — si fuera
// pura frecuencia real (mayoría consonantes), al arrancar casi no entrarían
// palabras formables.
const INITIAL_VOWEL_RATIO = 0.4;

// `landed` se calculó contra una FOTO de la grilla tomada al disparar —
// para cuando la animación de vuelo termina (420ms después, ver
// AimedShooter) esa celda puede haberse ocupado de verdad: bajó el techo
// mientras volaba, o en letras el otro disparador (vocales/consonantes
// son independientes) pegó algo ahí primero. Antes esto rechazaba el tiro
// entero (sonido de error + la bolita desaparecía a mitad de pantalla sin
// que se note por qué) — en vez de tirar el disparo, se reubica en el
// vecino hexagonal vacío más cercano, así casi ningún tiro se pierde de
// verdad.
function resolveActualLanding(grid: Grid, landed: GridPos, rowPhase: number): GridPos | null {
  if (grid[landed.r][landed.c] === null) return landed;
  const alt = hexNeighbors(landed.r, landed.c, rowPhase).find(
    (n) => isRowInBounds(n.r) && isValidCell(n.r, n.c, rowPhase) && grid[n.r][n.c] === null,
  );
  return alt ?? null;
}

export function useEmbocaloGame(variant: Variant, language: SupportedLanguage) {
  const isLetters = variant === "letters";
  const isNumbers = variant === "numbers";
  // Las dos comparten "disparar solo pega, el jugador borra a mano
  // arrastrando" (ver placeValue/useEmbocaloGame más abajo) — frutas es
  // la única que todavía explota sola al aterrizar.
  const isSwipeVariant = isLetters || isNumbers;

  const rollInitial = useCallback((): CellValue => {
    if (isLetters) return Math.random() < INITIAL_VOWEL_RATIO ? randVowel(language) : randConsonant(language);
    if (isNumbers) return randDigit();
    return fruitsEngine.randomValue();
  }, [isLetters, isNumbers, language]);

  const [grid, setGrid] = useState<Grid>(() => initialGrid(rollInitial, INITIAL_ROWS));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  // Pausa: solo detiene la barra de progreso (no hay reloj acá) — el
  // jugador tampoco puede disparar/arrastrar mientras tanto, ver
  // GameBoard.
  const [paused, setPaused] = useState(false);
  // 0..1, cuánto se llenó la barra de progreso.
  const [progress, setProgress] = useState(0);
  const [popFeedback, setPopFeedback] = useState<PopFeedback | null>(null);
  const popFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cuántas veces bajó el techo, módulo 2 — ver hex.ts. Cada bajada corre
  // todos los índices de fila en 1, así que hay que compensar la paridad
  // para que la adyacencia hexagonal (y el dibujo) sigan coincidiendo con
  // la posición física real de cada celda ya existente.
  const [rowPhase, setRowPhase] = useState(0);
  const rowPhaseRef = useRef(rowPhase);
  rowPhaseRef.current = rowPhase;

  // Solo números: mismo modelo de metas que encastraloReact — arranca en
  // 10, la ventana habilitada para borrar es siempre {piso, piso+1}, y
  // solo sumar exactamente piso+1 sube la meta (sumar el piso de nuevo es
  // válido pero no la sube — ver clearNumberPath).
  const [numberFloor, setNumberFloor] = useState(MIN_TARGET_SUM);
  const numberFloorRef = useRef(numberFloor);
  numberFloorRef.current = numberFloor;

  // Solo para la card de "Récord" del Home (ver variantRecordState.ts /
  // wordsRecordState.ts) — no afectan la lógica de juego en sí. En
  // letras se guarda la lista COMPLETA (no solo un contador + la más
  // larga): wordsRecordState necesita las palabras reales para mostrar
  // los chips de "esta partida" en el Home.
  const [clearsCount, setClearsCount] = useState(0);
  const [fruitHighlight, setFruitHighlight] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  // Solo lo usa frutas (un único disparador sin elección del jugador) —
  // letras no tiene "next" acá: el carrusel de cada disparador es estado
  // propio de LetterShooters, el jugador elige la letra antes de disparar.
  // Números sí usa un "next" (un solo disparador, sin elección, como
  // frutas).
  const [nextValue, setNextValue] = useState<CellValue>(() => (isLetters ? "" : rollInitial()));

  // --- Barra de progreso: tick cada 100ms por diff de Date.now() (no un
  // contador fijo), mismo criterio que el reloj de Encastralo. ---
  const tickRef = useRef(Date.now());
  useEffect(() => {
    if (gameOver || paused) return;
    tickRef.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const elapsed = now - tickRef.current;
      tickRef.current = now;
      setProgress((prev) => prev + elapsed / ROW_DROP_INTERVAL_MS);
    }, 100);
    return () => clearInterval(id);
  }, [gameOver, paused]);

  // Espejo síncrono para los efectos/callbacks de abajo, que no deben
  // depender de un closure de un render particular.
  const gridRef = useRef(grid);
  gridRef.current = grid;

  // Efecto separado (no adentro del updater de setProgress, que en
  // StrictMode React lo invoca dos veces y duplicaría la bajada de fila):
  // cuando la barra se completa, baja el techo y arranca de nuevo.
  useEffect(() => {
    if (progress < 1 || gameOver) return;
    setProgress(0);
    const result = dropOneRow(gridRef.current, rollInitial, rowPhaseRef.current);
    setGrid(result.grid);
    if (result.gameOver) {
      setGameOver(true);
    } else {
      setRowPhase((p) => (p + 1) % 2);
    }
  }, [progress, gameOver, rollInitial]);

  function showPop(cells: GridPos[], points: number, label?: string) {
    setPopFeedback({ cells, points, label });
    if (popFeedbackTimeoutRef.current) clearTimeout(popFeedbackTimeoutRef.current);
    // 700ms no alcanzaba a leer una palabra formada — 1.6s da tiempo real
    // de ver qué se armó antes de que desaparezca.
    popFeedbackTimeoutRef.current = setTimeout(() => setPopFeedback(null), 1600);
  }

  // Saca de la grilla las celdas de `cells` y deja caer lo que haya
  // quedado sin conexión al techo — compartido por el pop automático de
  // frutas y el borrado manual de letras/números.
  function clearCellsAndSettle(withCells: Grid, cells: GridPos[], basePoints: number, label?: string) {
    const rowPhase = rowPhaseRef.current;
    const poppedKeys = new Set(cells.map(({ r, c }) => r * GRID_SIZE + c));
    const cleared = withCells.map((row, ri) => row.map((cell, ci) => (poppedKeys.has(ri * GRID_SIZE + ci) ? null : cell)));

    // Lo que haya quedado sin conexión al techo después del pop también
    // cae — si no, quedan islas sueltas flotando en el medio de la grilla
    // (ver game/grid.ts).
    const { grid: settled, dropped } = dropFloatingCells(cleared, rowPhase);
    const bonusPoints = dropped.length * FLOATING_DROP_BONUS;

    playSuccessSound();
    setScore((s) => s + basePoints + bonusPoints);
    showPop([...cells, ...dropped], basePoints + bonusPoints, label);
    setGrid(settled);
  }

  // Frutas: la burbuja ya aterrizó (AimedShooter calculó `landed` con la
  // simulación de trayectoria) — acá se corre la detección de pop
  // automática y se re-tira la "próxima" al azar para el siguiente turno.
  // Usa gridRef/rowPhaseRef (no el valor cerrado del closure) porque esto
  // se llama desde el final de la animación de AimedShooter, que puede
  // resolver más tarde que el render en el que se armó este callback.
  const commitShot = useCallback(
    (landed: GridPos, value: CellValue) => {
      if (gameOver) return;
      const grid = gridRef.current;

      const target = resolveActualLanding(grid, landed, rowPhaseRef.current);
      if (!target) {
        playErrorSound();
        return;
      }

      const withNew = grid.map((r) => [...r]);
      withNew[target.r][target.c] = value;

      const result = fruitsEngine.resolveLanding(withNew, target, rowPhaseRef.current);
      if (result.popped.length > 0) {
        setClearsCount((c) => c + 1);
        setFruitHighlight((h) => Math.max(h, result.popped.length));
        clearCellsAndSettle(withNew, result.popped, result.points, result.label);
      } else {
        playSuccessSound();
        setGrid(withNew);
      }

      setNextValue(fruitsEngine.randomValue());
    },
    [gameOver],
  );

  // Letras/números: disparar solo PEGA la burbuja — ya no se detecta sola
  // ninguna palabra/suma. El jugador arma a mano qué borrar recorriendo
  // el tablero (ver usePathSelection) y lo confirma con clearWordPath /
  // clearNumberPath.
  const placeValue = useCallback(
    (landed: GridPos, value: CellValue) => {
      if (gameOver) return;
      const grid = gridRef.current;
      const target = resolveActualLanding(grid, landed, rowPhaseRef.current);
      if (!target) {
        playErrorSound();
        return;
      }
      const withNew = grid.map((r) => [...r]);
      withNew[target.r][target.c] = value;
      setGrid(withNew);
      if (isNumbers) setNextValue(randDigit());
    },
    [gameOver, isNumbers],
  );

  // Confirma (o rechaza) el camino que el jugador recorrió a mano sobre
  // el tablero — `valid`/`word` ya vienen calculados por usePathSelection
  // (misma lógica de isValidWord, sin duplicarla).
  const clearWordPath = useCallback(
    (path: GridPos[], valid: boolean, word: string) => {
      if (gameOver) return;
      if (!valid) {
        playErrorSound();
        return;
      }
      setFoundWords((words) => [...words, word]);
      clearCellsAndSettle(gridRef.current, path, scoreForWord(word.length), word);
    },
    [gameOver],
  );

  // Números: a diferencia de palabras, acá sí hace falta recalcular la
  // suma (no alcanza con lo que ya evaluó usePathSelection) para saber si
  // esta jugada sube la meta — sube SOLO si la suma es exactamente
  // piso+1; sumar el piso de nuevo es válido (no se rechaza) pero no la
  // sube, mismo criterio que el fix de encastraloReact.
  const clearNumberPath = useCallback(
    (path: GridPos[], valid: boolean) => {
      if (gameOver) return;
      if (!valid) {
        playErrorSound();
        return;
      }
      const grid = gridRef.current;
      const sum = path.reduce((acc, { r, c }) => acc + (grid[r][c] as number), 0);
      const floor = numberFloorRef.current;
      const isNewGoal = sum === floor + 1;
      const basePoints = sumScore(path.length) + (isNewGoal ? NUMBER_GOAL_BONUS_PER_SUM * (floor + 1) : 0);
      if (isNewGoal) setNumberFloor((f) => f + 1);
      setClearsCount((c) => c + 1);
      clearCellsAndSettle(grid, path, basePoints, isNewGoal ? `¡Meta ${floor + 1}!` : `Σ ${sum}`);
    },
    [gameOver],
  );

  // Recompensa del rewarded de game over: a diferencia de Encastralo (que
  // suma tiempo), acá no hay reloj — lo que ahoga al jugador es la presión
  // de filas, así que la recompensa libera espacio de verdad: borra las 2
  // filas más pegadas al disparador (las últimas del array, ver grid.ts) y
  // reanuda la misma partida.
  function reviveByClearingBottomRows(rows: number) {
    setGrid((prev) =>
      prev.map((row, r) => (r >= VISIBLE_ROWS - rows ? row.map(() => null) : row)),
    );
    setGameOver(false);
    setProgress(0);
  }

  function restart() {
    setGrid(initialGrid(rollInitial, INITIAL_ROWS));
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setProgress(0);
    setPopFeedback(null);
    setRowPhase(0);
    setNumberFloor(MIN_TARGET_SUM);
    setClearsCount(0);
    setFruitHighlight(0);
    setFoundWords([]);
    if (!isLetters) setNextValue(rollInitial());
  }

  function togglePause() {
    setPaused((p) => !p);
  }

  const cellLabel = useCallback((value: CellValue) => String(value), []);

  return {
    grid,
    score,
    gameOver,
    paused,
    togglePause,
    progress,
    popFeedback,
    nextValue,
    rowPhase,
    numberFloor,
    clearsCount,
    fruitHighlight,
    foundWords,
    isLetters,
    isNumbers,
    isSwipeVariant,
    cellLabel,
    commitShot,
    placeValue,
    clearWordPath,
    clearNumberPath,
    restart,
    reviveByClearingBottomRows,
  };
}
