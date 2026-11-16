import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Layout from "../components/Layout";
import AdsenseScript from "../components/AdsenseScript";
import CategoryPreview from "../components/CategoryPreview";
import DemoPreview from "../components/DemoPreview";
import Carousel from "../components/Carousel";
import LanguageSelector from "../components/LanguageSelector";
import { isAdFree, purchaseAdFree, syncAdFreeAfterReturn } from "../ads/adFreeEntitlement";
import HouseAdBanner from "../ads/HouseAdBanner";
import HubAdPromoBanner from "../ads/HubAdPromoBanner";
import ShareButtons from "../ads/ShareButtons";
import { useLanguage } from "../i18n/LanguageContext";
import { track } from "../lib/analytics";
import { Variant } from "../game/types";
import { getDaysSinceLastPlayed } from "../utils/lastPlayedState";
import { getVariantRecord, VariantRunRecord } from "../utils/variantRecordState";
import { getWordsRecord, WordsRecord } from "../utils/wordsRecordState";
import { buildEmbocaloRecordPngFile } from "../utils/shareImage";

const ACCENT = "#e74c3c";
const CARD_BG = "#eb6f62";

const CATEGORIES: Variant[] = ["fruits", "numbers", "letters"];

// UTM: distingue en GA4 del hub cuánto tráfico de "volver" viene
// específicamente del header de este juego — mismo criterio que
// encastraloReact.
const HUB_URL = "https://www.boludeando.com/?utm_source=embocalo&utm_medium=cross_game&utm_campaign=header_back";
const SHARE_URL = "https://embocalo.com";

