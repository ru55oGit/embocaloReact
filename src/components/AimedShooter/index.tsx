import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { CELL_SIZE, cellCenter } from "../../game/hex";
import { FlightPoint, simulateFlight } from "../../game/trajectory";
import { CellValue, Grid, GridPos } from "../../game/types";
import { playErrorSound } from "../../utils/sound";
import { ACCENT } from "../boardLayout";

// No más tirar a una columna tocando un botón: se arrastra para apuntar
// (línea guía punteada, como el bubble-shooter de referencia) y se suelta
// para disparar — la bolita viaja de verdad, rebota en los bordes y se
// pega a la primera burbuja que encuentra.
const MAX_ANGLE_RAD = (75 * Math.PI) / 180;
// Por debajo de este arrastre (en px), se considera "no movió" y dispara
// derecho — sin esto, tocar casi sin mover el dedo cae en el caso límite
// de atan2(0, -0) (que en JS da π, no 0) y el tiro salía para cualquier
// lado en vez de derecho hacia arriba.
const MIN_DRAG_PX = 6;
// El dedo tapa el origen de la línea mientras se apunta — si es corta
// (70px), queda escondida justo debajo del dedo y no se nota que hay una
// guía. Bien larga, el tramo de arriba siempre asoma por fuera del dedo.
const AIM_LINE_LENGTH = 140;
const FLIGHT_DURATION_MS = 420;

interface HitArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface AimedShooterProps {
  grid: Grid;
  originX: number;
  originY: number;
  value: CellValue;
  cellLabel: (value: CellValue) => string;
  onFired: (landing: GridPos, value: CellValue) => void;
  // Área táctil real para empezar a apuntar — mucho más grande que la
  // burbuja decorativa del lanzador (antes el área clickeable era un
  // círculo de 44px nomás, muy fácil de no encontrar).
  hitArea: HitArea;
  // Ver hex.ts — necesario para que simulateFlight choque exactamente
  // contra lo que se ve dibujado, no contra una paridad vieja.
  rowPhase: number;
  disabled?: boolean;
}

