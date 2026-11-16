import { RefObject } from "react";
import Box from "@mui/material/Box";
import { CellValue, Grid, GridPos } from "../../game/types";
import { BOARD_HEIGHT, BOARD_WIDTH, CELL_SIZE, cellCenter } from "../../game/hex";
import { ACCENT } from "../boardLayout";

interface BoardProps {
  grid: Grid;
  cellLabel: (value: CellValue) => string;
  // Ver hex.ts — sin esto, después de que baja el techo las burbujas
  // existentes se dibujan medio casillero corridas de su posición real.
  rowPhase: number;
  // Solo letras: ref para el hit-testing de useWordPathSelection, el
  // handler que arranca un arrastre, y qué celdas resaltar mientras se
  // recorre el camino.
  boardRef?: RefObject<HTMLDivElement>;
  onPointerDown?: (e: React.PointerEvent) => void;
  selectedCells?: GridPos[];
}

function isSelected(selected: GridPos[] | undefined, r: number, c: number): boolean {
  return !!selected?.some((p) => p.r === r && p.c === c);
}

// Posicionamiento absoluto (no CSS Grid): en una grilla hexagonal las
// filas pares/impares están corridas media celda, algo que CSS Grid no
// puede expresar — cada burbuja se ubica por su propio cellCenter(r,c).
export default function Board({ grid, cellLabel, rowPhase, boardRef, onPointerDown, selectedCells }: BoardProps) {
  return (
    <Box
      ref={boardRef}
      onPointerDown={onPointerDown}
      sx={{
        position: "relative",
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        touchAction: onPointerDown ? "none" : undefined,
      }}
    >
      {grid.map((row, r) =>
        row.map((value, c) => {
          const { x, y } = cellCenter(r, c, rowPhase);
          const selected = isSelected(selectedCells, r, c);
          return (
            <Box
              key={`${r}-${c}`}
              sx={{
                position: "absolute",
                left: x - CELL_SIZE / 2,
                top: y - CELL_SIZE / 2,
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 15,
                backgroundColor: value === null ? "#eef0f3" : selected ? ACCENT : "#fff",
                color: selected ? "#fff" : ACCENT,
                boxShadow: value !== null ? "0 2px 4px rgba(0,0,0,0.25)" : "inset 0 0 0 1px #dfe3e8",
                transition: "background-color 0.1s ease, color 0.1s ease",
                // El hit-testing de useWordPathSelection hace su propia
                // cuenta en base a coordenadas crudas, no a qué celda del
                // DOM quedó debajo del dedo — así el pointerdown siempre
                // llega al contenedor sin importar sobre qué burbuja caiga.
                pointerEvents: "none",
              }}
            >
              {value !== null ? cellLabel(value) : ""}
            </Box>
          );
        }),
      )}
    </Box>
  );
}
