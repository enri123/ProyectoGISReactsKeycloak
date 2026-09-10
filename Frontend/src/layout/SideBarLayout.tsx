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
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLayout } from '../hooks/useLayoutContext';
import { useAuth } from '../auth/useAuth';
import { SideBarStyles } from './styles/SideBarLayoutStyles.tsx';

export default function SideBarLayout({ open }: { open: boolean }) {
  const { comunidad, setComunidad } = useLayout();

  const { fondo, setFondo } = useLayout();

  const { authenticated, user } = useAuth();

  if (!open) {
    return null;
  }

  return (
    <Box sx={SideBarStyles.boxMain}>
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
              {authenticated &&
                (user?.realm_access?.roles.includes('algeciras') ||
                  user?.realm_access?.roles.includes('user_creation')) && (
                  <MenuItem value="algeciras">Algeciras</MenuItem>
                )}
              {authenticated &&
                (user?.realm_access?.roles.includes('torremolinos') ||
                  user?.realm_access?.roles.includes('user_creation')) && (
                  <MenuItem value="torremolinos">Torremolinos</MenuItem>
                )}
              {authenticated &&
                (user?.realm_access?.roles.includes('andalucia') ||
                  user?.realm_access?.roles.includes('user_creation')) && (
                  <MenuItem value="andalucia">Andalucia</MenuItem>
                )}
              {authenticated &&
                (user?.realm_access?.roles.includes('galicia') ||
                  user?.realm_access?.roles.includes('user_creation')) && (
                  <MenuItem value="galicia">Galicia</MenuItem>
                )}
              {authenticated &&
                (user?.realm_access?.roles.includes('canarias') ||
                  user?.realm_access?.roles.includes('user_creation')) && (
                  <MenuItem value="canarias">Canarias</MenuItem>
                )}
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

            <Select value={fondo} label="Fondo" onChange={(e) => setFondo(e.target.value)}>
              <MenuItem value="osm">OpenStreetMap</MenuItem>
              <MenuItem value="google-sat">Google Satélite</MenuItem>
              <MenuItem value="google-hyb">Google Satélite Híbrido</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
