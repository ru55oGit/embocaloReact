import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";

const ACCENT = "#e74c3c";
const COLS = 6;
const ROWS = 4;
// Proporción del gap respecto a la celda (no un gap fijo en px) — así la
// grilla entera escala como un bloque, sin que el aire entre burbujas se
// vea desproporcionado en ningún tamaño.
const GAP_RATIO = 0.12;
// Ancho total necesario (en "celdas") para 6 columnas + sus gaps + el
// corrimiento de media celda que suma la fila impar en el peor caso.
const WIDTH_IN_CELLS = COLS + (COLS - 1) * GAP_RATIO + 0.5;
const MIN_CELL = 22;
const MAX_CELL = 56;

// 4 filas, grilla hexagonal real (las filas "impares" corridas media
// celda, como el tablero de verdad) — la ÚLTIMA fila (la más cerca del
// disparador) arma "SOL" en las columnas 1-2-3; la columna 3 arranca
// vacía y la completa el disparo. Tiene que ser la última fila, no una
// del medio: si no, la burbuja que sube parece atravesar una fila de
// abajo para llegar a esta, en vez de chocar contra la primera que
// encuentra.
const FILLER: (string | null)[][] = [
  ["R", "A", "I", "R", "S", "T"],
  ["J", "E", "N", "J", "M", "D"],
  ["Z", "Q", "W", "X", "Y", "K"],
  ["P", "S", "O", null, "A", "B"],
];
const SHOT_ROW = 3;
const WORD_COLS = [1, 2, 3];
const SHOT_COL = 3;
const SHOT_LETTER = "L";

type Phase = "idle" | "shooting" | "selecting" | "clearing";

// Un tamaño fijo en px nunca anda bien en los dos extremos a la vez: lo
// bastante chico para no desbordar un celular angosto se ve perdido en
// una tarjeta de escritorio mucho más ancha (el layout tope en 480px de
// Layout.tsx solo limita el MÁXIMO, no iguala mobile y desktop). Por eso
// esto mide su propio contenedor con un ResizeObserver y calcula el
// tamaño de celda a partir del ancho real disponible, en vez de usar un
// número fijo.
function useMeasuredWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// Animación corta (no son 3 variantes en miniatura): un ciclo completo de
// "disparás una letra que viaja y choca contra el tablero, se arma una
// palabra, la recorrés con el dedo y se borra" — las acciones reales de
// la modalidad letras, en loop, para la card de "Jugar" del Home.
export default function DemoPreview() {
  const [containerRef, containerWidth] = useMeasuredWidth();
  // 0.94 de margen de seguridad — sin esto, el redondeo de los cálculos
  // de abajo podía dejar la última columna pegada contra el borde.
  const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, (containerWidth * 0.94) / WIDTH_IN_CELLS)) || MIN_CELL;
  const gap = cell * GAP_RATIO;
  const shotTravelPx = cell * 2.5;

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
    <Box
      ref={containerRef}
      sx={{
        display: "flex", flexDirection: "column", gap: `${gap}px`, alignItems: "flex-start", width: "100%",
        "@media (prefers-reduced-motion: reduce)": { "& *": { transition: "none !important" } },
      }}
    >
      {FILLER.map((row, r) => (
        <Box key={r} sx={{ display: "flex", gap: `${gap}px`, ml: r % 2 === 1 ? `${cell / 2}px` : 0 }}>
          {row.map((_, c) => {
            const content = cellContent(r, c);
            const selected = isSelected(r, c);
            const isShotCell = r === SHOT_ROW && c === SHOT_COL;
            const hidden = isShotCell && phase === "idle";
            const fadingOut = clearing && selected;

            let transform = "translateY(0) scale(1)";
            if (hidden) transform = `translateY(${shotTravelPx}px) scale(0.6)`;
            else if (fadingOut) transform = "translateY(0) scale(0.4)";
            else if (selected) transform = "translateY(0) scale(1.12)";

            return (
              <Box
                key={c}
                sx={{
                  width: cell, height: cell, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: cell * 0.42,
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
