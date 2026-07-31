import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLayout } from "./useLayoutContext";

export default function SideBarLayout({ open }: { open: boolean }) {
  const { comunidad, setComunidad } = useLayout();


  const { fondo, setFondo } = useLayout();

  if (!open) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 65,
        width: 320,
        height: 1,
        maxHeight: "calc(100% - 60px)",
        overflowY: "auto",
        p: 2,
        bgcolor: "white",
        boxShadow: 4,
        zIndex: 1300,
        pointerEvents: "auto",
      }}
    >

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Comunidad</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Comunidad</InputLabel>

            <Select
              value={comunidad}
              label="Comunidad"
              onChange={(e) => setComunidad(e.target.value)}
            >
              <MenuItem value="andalucia">Andalucia</MenuItem>
              <MenuItem value="galicia">Galicia</MenuItem>
              <MenuItem value="canarias">Canarias</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Mapa</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Fondo</InputLabel>

            <Select
              value={fondo}
              label="Fondo"
              onChange={(e) => setFondo(e.target.value)}
            >
              <MenuItem value="osm">OpenStreetMap</MenuItem>
              <MenuItem value="google-sat">Google Satélite</MenuItem>
              <MenuItem value="google-hyb">
                Google Satélite Híbrido
              </MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}