import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Layout from "../components/Layout";
import { useLanguage } from "../i18n/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <Layout showFooter>
      <Box sx={{ width: "100%", px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontFamily: "Lobster, cursive", fontSize: 28, color: "#fff", textAlign: "center", mt: 1 }}>
          {t.privacyTitle}
        </Typography>

        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {t.privacySections.map((section) => (
            <Box key={section.heading}>
              <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#222", mb: 0.5 }}>{section.heading}</Typography>
              <Typography sx={{ color: "#555", fontSize: 13.5, lineHeight: 1.5 }}>{section.body}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Layout>
  );
}
