import Box from "@mui/material/Box";

const ACCENT = "#e74c3c";

interface ProgressBarProps {
  progress: number; // 0..1, cuánto falta para que baje el techo
  critical?: boolean;
}

// Se VACÍA a medida que se acerca la bajada de techo (no se llena) —
// mismo lenguaje visual que el reloj de Encastralo: arranca llena y se
// consume, para que se sienta como presión de tiempo real, no como una
// carga que progresa hacia algo bueno.
export default function ProgressBar({ progress, critical }: ProgressBarProps) {
  const pct = (1 - Math.max(0, Math.min(1, progress))) * 100;
  return (
    <Box sx={{ width: "100%", maxWidth: 320, height: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.25)", overflow: "hidden" }}>
      <Box sx={{
        height: "100%", width: `${pct}%`,
        backgroundColor: critical ? ACCENT : "#fff",
        transition: "width 0.1s linear, background-color 0.3s ease",
      }} />
    </Box>
  );
}
