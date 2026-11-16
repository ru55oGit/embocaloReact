import Box from "@mui/material/Box";

interface ProgressBarProps {
  progress: number; // 0..1
}

// Cuando llega a 1, el hook baja el techo y la reinicia — mismo lenguaje
// visual que la barra del reloj de Encastralo.
export default function ProgressBar({ progress }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <Box sx={{ width: "100%", maxWidth: 320, height: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.25)", overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${pct}%`, backgroundColor: "#fff", transition: "width 0.1s linear" }} />
    </Box>
  );
}
