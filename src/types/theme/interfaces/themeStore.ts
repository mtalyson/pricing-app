import type { Theme } from './theme';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initialize: () => void;
}
