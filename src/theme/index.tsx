import { ReactNode } from 'react';
import {
  createTheme,
  CssBaseline,
  ThemeOptions,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material';
import typography from './typography';
import palette from './palette';

type Props = {
  children: ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  const themeOptions: ThemeOptions = {
    typography,
    palette,
  };

  const theme = createTheme(themeOptions);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
