import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Layout from "../components/Layout";
import GameBoard from "../components/GameBoard";
import GoalsCard from "../components/GoalsCard";
import FoundWordsList from "../components/FoundWordsList";
import HouseAdBanner from "../ads/HouseAdBanner";
import RewardedAdModal from "../ads/RewardedAdModal";
import { useRewardedAd } from "../ads/useRewardedAd";
import { useEmbocaloGame } from "../hooks/useEmbocaloGame";
import { NUMBER_GOAL_THRESHOLDS, rollingGoalWindow } from "../game/constants";
import { scoreForWord } from "../game/variants/words/words";
import { Variant } from "../game/types";
import { useLanguage } from "../i18n/LanguageContext";
import { track } from "../lib/analytics";
import { recordLastPlayed } from "../utils/lastPlayedState";
import { getBest } from "../utils/storage";
import { maybeSaveVariantRecord } from "../utils/variantRecordState";
import { maybeSaveWordsRecord } from "../utils/wordsRecordState";

const ACCENT = "#e74c3c";

const VARIANT_EMOJI: Record<Variant, string> = {
  fruits: "🍎",
  numbers: "🔢",
  letters: "🔤",
};

// Letras es la modalidad principal (pedido explícito) — cualquier entrada
// sin variante reconocible (el link "Jugar" del drawer, un link suelto)
// cae ahí, no a frutas.
function parseVariant(value: string | null): Variant {
  return value === "numbers" || value === "fruits" ? value : "letters";
}

// "Las últimas 2 filas antes del disparador" — ver reviveByClearingBottomRows
// en useEmbocaloGame. Mismo valor para las 3 variantes.
const REVIVE_ROWS = 2;

export default function Game() {
  const [searchParams] = useSearchParams();
  const variant = parseVariant(searchParams.get("variant"));
  // key por variante: si el jugador navega de una modalidad a otra sin
  // volver al Home (ej. deep-link nuevo), arranca una partida nueva en vez
  // de reusar el hook con estado de la modalidad anterior.
  return <GamePlaying key={variant} variant={variant} />;
}

