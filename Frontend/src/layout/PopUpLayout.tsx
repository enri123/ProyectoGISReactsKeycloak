import { Box, Button, Modal, Typography, Select, MenuItem, Link } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from 'react';
import { useLayout } from '../hooks/useLayoutContext';
import { popupStyles } from './styles/PopUpLayoutStyles.tsx';

export default function PopUpLayout({ open }: { open: boolean }) {
  const { selectedFeatureProperties, setPopupOpen } = useLayout();
  const [activeTab, setActiveTab] = useState('edificio');
  const [activeBuild, setActiveBuild] = useState('osm');

  const riskColors: Record<string, string> = {
    nulo: 'rgba(128, 128, 128, 0.5)',
    bajo: 'rgba(46, 204, 113, 0.5)',
    medio: 'rgba(241, 196, 15, 0.5)',
    alto: 'rgba(231, 76, 60, 0.5)',
  };

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={() => setPopupOpen(false)}>
      <Box sx={popupStyles.modal}>
        <Typography variant="h6" component="h2" sx={{ textAlign: 'center' }}>
          Edificio seleccionado: {String(selectedFeatureProperties?.localid ?? 'Sin datos')}
        </Typography>

        <Box sx={popupStyles.boxMain}>
          <Box className="botonesPopUp" sx={popupStyles.tabs}>
            <Button
              size="small"
              onClick={() => setActiveTab('edificio')}
              sx={{
                minWidth: 0,
                px: 1.25,
                py: 0.5,
                borderRadius: 5,
                backgroundColor: activeTab === 'edificio' ? '#00bcd4' : '#b2ebf2',
              }}
            >
              Edificio
            </Button>
            <Button
              size="small"
              onClick={() => setActiveTab('uso')}
              sx={{
                minWidth: 0,
                px: 1.25,
                py: 0.5,
                borderRadius: 5,
                backgroundColor: activeTab === 'uso' ? '#00bcd4' : '#b2ebf2',
              }}
            >
              Uso
            </Button>
            <Button
              size="small"
              onClick={() => setActiveTab('resumen')}
              sx={{
                minWidth: 0,
                px: 1.25,
                py: 0.5,
                borderRadius: 5,
                backgroundColor: activeTab === 'resumen' ? '#00bcd4' : '#b2ebf2',
              }}
            >
              Resumen
            </Button>
          </Box>

          {(activeTab === 'uso' || activeTab === 'resumen' || activeTab === 'email') && (
            <Box sx={popupStyles.boxMain}>
              <Select
                className="riesgoPopUp"
                label="Uso constructivo"
                value={activeBuild}
                onChange={(e) => setActiveBuild(e.target.value)}
              >
                <MenuItem value="osm" selected>
                  OpenStreetMap
                </MenuItem>
                <MenuItem value="google-sat">Google Satélite</MenuItem>
                <MenuItem value="google-hyb">Google Satélite Híbrido</MenuItem>
              </Select>

              <Box className="riesgoPopUp" sx={popupStyles.riesgoPopUp}>
                Clasificación preliminar
              </Box>

              <Button onClick={() => setActiveTab('email')}>
                <MailIcon />
              </Button>
            </Box>
          )}

          <Box
            className="riesgoPopUp"
            sx={{
              ml: 'auto',
              px: 2,
              py: 1,
              borderRadius: 5,
              backgroundColor:
                riskColors[String(selectedFeatureProperties?.riesgo ?? 'nulo')] ?? riskColors.nulo,
              color: '#3d2f00',
              fontWeight: 700,
              textTransform: 'capitalize',
            }}
          >
            {String(selectedFeatureProperties?.riesgo ?? 'nulo')}
          </Box>
        </Box>

        <Box className="bodyEdificioPopUp" sx={popupStyles.bodyEdificioPopUp}>
          {activeTab === 'edificio' && (
            <Box sx={popupStyles.bodyEdificioPopUp}>
              <Box className="imagen" sx={popupStyles.image}>
                <img
                  src={String(selectedFeatureProperties?.documentlink)}
                  alt="Descripción"
                  style={{ height: '100%', width: '100%' }}
                />
                <Typography sx={{ mt: 1 }}>
                  Fuente de la imagen:{' '}
                  <Link href={String(selectedFeatureProperties?.documentlink)} target="_blank">
                    Catastro
                  </Link>{' '}
                  Ver{' '}
                  <Link href={String(selectedFeatureProperties?.informationsystem)} target="_blank">
                    Ficha Catastral
                  </Link>
                </Typography>
              </Box>
              <Box className="datosEdificio" sx={popupStyles.data}>
                <Box>
                  <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                    <strong>Datos del Edificio </strong>
                    <Link
                      href="https://www.gisgal.com/accordions/censo-preliminar-de-amianto-preguntas-frecuentes"
                      target="_blank"
                    >
                      <HelpIcon />
                    </Link>
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>Municipio: </strong>
                    {String(selectedFeatureProperties?.municipality ?? 'Sin datos')}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>Ref. catastral parcela: </strong>
                    {String(selectedFeatureProperties?.localid ?? 'Sin datos')}
                  </Typography>
                  <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                    <strong>Usos presentes </strong>
                    <Link
                      href="https://www.gisgal.com/accordions/censo-preliminar-de-amianto-preguntas-frecuentes"
                      target="_blank"
                    >
                      <HelpIcon />
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 'uso' && (
            <Box className="datosEdificio" sx={popupStyles.datosEdificio}>
              <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                <strong>Informacion sobre el uso </strong>
                <Link
                  href="https://www.gisgal.com/accordions/censo-preliminar-de-amianto-preguntas-frecuentes"
                  target="_blank"
                >
                  <HelpIcon />
                </Link>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Numero de Locales: </strong>
                {String(selectedFeatureProperties?.numberofbuildingunits ?? 'Sin datos')}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Superficie: </strong>
                {String(selectedFeatureProperties?.value ?? 'Sin datos')} m2
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Antigüedad: </strong>
                {String(selectedFeatureProperties?.beginning ?? 'Sin datos')}
              </Typography>
            </Box>
          )}

          {activeTab === 'resumen' && (
            <Box className="datosEdificio" sx={popupStyles.datosEdificio}>
              <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                <strong>Cálculo final del riesgo </strong>
                <Link
                  href="https://www.gisgal.com/accordions/censo-preliminar-de-amianto-preguntas-frecuentes"
                  target="_blank"
                >
                  <HelpIcon />
                </Link>
              </Typography>
            </Box>
          )}

          {activeTab === 'email' && (
            <Box className="datosEdificio" sx={popupStyles.datosEdificio}>
              <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                <strong>Enviar mensaje al ayuntamiento </strong>
                <Link
                  href="https://www.gisgal.com/accordions/censo-preliminar-de-amianto-preguntas-frecuentes"
                  target="_blank"
                >
                  <HelpIcon />
                </Link>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Numero de Locales: </strong>
                {String(selectedFeatureProperties?.numberofbuildingunits ?? 'Sin datos')}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Superficie: </strong>
                {String(selectedFeatureProperties?.value ?? 'Sin datos')} m2
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Antigüedad: </strong>
                {String(selectedFeatureProperties?.beginning ?? 'Sin datos')}
              </Typography>
            </Box>
          )}
        </Box>

        <Box className="cerrarPopUp" sx={popupStyles.close}>
          <Button sx={{ mt: 3 }} variant="contained" onClick={() => setPopupOpen(false)}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