export default function AimedShooter({ grid, originX, originY, value, cellLabel, onFired, hitArea, rowPhase, disabled }: AimedShooterProps) {
  const [aimAngle, setAimAngle] = useState<number | null>(null);
  const [flight, setFlight] = useState<{ path: FlightPoint[]; value: CellValue; landing: GridPos } | null>(null);
  const [ballPoint, setBallPoint] = useState<FlightPoint | null>(null);
  const hitAreaRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  // El origen del disparo (originX/originY) está en las mismas coordenadas
  // "de contenedor" que hitArea — usamos el rect real del área táctil en
  // pantalla para convertir el toque (en coordenadas de pantalla) a esas
  // mismas coordenadas de contenedor, sin depender de otro elemento.
  const computeAngle = useCallback(
    (clientX: number, clientY: number): number => {
      const el = hitAreaRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const originScreenX = rect.left - hitArea.left + originX;
      const originScreenY = rect.top - hitArea.top + originY;
      const dx = clientX - originScreenX;
      const dy = clientY - originScreenY;
      if (Math.hypot(dx, dy) < MIN_DRAG_PX) return 0;
      const raw = Math.atan2(dx, -dy);
      return Math.max(-MAX_ANGLE_RAD, Math.min(MAX_ANGLE_RAD, raw));
    },
    [hitArea, originX, originY],
  );

  const fire = useCallback(
    (angle: number) => {
      const result = simulateFlight(grid, originX, originY, angle, rowPhase);
      if (!result.landing) {
        playErrorSound();
        return;
      }
      // El camino simulado termina en el punto de COLISIÓN (pegada contra
      // el vecino), no en el centro de la celda donde en realidad va a
      // quedar la burbuja — sin este último punto, la animación "choca" en
      // un lugar y la fruta de verdad aparece en otro (centro de celda)
      // apenas un pelo corrido, lo que se ve como que la bolita desaparece
      // en vez de quedar pegada.
      const restingPoint = cellCenter(result.landing.r, result.landing.c, rowPhase);
      setFlight({ path: [...result.path, restingPoint], value, landing: result.landing });
    },
    [grid, originX, originY, value, rowPhase],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const angle = computeAngle(e.clientX, e.clientY);
      angleRef.current = angle;
      setAimAngle(angle);
    },
    [computeAngle],
  );

  const handlePointerUp = useCallback(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    setAimAngle(null);
    fire(angleRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePointerMove, fire]);

  function handlePointerDown(e: React.PointerEvent) {
    if (disabled || flight) return;
    e.preventDefault();
    const angle = computeAngle(e.clientX, e.clientY);
    angleRef.current = angle;
    setAimAngle(angle);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  // Anima la bolita a lo largo del camino simulado — recién cuando termina
  // se confirma el aterrizaje contra el estado real del juego, para que la
  // animación y la lógica no se pisen.
  useEffect(() => {
    if (!flight) return;
    let raf = 0;
    const start = performance.now();
    const totalPoints = flight.path.length;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / FLIGHT_DURATION_MS);
      const index = Math.min(totalPoints - 1, Math.floor(t * totalPoints));
      setBallPoint(flight!.path[index]);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setBallPoint(null);
        onFired(flight!.landing, flight!.value);
        setFlight(null);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight]);

  const angleDeg = aimAngle !== null ? (aimAngle * 180) / Math.PI : 0;
  const firing = flight !== null;

  return (
    <>
      {/* Área táctil real — invisible, mucho más grande que la burbuja. */}
      <Box
        ref={hitAreaRef}
        onPointerDown={handlePointerDown}
        sx={{
          position: "absolute",
          left: hitArea.left, top: hitArea.top,
          width: hitArea.width, height: hitArea.height,
          // zIndex bajo y explícito: en el disparador de letras, esta área
          // (grande a propósito) comparte franja con los botones de
          // flecha del carrusel — sin esto, el orden del DOM podía dejarla
          // tapando el botón "anterior" y robándole el click.
          zIndex: 0,
          cursor: disabled || firing ? "default" : "grab",
          touchAction: "none",
        }}
      />

      {aimAngle !== null ? (
        <Box sx={{
          position: "absolute",
          left: originX - 1,
          top: originY - AIM_LINE_LENGTH,
          width: 2,
          height: AIM_LINE_LENGTH,
          backgroundImage: `linear-gradient(${ACCENT} 50%, transparent 50%)`,
          backgroundSize: "2px 10px",
          transformOrigin: "bottom center",
          transform: `rotate(${angleDeg}deg)`,
          pointerEvents: "none",
        }} />
      ) : (
        // Pista en reposo: sin esto no se nota que se puede apuntar —
        // una flechita que rebota suavecito arriba de la burbuja, hasta
        // que el jugador empieza a arrastrar (ahí la reemplaza la línea
        // guía de arriba, con el ángulo real).
        !disabled && !firing && (
          <Box sx={{
            position: "absolute",
            left: originX,
            top: originY - 46,
            transform: "translateX(-50%)",
            color: ACCENT,
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1,
            pointerEvents: "none",
            animation: "embocalo-aim-hint 1.4s ease-in-out infinite",
            "@keyframes embocalo-aim-hint": {
              "0%, 100%": { transform: "translateX(-50%) translateY(0)", opacity: 0.55 },
              "50%": { transform: "translateX(-50%) translateY(-6px)", opacity: 1 },
            },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}>
            ↑
          </Box>
        )
      )}

      {ballPoint && (
        <Box sx={{
          position: "absolute",
          left: ballPoint.x - CELL_SIZE / 2,
          top: ballPoint.y - CELL_SIZE / 2,
          width: CELL_SIZE, height: CELL_SIZE,
          borderRadius: "50%",
          backgroundColor: "#fff", color: ACCENT,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15,
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          pointerEvents: "none",
        }}>
          {cellLabel(value)}
        </Box>
      )}

      <Box sx={{
        position: "absolute",
        left: originX - 22,
        top: originY - 22,
        width: 44, height: 44,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: disabled || firing ? "rgba(255,255,255,0.5)" : "#fff",
        color: ACCENT, fontWeight: 800, fontSize: 18,
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        pointerEvents: "none",
      }}>
        {firing ? "" : cellLabel(value)}
      </Box>
    </>
  );
}
