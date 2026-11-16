import { useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Board from "../Board";
import AimedShooter from "../AimedShooter";
import LetterShooters from "../LetterShooters";
import ProgressBar from "../ProgressBar";
import PathBadge from "../PathBadge";
import { useEmbocaloGame } from "../../hooks/useEmbocaloGame";
import { PathEvaluator, usePathSelection } from "../../hooks/usePathSelection";
import { isValidWord } from "../../game/variants/words/words";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../../game/hex";
import { CellValue, Variant } from "../../game/types";
import { SupportedLanguage, Translation } from "../../i18n/translations";

// Altura extra debajo del tablero para los disparadores — un solo
// renglón: frutas/números tienen uno solo, letras tiene dos pero van lado
// a lado (no apilados), así que comparten el mismo renglón.
const SHOOTER_MARGIN = 40;
const SHOOTER_AREA_HEIGHT = SHOOTER_MARGIN + 40;

// Mismo criterio visual que el resto del hub (Encastralo incluido): el
// área de juego vive dentro de una tarjeta blanca, no flotando sobre el
// degradé rojo — PAD se suma al tamaño de afuera (no se lo resta al de
// adentro) para que Board y los disparadores seguir usando exactamente
// las mismas coordenadas en px (cellCenter de game/hex.ts) sin recalcular
// nada: el padding de la tarjeta ES el origen (0,0) de esa cuenta.
const PAD = 10;

interface GameBoardProps {
  variant: Variant;
  language: SupportedLanguage;
  t: Translation;
  game: ReturnType<typeof useEmbocaloGame>;
}

// Playfield puro (tablero + disparador(es) + progreso) — sin header de
// puntaje ni pantalla de game over, eso vive un nivel arriba en
// src/pages/game.tsx (mismo reparto que encastraloReact: el tablero no
// decide cuándo terminó la partida, solo la dibuja).
export default function GameBoard({ variant, language, t, game }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  const wordEvaluate: PathEvaluator = (values) => {
    const word = values.join("");
    return { label: word, valid: isValidWord(word, language) };
  };

  // Números: la ventana habilitada cambia con el piso de la meta, así que
  // este evaluate se recrea cada render con el valor más fresco — el
  // hook lo guarda en un ref internamente, no hace falta memoizarlo acá.
  const numberEvaluate: PathEvaluator = (values) => {
    const sum = (values as number[]).reduce((s, v) => s + v, 0);
    const valid = sum === game.numberFloor || sum === game.numberFloor + 1;
    return { label: `Σ ${sum}`, valid };
  };

  const { path, badge, handlePointerDown } = usePathSelection({
    boardRef,
    grid: game.grid,
    rowPhase: game.rowPhase,
    evaluate: game.isNumbers ? numberEvaluate : wordEvaluate,
    onResolved: (resolvedPath, valid, label) =>
      game.isNumbers ? game.clearNumberPath(resolvedPath, valid) : game.clearWordPath(resolvedPath, valid, label),
  });

  const hintText = game.isNumbers ? t.hintNumbers(game.numberFloor) : game.isLetters ? t.hintLetters : t.hintFruits;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, width: "100%" }}>
      <ProgressBar progress={game.progress} />
      <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 13, textAlign: "center", px: 2 }}>{hintText}</Typography>

      {/* Tablero + disparador(es) comparten el mismo sistema de
          coordenadas en píxeles (cellCenter de game/hex.ts) — por eso van
          todos adentro del mismo contenedor position:relative, no en
          cajas separadas. La tarjeta blanca (mismo criterio que el resto
          del hub) es puramente visual: el padding ya corre el origen de
          ese sistema de coordenadas, no hace falta tocar BOARD_WIDTH ni
          ninguna cuenta de hex.ts. */}
      <Box sx={{
        position: "relative",
        width: BOARD_WIDTH + PAD * 2,
        height: BOARD_HEIGHT + SHOOTER_AREA_HEIGHT + PAD * 2,
        p: `${PAD}px`,
        boxSizing: "border-box",
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}>
        <Board
          grid={game.grid}
          cellLabel={game.cellLabel}
          rowPhase={game.rowPhase}
          boardRef={game.isSwipeVariant ? boardRef : undefined}
          onPointerDown={game.isSwipeVariant && !game.paused ? handlePointerDown : undefined}
          selectedCells={game.isSwipeVariant ? (path ?? undefined) : undefined}
        />

        {variant === "letters" ? (
          <LetterShooters
            grid={game.grid}
            originY={BOARD_HEIGHT + SHOOTER_MARGIN}
            positionsX={[BOARD_WIDTH * 0.26, BOARD_WIDTH * 0.74]}
            rowPhase={game.rowPhase}
            language={language}
            vowelsLabel={t.vowelsLabel}
            consonantsLabel={t.consonantsLabel}
            // Cada disparador se queda con su mitad (izquierda/derecha) de
            // toda la franja de disparo — igual que frutas/números, toda
            // esa franja es tocable, no solo la burbuja chica.
            hitAreas={[
              { left: 0, top: BOARD_HEIGHT, width: BOARD_WIDTH / 2, height: SHOOTER_AREA_HEIGHT },
              { left: BOARD_WIDTH / 2, top: BOARD_HEIGHT, width: BOARD_WIDTH / 2, height: SHOOTER_AREA_HEIGHT },
            ]}
            // Disparar solo pega la letra — ya no se detecta sola ninguna
            // palabra, eso lo hace el jugador a mano (ver arriba).
            onShootVowel={(landing, letter) => game.placeValue(landing, letter)}
            onShootConsonant={(landing, letter) => game.placeValue(landing, letter)}
            disabled={game.gameOver || game.paused}
          />
        ) : (
          <AimedShooter
            grid={game.grid}
            originX={BOARD_WIDTH / 2}
            originY={BOARD_HEIGHT + SHOOTER_MARGIN}
            value={game.nextValue}
            cellLabel={game.cellLabel}
            // Frutas explota sola al aterrizar (commitShot); números solo
            // se pega, el jugador suma a mano (placeValue).
            onFired={(landing, value: CellValue) =>
              game.isNumbers ? game.placeValue(landing, value) : game.commitShot(landing, value)
            }
            // Toda la zona de disparo es tocable (no solo la burbuja
            // chica) — más fácil de encontrar que un círculo de 44px.
            hitArea={{ left: 0, top: BOARD_HEIGHT, width: BOARD_WIDTH, height: SHOOTER_AREA_HEIGHT }}
            rowPhase={game.rowPhase}
            disabled={game.gameOver || game.paused}
          />
        )}

        {game.isSwipeVariant && <PathBadge badge={badge} />}

        {game.popFeedback && (
          <Box sx={{ position: "absolute", top: 0, left: 0, width: BOARD_WIDTH, height: BOARD_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <Typography sx={{
              backgroundColor: "#22c55e", color: "#fff", px: 2, py: 1, borderRadius: 999,
              fontWeight: 800, fontSize: 20, boxShadow: "0 6px 16px rgba(0,0,0,0.3)", textAlign: "center",
            }}>
              {game.popFeedback.label ?? `+${game.popFeedback.points}`}
            </Typography>
          </Box>
        )}

        {game.paused && (
          <Box sx={{
            position: "absolute", inset: `${PAD}px`, zIndex: 3, borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}>
            <Typography sx={{ fontFamily: "Lobster, cursive", fontSize: 32, color: "#e74c3c" }}>
              {t.pausedOverlayTitle}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
