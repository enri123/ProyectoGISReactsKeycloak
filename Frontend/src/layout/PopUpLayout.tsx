import { Box, Button, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import { useLayout } from '../hooks/useLayoutContext';
import { popupStyles } from './styles/PopUpLayoutStyles.tsx';
import miImagen from '../assets/tralalero-tralala_15_630x420.png';

export default function PopUpLayout({ open }: { open: boolean }) {
  const { selectedFeatureProperties, setPopupOpen } = useLayout();
  const [activeTab, setActiveTab] = useState('edificio');
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
          Edificio seleccionado: {String(selectedFeatureProperties?.id ?? 'Sin datos')}
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
                <img src={miImagen} alt="Descripción" style={{ height: '100%', width: '100%' }} />
              </Box>
              <Box className="datosEdificio" sx={popupStyles.data}>
                <Box>
                  <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                    <strong>Datos del Edificio</strong>
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>Municipio: </strong>
                    {String(selectedFeatureProperties?.municipality ?? 'Sin datos')}
                  </Typography>
                  <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                    <strong>Usos presentes</strong>
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 'uso' && (
            <Box className="datosEdificio" sx={popupStyles.datosEdificio}>
              <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                <strong>Informacion sobre el uso</strong>
              </Typography>
            </Box>
          )}

          {activeTab === 'resumen' && (
            <Box className="datosEdificio" sx={popupStyles.datosEdificio}>
              <Typography variant="h6" component="h4" sx={{ mt: 1 }}>
                <strong>Cálculo final del riesgo</strong>
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
