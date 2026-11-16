import Box from "@mui/material/Box";
import { Variant } from "../../game/types";

const FRUITS = ["🍎", "🍌", "🍇", "🍊", "🍓", "🍍"];
const COLS = 3;
const ROWS = 3;

// Mini preview estática por variante — no es el tablero hex real (sería
// carísimo montar toda la física/geometría solo para una card del Home),
// una fila de burbujitas de colores alcanza para transmitir "de esto va
// esta modalidad" de un vistazo.
function Bubble({ children, bg, size }: { children: React.ReactNode; bg: string; size: number }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: bg, color: "#fff", fontWeight: 800, fontSize: size * 0.5,
      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)",
    }}>
      {children}
    </Box>
  );
}

interface CategoryPreviewProps {
  variant: Variant;
  // Diámetro de cada burbuja en px — 26 por default (card de categoría),
  // más chico en la card de "Récord" (ver Home.tsx) para que no compita
  // con el puntaje grande al lado.
  size?: number;
}

export default function CategoryPreview({ variant, size = 26 }: CategoryPreviewProps) {
  const cells = Array.from({ length: ROWS * COLS }, (_, i) => i);
  const gap = Math.round(size * 0.15);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: `${gap}px`, alignItems: "center" }}>
      {Array.from({ length: ROWS }, (_, r) => (
        <Box key={r} sx={{ display: "flex", gap: `${gap}px` }}>
          {cells.slice(r * COLS, r * COLS + COLS).map((i) => {
            if (variant === "fruits") {
              return <Bubble key={i} bg="#fff2" size={size}>{FRUITS[(i + r) % FRUITS.length]}</Bubble>;
            }
            if (variant === "numbers") {
              const n = ((i + r * 3) % 9) + 1;
              return <Bubble key={i} bg="#2ecc71" size={size}>{n}</Bubble>;
            }
            const letters = "AEBSOLRTN";
            return <Bubble key={i} bg="#3498db" size={size}>{letters[(i + r * 2) % letters.length]}</Bubble>;
          })}
        </Box>
      ))}
    </Box>
  );
}
