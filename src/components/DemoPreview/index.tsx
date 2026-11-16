import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";

const ACCENT = "#e74c3c";
const CELL = 34;
const GAP = 4;

// 3 filas, grilla hexagonal real (la fila del medio corrida media celda,
// como el tablero de verdad) — la fila del medio arma "SOL" en las
// columnas 1-2-3; la columna 3 arranca vacía y la completa el disparo.
const FILLER: (string | null)[][] = [
  ["R", "A", "I", "R", "S"],
  ["P", "S", "O", null, "A"],
  ["J", "E", "N", "J", "M"],
];
const SHOT_ROW = 1;
const WORD_COLS = [1, 2, 3];
const SHOT_COL = 3;
const SHOT_LETTER = "L";
// Cuánto más abajo del tablero arranca la letra disparada — tiene que
// viajar y "chocar" contra la fila, no aparecer ya en su lugar.
const SHOT_TRAVEL_PX = 90;

type Phase = "idle" | "shooting" | "selecting" | "clearing";

// Animación corta (no son 3 variantes en miniatura): un ciclo completo de
// "disparás una letra que viaja y choca contra el tablero, se arma una
// palabra, la recorrés con el dedo y se borra" — las acciones reales de
// la modalidad letras, en loop, para la card de "Jugar" del Home.
export default function DemoPreview() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectCount, setSelectCount] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function schedule(fn: () => void, ms: number) {
      timeouts.current.push(setTimeout(fn, ms));
    }

    function run() {
      setPhase("idle");
      setSelectCount(0);
      schedule(() => setPhase("shooting"), 700);
      schedule(() => setPhase("selecting"), 1300);
      schedule(() => setSelectCount(1), 1300);
      schedule(() => setSelectCount(2), 1650);
      schedule(() => setSelectCount(3), 2000);
      schedule(() => setPhase("clearing"), 2400);
      schedule(run, 3400);
    }

    run();
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  const shotLanded = phase !== "idle";
  const clearing = phase === "clearing";

  function cellContent(r: number, c: number): string | null {
    if (r === SHOT_ROW && c === SHOT_COL) return shotLanded ? SHOT_LETTER : null;
    return FILLER[r][c];
  }

  function isSelected(r: number, c: number): boolean {
    if (phase !== "selecting" && phase !== "clearing") return false;
    if (r !== SHOT_ROW) return false;
    const idx = WORD_COLS.indexOf(c);
    return idx !== -1 && idx < selectCount;
  }

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", gap: `${GAP}px`, alignItems: "flex-start",
      "@media (prefers-reduced-motion: reduce)": { "& *": { transition: "none !important" } },
    }}>
      {FILLER.map((row, r) => (
        <Box key={r} sx={{ display: "flex", gap: `${GAP}px`, ml: r % 2 === 1 ? `${CELL / 2}px` : 0 }}>
          {row.map((_, c) => {
            const content = cellContent(r, c);
            const selected = isSelected(r, c);
            const isShotCell = r === SHOT_ROW && c === SHOT_COL;
            const hidden = isShotCell && phase === "idle";
            const fadingOut = clearing && selected;

            let transform = "translateY(0) scale(1)";
            if (hidden) transform = `translateY(${SHOT_TRAVEL_PX}px) scale(0.6)`;
            else if (fadingOut) transform = "translateY(0) scale(0.4)";
            else if (selected) transform = "translateY(0) scale(1.12)";

            return (
              <Box
                key={c}
                sx={{
                  width: CELL, height: CELL, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: CELL * 0.42,
                  backgroundColor: selected ? ACCENT : content ? "#fff" : "#fff3",
                  color: selected ? "#fff" : ACCENT,
                  boxShadow: content ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                  opacity: hidden || fadingOut ? 0 : 1,
                  transform,
                  // Sin transición en "idle": el reset de ciclo tiene que
                  // ser instantáneo (vuelve abajo de una), no una
                  // animación hacia atrás. Al pasar a "shooting" sí se
                  // anima — con "back out" (overshoot + asentamiento) para
                  // que se sienta como un choque real contra el tablero,
                  // no como que aparece flotando en su lugar.
                  transition: hidden ? "none" : "transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease",
                }}
              >
                {content ?? ""}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
