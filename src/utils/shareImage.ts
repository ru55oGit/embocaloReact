// Redibuja el récord en un canvas para compartirlo como imagen real
// (navigator.share({ files: [...] })) — no un link de texto plano. No se
// clona el DOM real: los estilos de MUI no viajan a un canvas de forma
// confiable entre navegadores, mismo criterio que el resto del hub (ver
// shareImage.ts de encastraloReact/enroscaloReact/imaginaloReact/etc).

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Mismo degradé que el fondo de toda la app (ver Layout/index.tsx).
const BG_GRADIENT_FROM = "#a34747";
const BG_GRADIENT_TO = "#F44336";
const COLOR_WHITE = "#ffffff";
const COLOR_MUTED = "rgba(255, 255, 255, 0.65)";
const ACCENT = "#e74c3c";
const CARD_LABEL_COLOR = "#888888";

// Textos ya traducidos por el caller (t.recordTitle, t.recordScoreCaption,
// etc.) — esta función no sabe de idiomas, solo dibuja.
export interface EmbocaloRecordShareData {
  title: string; // ej "Récord"
  scoreValue: string; // ej "6825"
  captions: string[]; // líneas ya formateadas
  wordsSectionLabel?: string; // ej "PALABRAS ENCONTRADAS (8)" — si falta, no se dibuja la card
  words: string[];
}

export async function buildEmbocaloRecordPngFile(
  data: EmbocaloRecordShareData,
  filename: string,
): Promise<File | null> {
  const width = 560;
  const padding = 28;
  const chipHeight = 34;
  const chipGapX = 8;
  const chipGapY = 8;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const hasWords = data.words.length > 0 && Boolean(data.wordsSectionLabel);

  // Primera pasada: medir filas de chips (palabras del récord).
  ctx.font = "bold 14px monospace";
  const maxRowWidth = width - padding * 2;
  const chips = data.words.map((w) => {
    const label = w.toUpperCase();
    return { label, width: ctx.measureText(label).width + 24 };
  });
  const rows: { label: string; width: number }[][] = [];
  let currentRow: typeof chips = [];
  let currentRowWidth = 0;
  for (const chip of chips) {
    const needed = currentRow.length === 0 ? chip.width : currentRowWidth + chipGapX + chip.width;
    if (needed > maxRowWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [chip];
      currentRowWidth = chip.width;
    } else {
      currentRow.push(chip);
      currentRowWidth = needed;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);
  const rowsHeight = Math.max(rows.length, 1) * (chipHeight + chipGapY);

  const captionsTop = 200;
  const captionLineHeight = 22;
  const captionsBottom = captionsTop + data.captions.length * captionLineHeight;

  const cardInset = 16;
  const cardTop = captionsBottom + 16;
  const chipsHeaderY = cardTop + 40;
  const cardBottomNatural = hasWords ? chipsHeaderY + rowsHeight + 16 : captionsBottom + 24;
  const height = Math.max(width, cardBottomNatural + 20);
  const cardBottom = hasWords ? height - 20 : cardBottomNatural;

  canvas.width = width;
  canvas.height = height;

  // Fondo: degradé de marca, sin bordes redondeados (si no, las esquinas
  // fuera del redondeo quedan transparentes y muchos visores las muestran
  // blancas).
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, BG_GRADIENT_FROM);
  gradient.addColorStop(1, BG_GRADIENT_TO);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // URL de marca.
  ctx.fillStyle = COLOR_WHITE;
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("www.embocalo.com", width / 2, 50);

  // Título ("Récord"/"Best run"/etc).
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(data.title, width / 2, 92);

  // Puntaje grande.
  ctx.font = "bold 64px sans-serif";
  ctx.fillText(data.scoreValue, width / 2, 158);

  // Líneas de detalle.
  ctx.font = "600 15px sans-serif";
  ctx.fillStyle = COLOR_MUTED;
  data.captions.forEach((caption, i) => {
    ctx.fillText(caption, width / 2, captionsTop + i * captionLineHeight);
  });

  if (hasWords && data.wordsSectionLabel) {
    // Card blanca detrás de la lista de palabras.
    ctx.fillStyle = COLOR_WHITE;
    roundRectPath(ctx, cardInset, cardTop, width - cardInset * 2, cardBottom - cardTop, 16);
    ctx.fill();

    ctx.fillStyle = CARD_LABEL_COLOR;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(data.wordsSectionLabel, padding, chipsHeaderY - 20);

    ctx.font = "bold 14px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let y = chipsHeaderY;
    for (const row of rows) {
      let x = padding;
      for (const chip of row) {
        ctx.fillStyle = "rgba(231, 76, 60, 0.1)";
        roundRectPath(ctx, x, y, chip.width, chipHeight, 6);
        ctx.fill();
        ctx.strokeStyle = "rgba(231, 76, 60, 0.35)";
        ctx.lineWidth = 1;
        roundRectPath(ctx, x, y, chip.width, chipHeight, 6);
        ctx.stroke();

        ctx.fillStyle = ACCENT;
        ctx.fillText(chip.label, x + 12, y + chipHeight / 2 + 1);

        x += chip.width + chipGapX;
      }
      y += chipHeight + chipGapY;
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;

  return new File([blob], filename, { type: "image/png" });
}