function GamePlaying({ variant }: { variant: Variant }) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const game = useEmbocaloGame(variant, currentLanguage);

  // Letras guarda un "mejor puntaje" por idioma (el diccionario cambia
  // por completo entre es/en/pt) — frutas/números no dependen del idioma.
  const bestScope = variant === "letters" ? currentLanguage : undefined;
  const initialBestRef = useRef(getBest(variant, bestScope));
  const gameStartedAtRef = useRef(Date.now());
  const trackedGameOverRef = useRef(false);

  useEffect(() => {
    recordLastPlayed();
    track("game_start", { variant });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (game.gameOver && !trackedGameOverRef.current) {
      trackedGameOverRef.current = true;
      const durationSec = Math.round((Date.now() - gameStartedAtRef.current) / 1000);
      track("game_over", { variant, score: game.score, duration_sec: durationSec });
      if (variant === "letters") {
        maybeSaveWordsRecord(game.score, game.foundWords, currentLanguage);
      } else if (variant === "numbers") {
        maybeSaveVariantRecord("numbers", game.score, game.numberFloor, game.clearsCount);
      } else {
        maybeSaveVariantRecord("fruits", game.score, game.fruitHighlight, game.clearsCount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameOver, game.score]);

  // Recompensa del rewarded de game over: a diferencia del tiempo de
  // Encastralo, acá "revivir" es hacer lugar de verdad — ver
  // reviveByClearingBottomRows en el hook.
  const grantRevive = () => {
    game.reviveByClearingBottomRows(REVIVE_ROWS);
    trackedGameOverRef.current = false;
  };

  const {
    adCreative,
    showingAd,
    canShowAd,
    loadingAd,
    canConfirmReward,
    secondsUntilCanConfirm,
    requestAd,
    handleAdWatched,
    handleAdSkipped,
    handleImageClick,
  } = useRewardedAd("embocalo-gameover-rewarded", "embocalo", currentLanguage, grantRevive, "clear_board");

  function handleRestart() {
    trackedGameOverRef.current = false;
    gameStartedAtRef.current = Date.now();
    initialBestRef.current = getBest(variant, bestScope);
    game.restart();
    track("game_start", { variant });
  }

  if (game.gameOver) {
    const isNewBest = game.score > 0 && game.score >= initialBestRef.current;
    return (
      <Layout onBack={() => navigate("/")}>
        <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 52 }}>{VARIANT_EMOJI[variant]}</Typography>
            <Typography sx={{ fontFamily: "Lobster, cursive", fontSize: 26, color: "#222", textAlign: "center" }}>
              {t.gameOverTitle}
            </Typography>
            <Typography sx={{ color: "#666", fontSize: 16 }}>{t.gameOverBody(game.score)}</Typography>
            {isNewBest && (
              <Typography sx={{ color: ACCENT, fontWeight: 800, fontSize: 15 }}>{t.newBestLabel}</Typography>
            )}
          </Box>

          <Button
            onClick={requestAd}
            disabled={!canShowAd}
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#f0b429", color: "#1a1a1a", fontWeight: 800, fontSize: 16,
              py: 1.4, borderRadius: 999, textTransform: "none",
              "&:hover": { backgroundColor: "#d99f1a" },
              "&.Mui-disabled": { backgroundColor: "rgba(240,180,41,0.35)", color: "rgba(26,26,26,0.5)" },
            }}
          >
            {loadingAd ? "..." : t.continueWithAdButton}
          </Button>

          <Button onClick={handleRestart} variant="contained" size="large" sx={{
            backgroundColor: "#fff", color: ACCENT, fontWeight: 800, fontSize: 18,
            py: 1.6, borderRadius: 999, textTransform: "none",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.35), 0 10px 24px rgba(0,0,0,0.4)",
          }}>
            {t.playAgainButton}
          </Button>
          <Button onClick={() => navigate("/")} sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
            {t.backToHomeButton}
          </Button>

          <HouseAdBanner slot="embocalo-gameover-banner" gameSlug="embocalo" locale={currentLanguage} />
        </Box>

        <RewardedAdModal
          locale={currentLanguage}
          open={showingAd}
          adCreative={adCreative}
          canConfirmReward={canConfirmReward}
          secondsUntilCanConfirm={secondsUntilCanConfirm}
          onConfirm={handleAdWatched}
          onSkip={handleAdSkipped}
          onImageClick={handleImageClick}
          confirmLabel={t.rewardedAdConfirmButton}
          skipLabel={t.rewardedAdSkipButton}
          waitLabel={t.rewardedAdWaitLabel}
        />
      </Layout>
    );
  }

  return (
    <Layout onBack={() => navigate("/")}>
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          display: "flex", alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "16px", px: 2, py: 1.25, width: "100%",
        }}>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 14 }}>
            {t.scoreLabel}: {game.score}
          </Typography>
          <IconButton
            onClick={game.togglePause}
            aria-label={game.paused ? t.resumeButtonLabel : t.pauseButtonLabel}
            sx={{
              ml: "auto", width: 36, height: 36, color: "#fff", backgroundColor: "rgba(255,255,255,0.15)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            {game.paused ? <PlayArrowRoundedIcon sx={{ fontSize: 20 }} /> : <PauseRoundedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>

        <GameBoard variant={variant} language={currentLanguage} t={t} game={game} />

        {variant === "numbers" && (
          <GoalsCard
            title={t.goalsTitle}
            thresholds={rollingGoalWindow(game.numberFloor, NUMBER_GOAL_THRESHOLDS[0], NUMBER_GOAL_THRESHOLDS.length)}
            achieved={game.numberFloor}
            nextGoalLabel={t.numberGoalNext}
            completeLabel={t.numberGoalsComplete}
          />
        )}

        {variant === "letters" && (
          <FoundWordsList
            title={t.wordsListTitle}
            emptyLabel={t.wordsListEmpty}
            words={game.foundWords.map((word) => ({ word, points: scoreForWord(word.length) }))}
          />
        )}

        {/* width:"100%" explícito: el contenedor de arriba tiene
            alignItems:"center" (para centrar la card del tablero, que SÍ
            tiene ancho fijo propio) — sin esto, un hijo sin ancho propio
            se achica a su contenido en vez de ocupar todo el ancho
            disponible (mismo padding lateral que el resto de la página). */}
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 1 }}>
          <HouseAdBanner slot="embocalo-game-banner" gameSlug="embocalo" locale={currentLanguage} />
        </Box>
      </Box>
    </Layout>
  );
}
