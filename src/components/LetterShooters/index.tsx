import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AimedShooter from "../AimedShooter";
import { getConsonantList, getVowelList } from "../../game/variants/words/words";
import { Grid, GridPos } from "../../game/types";
import { SupportedLanguage } from "../../i18n/translations";
import { ACCENT } from "../boardLayout";

interface HitArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface LetterShooterUnitProps {
  label: string;
  getList: (lang: SupportedLanguage) => string[];
  language: SupportedLanguage;
  grid: Grid;
  originX: number;
  originY: number;
  hitArea: HitArea;
  rowPhase: number;
  onFired: (landing: GridPos, letter: string) => void;
  disabled?: boolean;
}

// Carrusel de letras: el jugador elige cuál disparar (a diferencia de
// frutas, que sale al azar sin elección). La lista es la COMPLETA del
// pool (todas las vocales / todas las consonantes del diccionario), no
// una muestra al azar — si fuera una muestra chica, dando vueltas con las
// flechas nunca ibas a llegar a la letra que buscabas.
function LetterShooterUnit({ label, getList, language, grid, originX, originY, hitArea, rowPhase, onFired, disabled }: LetterShooterUnitProps) {
  const [list] = useState<string[]>(() => getList(language));
  const [index, setIndex] = useState(0);

  function cycle(delta: number) {
    setIndex((i) => (i + delta + list.length) % list.length);
  }

  return (
    <>
      <Box sx={{
        position: "absolute", left: originX, top: originY - 36,
        transform: "translateX(-50%)",
        fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.75)",
        textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap",
      }}>
        {label}
      </Box>

      <AimedShooter
        grid={grid}
        originX={originX}
        originY={originY}
        value={list[index]}
        cellLabel={(v) => String(v)}
        onFired={(landing, value) => onFired(landing, value as string)}
        hitArea={hitArea}
        rowPhase={rowPhase}
        disabled={disabled}
      />

      {/* zIndex por encima del área táctil (grande a propósito) del
          disparador, para que estas flechas sigan recibiendo su propio
          click sin importar el orden del DOM. Bien separadas de la
          burbuja (antes quedaban a 2px del borde): un toque un poco
          desviado buscando cambiar de letra terminaba disparando sin
          querer. */}
      <IconButton
        onClick={() => cycle(-1)}
        disabled={disabled}
        aria-label={`${label}: letra anterior`}
        sx={{ position: "absolute", left: originX - 68, top: originY - 18, width: 36, height: 36, color: ACCENT, zIndex: 2 }}
      >
        <ChevronLeftIcon fontSize="medium" />
      </IconButton>
      <IconButton
        onClick={() => cycle(1)}
        disabled={disabled}
        aria-label={`${label}: letra siguiente`}
        sx={{ position: "absolute", left: originX + 32, top: originY - 18, width: 36, height: 36, color: ACCENT, zIndex: 2 }}
      >
        <ChevronRightIcon fontSize="medium" />
      </IconButton>
    </>
  );
}

interface LetterShootersProps {
  grid: Grid;
  originY: number;
  positionsX: [number, number];
  hitAreas: [HitArea, HitArea];
  rowPhase: number;
  language: SupportedLanguage;
  vowelsLabel: string;
  consonantsLabel: string;
  onShootVowel: (landing: GridPos, letter: string) => void;
  onShootConsonant: (landing: GridPos, letter: string) => void;
  disabled?: boolean;
}

// Dos disparadores independientes (pedido explícito), uno al lado del
// otro en el mismo renglón.
export default function LetterShooters({ grid, originY, positionsX, hitAreas, rowPhase, language, vowelsLabel, consonantsLabel, onShootVowel, onShootConsonant, disabled }: LetterShootersProps) {
  return (
    <>
      <LetterShooterUnit
        label={vowelsLabel}
        getList={getVowelList}
        language={language}
        grid={grid}
        originX={positionsX[0]}
        originY={originY}
        hitArea={hitAreas[0]}
        rowPhase={rowPhase}
        onFired={onShootVowel}
        disabled={disabled}
      />
      <LetterShooterUnit
        label={consonantsLabel}
        getList={getConsonantList}
        language={language}
        grid={grid}
        originX={positionsX[1]}
        originY={originY}
        hitArea={hitAreas[1]}
        rowPhase={rowPhase}
        onFired={onShootConsonant}
        disabled={disabled}
      />
    </>
  );
}
