import Box from "@mui/material/Box";
import { PathBadgeState } from "../../hooks/usePathSelection";

interface PathBadgeProps {
  badge: PathBadgeState | null;
}

// Etiqueta en vivo mientras se recorre el camino (la palabra que se está
// formando, o "Σ 11" en números) — verde si ya es válido (aunque el
// jugador siga agregando celdas), gris si todavía no. Mismo lenguaje
// visual que el resto del hub.
export default function PathBadge({ badge }: PathBadgeProps) {
  if (!badge) return null;
  return (
    <Box sx={{
      position: "absolute",
      left: badge.x,
      top: badge.y,
      transform: "translate(-50%, -100%)",
      backgroundColor: badge.valid ? "#22c55e" : "rgba(0,0,0,0.75)",
      color: "#fff",
      px: 1.5, py: 0.5,
      borderRadius: 999,
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
      pointerEvents: "none",
    }}>
      {badge.label}
    </Box>
  );
}