function handleHubLinkClick() {
  track("select_content", { content_type: "cross_game", item_id: "boludeando_hub" });
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, currentLanguage } = useLanguage();

  const hubUrlWithLang = `${HUB_URL}&lang=${currentLanguage}`;

  const [adFree, setAdFree] = useState(false);
  const [buyingAdFree, setBuyingAdFree] = useState(false);

  useEffect(() => {
    if (searchParams.get("adfree_return") === "1") {
      syncAdFreeAfterReturn().then((active) => {
        setAdFree(active);
        setSearchParams(
          (prev) => {
            prev.delete("adfree_return");
            return prev;
          },
          { replace: true },
        );
      });
    } else {
      isAdFree().then(setAdFree);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveAds = async () => {
    setBuyingAdFree(true);
    const returnUrl = `${window.location.origin}${window.location.pathname}?adfree_return=1`;
    const checkoutUrl = await purchaseAdFree(returnUrl);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setBuyingAdFree(false);
    }
  };

  const categoryMeta: Record<Variant, { label: string; description: string }> = {
    fruits: { label: t.categoryFruitsLabel, description: t.categoryFruitsDescription },
    numbers: { label: t.categoryNumbersLabel, description: t.categoryNumbersDescription },
    letters: { label: t.categoryLettersLabel, description: t.categoryLettersDescription },
  };

  const [numbersRecord, setNumbersRecord] = useState<VariantRunRecord | null>(null);
  const [fruitsRecord, setFruitsRecord] = useState<VariantRunRecord | null>(null);
  const [wordsRecord, setWordsRecord] = useState<WordsRecord | null>(null);

  useEffect(() => {
    const refresh = () => {
      setNumbersRecord(getVariantRecord("numbers"));
      setFruitsRecord(getVariantRecord("fruits"));
      // El récord de letras es por idioma (el diccionario cambia por
      // completo entre es/en/pt) — hay que releerlo también cuando el
      // jugador cambia de idioma, no solo al volver a enfocar la pestaña.
      setWordsRecord(getWordsRecord(currentLanguage));
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [currentLanguage]);

  const daysSincePlayed = getDaysSinceLastPlayed();
  const nowHour = new Date().getHours();
  const timeGreeting = nowHour < 12 ? t.greetingMorning : nowHour < 20 ? t.greetingAfternoon : t.greetingEvening;
  const greeting =
    daysSincePlayed != null && daysSincePlayed > 1
      ? `${timeGreeting} ${t.daysWithoutPlayingMessage(daysSincePlayed)}`
      : timeGreeting;

  function goToVariant(variant: Variant) {
    track("select_content", { content_type: "category", item_id: variant });
    navigate(`/game?variant=${variant}`);
  }

  const [sharingRecord, setSharingRecord] = useState(false);
  const canShareRecord = typeof navigator !== "undefined" && typeof navigator.share === "function";

  // Arma la imagen real del récord (ver shareImage.ts) y la comparte con
  // navigator.share — un link de wa.me solo puede mandar texto, nunca una
  // imagen adjunta (reporte real: "el share de Embocalo no tiene la
  // tarjeta como el de Encastralo").
  async function handleShareRecord(shareVariant: Variant, method: "whatsapp" | "facebook") {
    if (!canShareRecord || sharingRecord) return;

    let scoreValue: string;
    let captions: string[];
    let words: string[] = [];
    let wordsSectionLabel: string | undefined;

    if (shareVariant === "letters" && wordsRecord) {
      scoreValue = String(wordsRecord.score);
      captions = [t.recordScoreCaption(wordsRecord.score)];
      if (wordsRecord.wordsFound > 0) captions.push(t.recordWordsCaption(wordsRecord.wordsFound));
      if (wordsRecord.longestWord) captions.push(t.recordLongestWordCaption(wordsRecord.longestWord));
      words = wordsRecord.words ?? [];
      wordsSectionLabel = words.length > 0 ? `${t.wordsListTitle.toUpperCase()} (${words.length})` : undefined;
    } else if (shareVariant === "numbers" && numbersRecord) {
      scoreValue = String(numbersRecord.score);
      captions = [t.recordScoreCaption(numbersRecord.score)];
      if (numbersRecord.clears > 0) {
        captions.push(t.recordNumberHighlightCaption(numbersRecord.highlight));
        captions.push(t.recordNumberClearsCaption(numbersRecord.clears));
      }
    } else if (shareVariant === "fruits" && fruitsRecord) {
      scoreValue = String(fruitsRecord.score);
      captions = [t.recordScoreCaption(fruitsRecord.score)];
      if (fruitsRecord.clears > 0) {
        captions.push(t.recordFruitHighlightCaption(fruitsRecord.highlight));
        captions.push(t.recordFruitClearsCaption(fruitsRecord.clears));
      }
    } else {
      return;
    }

    setSharingRecord(true);
    track("share", { method, context: "record", variant: shareVariant });
    try {
      const imageFile = await buildEmbocaloRecordPngFile(
        { title: t.recordTitle, scoreValue, captions, wordsSectionLabel, words },
        "embocalo-record.png",
      );
      const shareData: ShareData = {
        title: "Embocalo",
        text: `${t.shareRecordText(Number(scoreValue))}\n${SHARE_URL}`,
      };
      if (imageFile && (!navigator.canShare || navigator.canShare({ files: [imageFile] }))) {
        shareData.files = [imageFile];
      }
      await navigator.share(shareData);
    } catch {
      // Canceló el panel de compartir sin elegir nada.
    } finally {
      setSharingRecord(false);
    }
  }

  function renderShareButtons(shareVariant: Variant) {
    if (!canShareRecord) return null;
    return (
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1.5 }}>
        <Box
          component="button"
          onClick={() => handleShareRecord(shareVariant, "whatsapp")}
          disabled={sharingRecord}
          aria-label="Compartir por WhatsApp"
          sx={{
            display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: "50%",
            backgroundColor: "#25D366", color: "#fff", border: "none", cursor: "pointer",
            opacity: sharingRecord ? 0.6 : 1,
          }}
        >
          <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.43 1.32 4.92L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.17 8.17 0 0 1-1.25-4.36c0-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.09 0 1.23.9 2.42 1.02 2.58.12.17 1.75 2.67 4.3 3.74.6.26 1.07.41 1.44.52.6.19 1.15.17 1.58.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29-.25-.12-1.48-.73-1.71-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.23-.73-.66-1.23-1.46-1.37-1.71-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.37-.78-1.87-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01Z" />
          </svg>
        </Box>
        <Box
          component="button"
          onClick={() => handleShareRecord(shareVariant, "facebook")}
          disabled={sharingRecord}
          aria-label="Compartir por Facebook"
          sx={{
            display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: "50%",
            backgroundColor: "#1877F2", color: "#fff", border: "none", cursor: "pointer",
            opacity: sharingRecord ? 0.6 : 1,
          }}
        >
          <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z" />
          </svg>
        </Box>
      </Box>
    );
  }

  function renderSimpleRecord(label: string, record: VariantRunRecord | null, kind: "numbers" | "fruits") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ flexShrink: 0, borderRadius: "8px", overflow: "hidden", backgroundColor: "#f3f3f3", p: 0.5 }}>
            <CategoryPreview variant={kind} size={18} />
          </Box>
          {/* Sin alignItems propio: hereda el stretch default del row de
              arriba para igualar el alto de la miniatura, y acá adentro
              space-between reparte el label arriba y el puntaje abajo —
              el mismo número ya dice "puntos", no hace falta repetirlo
              chico debajo. */}
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {label}
            </Typography>
            {record ? (
              <Typography sx={{ fontSize: 42, fontWeight: 900, color: ACCENT, fontFamily: "monospace", lineHeight: 1 }}>
                {record.score}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: 13, color: "#888" }}>{t.recordEmptyBody}</Typography>
            )}
          </Box>
        </Box>
        {record && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography sx={{ fontSize: 13, color: "#888" }}>
              {kind === "numbers" ? t.recordNumberHighlightCaption(record.highlight) : t.recordFruitHighlightCaption(record.highlight)}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#888" }}>
              {kind === "numbers" ? t.recordNumberClearsCaption(record.clears) : t.recordFruitClearsCaption(record.clears)}
            </Typography>
          </Box>
        )}
        {record && renderShareButtons(kind)}
      </Box>
    );
  }

  return (
    <Layout showFooter>
      <AdsenseScript />
      {/* Shell fijo a todo el ancho del viewport (sin estilo propio) que
          centra con flexbox el header real de 480px adentro — mismo
          criterio que encastraloReact. Layout no renderiza su propio
          header en "/" (ver showHeader ahí), así que este bar — que
          vuelve al hub, no a este juego — vive acá, siempre visible. */}
      <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10, display: "flex", justifyContent: "center" }}>
        <Box component="header" sx={{
          display: "flex", alignItems: "center",
          height: 80, px: 2,
          boxSizing: "border-box",
          borderBottom: `2px solid ${ACCENT}`,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          width: { xs: "100%", md: "480px" }, position: "relative",
        }}>
          <Box component="a" href={hubUrlWithLang} onClick={handleHubLinkClick} aria-label="Volver" sx={{ display: "flex", alignItems: "center", zIndex: 1 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path d="M26 6L14 19L26 32" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box
            component="a"
            href={hubUrlWithLang}
            onClick={handleHubLinkClick}
            sx={{
              position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
              fontFamily: "Lobster, cursive", fontSize: 28, color: ACCENT, textDecoration: "none",
            }}
          >
            Boludeando
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pt: "80px", pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h2" sx={{
            color: "#fff", fontWeight: 700, letterSpacing: "1px",
            fontFamily: "Lobster, cursive", textAlign: "center", width: "100%",
          }}>
            {t.appName}
          </Typography>
          <Typography variant="h6" sx={{
            color: "rgba(255,255,255,0.64)", fontStyle: "italic",
            letterSpacing: "2px", textAlign: "center", fontSize: { xs: 18, md: 22 },
          }}>
            {t.tagline}
          </Typography>
        </Box>

        <Typography sx={{ color: "#ffe6e6", fontSize: 18, fontWeight: 600 }}>{greeting}</Typography>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{t.readyToPlayMessage}</Typography>

        {/* Card de juego: animación de la mecánica real de letras (disparo
            + selección de palabra con swipe) + botón Jugar. La card
            CUADRADA es la interna (gris, el "tablero" de la demo) — la
            de afuera (coral) solo la envuelve y se achica a su alto real. */}
        <Box sx={{
          width: "100%", borderRadius: "24px", backgroundColor: CARD_BG,
          p: 2, boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
        }}>
          <Box sx={{
            width: "100%", aspectRatio: "1 / 1", borderRadius: "16px", backgroundColor: "#f3f3f3",
            mb: 2, display: "flex", alignItems: "flex-start", justifyContent: "center", pt: 2,
          }}>
            <DemoPreview />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={() => goToVariant("letters")}
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: "28px !important" }} />}
              sx={{
                backgroundColor: "#fff", color: ACCENT, fontWeight: 800,
                borderRadius: 999, px: 3, py: 1.4, fontSize: 18,
                boxShadow: "0 0 0 4px rgba(255,255,255,0.35), 0 10px 24px rgba(0,0,0,0.4)",
                "&:hover": { backgroundColor: "#fff" },
              }}
            >
              {t.playButton}
            </Button>
          </Box>
        </Box>

        {/* Categorías: las 3 formas de jugar, cada una a su propia partida. */}
        <Box component="section">
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#fff", mb: 1.25 }}>
            {t.categoriesTitle}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {CATEGORIES.map((variant) => (
              <Box
                key={variant}
                onClick={() => goToVariant(variant)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    goToVariant(variant);
                  }
                }}
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  p: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 14px rgba(0,0,0,0.16)" },
                }}
              >
                <Box sx={{ flexShrink: 0, borderRadius: "8px", overflow: "hidden", backgroundColor: "#f3f3f3", p: 0.5 }}>
                  <CategoryPreview variant={variant} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#222", lineHeight: 1.2 }}>
                    {categoryMeta[variant].label}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.3, mt: 0.25 }}>
                    {categoryMeta[variant].description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {!adFree && (
          <HouseAdBanner slot="embocalo-home-double-banner" gameSlug="embocalo" locale={currentLanguage} format="banner_double" />
        )}

        {!adFree && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              size="small"
              onClick={handleRemoveAds}
              disabled={buyingAdFree}
              sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontSize: 13 }}
            >
              {buyingAdFree ? t.removeAdsButtonBuying : t.removeAdsButton}
            </Button>
          </Box>
        )}

        {/* Récord — carrusel con una card por modalidad. */}
        <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#222", mb: 1 }}>
            {t.recordTitle}
          </Typography>
          <Carousel ariaLabel={t.recordTitle}>
            {renderSimpleRecord(categoryMeta.numbers.label, numbersRecord, "numbers")}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {categoryMeta.letters.label}
              </Typography>
              {wordsRecord ? (
                <>
                  <Typography sx={{ fontSize: 42, fontWeight: 900, color: ACCENT, fontFamily: "monospace" }}>
                    {wordsRecord.score}
                  </Typography>
                  {wordsRecord.wordsFound > 0 && (
                    <Typography sx={{ fontSize: 13, color: "#888" }}>
                      {t.recordWordsCaption(wordsRecord.wordsFound)}
                    </Typography>
                  )}
                  {wordsRecord.longestWord && (
                    <Typography sx={{ fontSize: 13, color: "#888" }}>
                      {t.recordLongestWordCaption(wordsRecord.longestWord)}
                    </Typography>
                  )}
                  {(wordsRecord.words ?? []).length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                      {wordsRecord.words.map((word, i) => (
                        <Box key={i} sx={{
                          px: 1.5, py: 0.5, borderRadius: "6px",
                          backgroundColor: `${ACCENT}18`, border: `1px solid ${ACCENT}55`,
                        }}>
                          <Typography sx={{ color: ACCENT, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
                            {word}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {renderShareButtons("letters")}
                </>
              ) : (
                <Typography sx={{ fontSize: 13, color: "#888" }}>{t.recordEmptyBody}</Typography>
              )}
            </Box>

            {renderSimpleRecord(categoryMeta.fruits.label, fruitsRecord, "fruits")}
          </Carousel>
        </Box>

        {!adFree && (
          <HouseAdBanner slot="embocalo-home-double-banner-2" gameSlug="embocalo" locale={currentLanguage} format="banner_double" />
        )}

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>{t.whatIsTitle}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{t.whatIsBody}</Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>{t.howToPlayTitle}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7, mb: 1 }}>🍎 {t.howToPlayFruits}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7, mb: 1 }}>🔢 {t.howToPlayNumbers}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>🔤 {t.howToPlayLetters}</Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}>{t.faqTitle}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {t.faq.map((item) => (
              <Box key={item.q}>
                <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>{item.q}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>{item.a}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {!adFree && (
          <>
            <HubAdPromoBanner locale={currentLanguage} />
            <ShareButtons locale={currentLanguage} />
          </>
        )}
      </Box>

      <LanguageSelector />
    </Layout>
  );
}
