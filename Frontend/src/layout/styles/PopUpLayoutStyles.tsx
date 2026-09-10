import type { SxProps, Theme } from '@mui/material';

export const popupStyles: Record<string, SxProps<Theme>> = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
  },

  tabs: {
    display: 'flex',
    gap: 0.75,
  },

  body: {
    display: 'flex',
    width: '100%',
    mt: 2,
    minHeight: 180,
  },

  image: {
    width: { xs: '100%', sm: '40%' },
    minHeight: 160,
    backgroundColor: '#e8f1f5',
    borderRadius: 2,
  },

  data: {
    width: { xs: '100%', sm: '60%' },
    px: { xs: 0, sm: 2 },
    pt: { xs: 2, sm: 0 },
  },

  close: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  bodyEdificioPopUp: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    width: '100%',
    mt: 2,
    minHeight: 180,
  },

  boxMain: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mt: 2,
  },

  datosEdificio: {
    width: { xs: '100%', sm: '100%' },
    px: { xs: 0, sm: 2 },
    pt: { xs: 2, sm: 0 },
  },
};
