import type { SxProps, Theme } from '@mui/material';

export const SideBarStyles: Record<string, SxProps<Theme>> = {
  boxMain: {
    position: 'absolute',
    top: 65,
    width: 320,
    height: 1,
    maxHeight: 'calc(100% - 60px)',
    overflowY: 'auto',
    p: 2,
    bgcolor: 'white',
    boxShadow: 4,
    zIndex: 1300,
    pointerEvents: 'auto',
  },
};
